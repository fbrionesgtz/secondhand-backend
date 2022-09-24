const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../model/User");
const isAuth = require("../middleware/is-auth");
const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("E-Mail address already exists.");
          }
        });
      })
      .normalizeEmail(),
    body("firstName").trim().not().isEmpty(),
    body("lastName").trim().not().isEmpty(),
    body("password").trim().isLength({ min: 8 }),
    body("phoneNumber").isMobilePhone(),
  ],
  authController.signUp
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").trim().isLength({ min: 8 })],
  authController.logIn
);

router.get("/user", isAuth, authController.getUser);

router.get("/user/:userId", isAuth, authController.getUser);

router.put("/user", isAuth, authController.updateUser);

module.exports = router;
