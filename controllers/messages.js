const { validationResult } = require("express-validator");
const Message = require("../model/Message");
const User = require("../model/User");

exports.sendMessage = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = error.array;
    throw error;
  }

  const recipientId = req.params.recipientId;
  const message = req.body.message;
  const sentAt = req.body.sentAt;

  Message.findOne({
    sender: req.userId,
    recipient: recipientId,
  })
    .then((convo) => {
      if (!convo) {
        const newConvo = new Message({
          sender: req.userId,
          recipient: recipientId,
          messages: [{ content: message, sender: req.userId, sentAt: sentAt }],
        });

        return newConvo.save();
      }

      convo.messages = [
        ...convo.messages,
        { content: message, sender: req.userId, sentAt: sentAt },
      ];

      return convo.save();
    })
    .then((convo) => {
      res.status(200).json({
        message: {
          _id: convo.messages[convo.messages.length - 1]._id,
          content: message,
          sender: req.userId,
        },
      });
    })
    .catch((err) => {
      if (!err.satusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.getConvo = (req, res, next) => {
  const recipientId = req.params.recipientId;

  Message.find({
    $or: [
      { sender: req.userId, recipient: recipientId },
      { sender: recipientId, recipient: req.userId },
    ],
  })
    .select("messages -_id")
    .then((convo) => {
      if (!convo) {
        const error = new Error("No conversation found");
        error.statusCode = 404;
        throw error;
      }

      const messages =
        convo[0] && convo[1]
          ? [...convo[0].messages, ...convo[1].messages].sort((a, b) => {
              return a.sentAt - b.sentAt;
            })
          : convo[0] && !convo[1]
          ? [...convo[0].messages]
          : !convo[0] && convo[1] && [...convo[1].messages];

      res.status(200).json({
        message: "Conversation found",
        convo: { messages },
      });
    })
    .catch((err) => {
      if (!err.satusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.getUserConvos = (req, res, next) => {
  Message.find({ $or: [{ sender: req.userId }, { recipient: req.userId }] })
    .select("recipient sender -_id")
    .then((users) => {
      if (!users) {
        return res
          .status(200)
          .json({ message: "User does't have conversations yet." });
      }

      const userIds = users.map((user) => {
        if (user.recipient.toString() !== req.userId) {
          return user.recipient.toString();
        }
        return user.sender.toString();
      });

      User.find()
        .select("firstName lastName profileImage")
        .then((users) => {
          const convos = users.filter((user) => {
            return userIds.includes(user._id.toString());
          });

          res
            .status(200)
            .json({ message: "Conversations found.", allUsers: users, convos });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      if (!err.satusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};
