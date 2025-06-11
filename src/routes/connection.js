const express = require("express");
const { userAuth } = require("../middlewares/auth");
const connectionRouter = express.Router();
const ConnectionModel = require("../models/connection");

// post request to send a connection request
// This endpoint allows a user to send a connection request to another user
connectionRouter.post(
  "/request/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const status = req.params.status;
      const toUserId = req.params.toUserId;
      const allowedStatuses = ["interested", "ignored"];
      if (!allowedStatuses.includes(status)) {
        throw new Error(`Invalid status type`);
      }
      // Instead of the below commented code, we can use the pre save hook in the model
      /* if (fromUserId.equals(toUserId)) {
        // If the fromUserId and toUserId are the same, throw an error
        throw new Error(`Cannot send connection request to self`);
      } */
      const isAlreadyExistingConnection = await ConnectionModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (isAlreadyExistingConnection) {
        throw new Error(
          `There is already a connection request between these users`
        );
      }
      const connectionOnject = new ConnectionModel({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionOnject.save();
      res.json({ message: `Connection request successfully sent`, data: data });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);

// post request to accept or reject a connection request
connectionRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const { status, requestId } = req.params;
      const allowedStatuses = ["accepted", "rejected"];
      if (!allowedStatuses.includes(status)) {
        throw new Error(`Invalid status type`);
      }
      const connectionRequest = await ConnectionModel.findOne({
        _id: requestId,
        toUserId: user._id,
        status: "interested", // Only interested requests can be accepted or rejected
      });

      if (!connectionRequest) {
        throw new Error(`Connection request not found or already processed`);
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({
        message: `Connection request successfully ${status}`,
        data: data,
      });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);
connectionRouter.pos;

module.exports = connectionRouter;
