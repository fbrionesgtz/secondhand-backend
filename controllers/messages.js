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

  Message.findOne({
    sender: req.userId,
    recipient: recipientId,
  })
    .then((convo) => {
      if (!convo) {
        const newConvo = new Message({
          sender: req.userId,
          recipient: recipientId,
          messages: [{ content: message }],
        });

        return newConvo.save();
      }

      convo.messages = [...convo.messages, { content: message }];

      return convo.save();
    })
    .then((convo) => {
      res.status(200).json({ message: "Message sent.", convo });
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

  Message.findOne({
    sender: req.userId,
    recipient: recipientId,
  })
    .then((convo) => {
      if (!convo) {
        const error = new Error("No conversation found");
        error.statusCode = 401;
        throw error;
      }

      res.status(200).json({ message: "Conversation found", convo });
    })
    .catch((err) => {
      if (!err.satusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.getUserConvos = (req, res, next) => {
  Message.find({ sender: req.userId })
    .select("recipient -_id")
    .then((recipients) => {
      if (!recipients) {
        res
          .status(200)
          .json({ message: "User does't have conversations yet." });
      }

      const rescipientsIds = recipients.map((r) => {
        return r.recipient;
      });

      User.find({ _id: { $in: rescipientsIds } })
        .select("firstName lastName profileImage")
        .then((users) => {
          res.status(200).json({ message: "Conversations found.", users });
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
