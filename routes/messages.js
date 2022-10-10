const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
const messageController = require("../controllers/messages");
const isAuth = require("../middleware/is-auth");

router.post(
  "/send/:recipientId",
  isAuth,
  [body("message").trim().not().isEmpty()],
  messageController.sendMessage
);

router.get("/convo/:recipientId", isAuth, messageController.getConvo);

router.get("/user-convos", isAuth, messageController.getUserConvos);

module.exports = router;
