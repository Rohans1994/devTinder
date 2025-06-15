const express = require("express");
const chatRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");

chatRouter.get(
  "/getchathistory/:targetUserId/:targetFirstName",
  userAuth,
  async (req, res) => {
    try {
      const { targetUserId, targetFirstName } = req.params;
      const userId = req.user._id;
      let chat = await Chat.findOne({
        $and: [
          { participants: { $elemMatch: { userId: userId } } },
          { participants: { $elemMatch: { userId: targetUserId } } },
        ],
      });
      if (!chat) {
        chat = new Chat({
          participants: [
            { userId: userId, firstName: req.user.firstName },
            { userId: targetUserId, firstName: targetFirstName },
          ],
          messages: [],
        });
        await chat.save();
      }

      res.json({
        message: "Chat retrieved successfully",
        data: chat,
      });
    } catch (error) {
      res.status(400).send("Something went wrong");
    }
  }
);

module.exports = chatRouter;
