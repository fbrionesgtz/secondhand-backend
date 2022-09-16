const User = require("../model/User");
const path = require("path");
const fs = require("fs");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = error.array;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const phoneNumber = req.body.phoneNumber;
  const profileImage = req.file.path.replace("\\", "/");

  bcrypt
    .hash(password, 12)
    .then((hashedPass) => {
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPass,
        phoneNumber,
        profileImage,
      });

      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created", user: result._id });
    })
    .catch((err) => {
      if (!err.satusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.logIn = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = error.array;
    throw error;
  }

  const email = req.body.email;
  const password = req.body.password;
  let currUser;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("A user with this email could not be found.");
        error.statusCode = 401;
        throw error;
      }
      currUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password.");
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign(
        {
          email: currUser.email,
          userId: currUser._id.toString(),
        },
        "21cVe1fQZBwMG6JebeKhsQ3dYajBOg2Hwj3QWh1yP9FcGUj0WYaYKXhepycz",
        { expiresIn: "1h" }
      );

      res.status(200).json({ token: token, userId: currUser._id.toString() });
    })
    .catch((err) => {
      if (!err.satusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.getUser = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        message: "User fetched",
        user: {
          profileImage: user.profileImage,
          coverImage: user.coverImage,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          products: user.products,
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

exports.updateUser = (req, res, next) => {
  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;
  const coverImage = req.file.path.replace("\\", "/");

  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }

      if (user.coverImage) {
        clearImage(user.coverImage);
      }

      user.firstName = firstName ? firstName : user.firstName;
      user.lastName = lastName ? lastName : user.lastName;
      user.email = email ? email : user.email;
      user.phoneNumber = phoneNumber ? phoneNumber : user.phoneNumber;
      user.coverImage = coverImage ? coverImage : user.coverImage;
      return user.save();
    })
    .then((user) => {
      res.status(200).json({
        message: "User updated",
        user: {
          coverImage: user.coverImage,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          products: user.products,
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

const clearImage = (imagePath) => {
  imagePath = path.join(__dirname, "..", imagePath);
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
};
