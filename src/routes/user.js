const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionModel = require("../models/connection");
const userRouter = express.Router();
const User = require("../models/user");

userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const requestReceived = await ConnectionModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName", "imageUrl", "aboutUs"]); // Populate with user details
    if (requestReceived.length) {
      res.json({
        message: "Connection requests received successfully",
        data: requestReceived,
      });
    } else {
      res.status(404).send("No connection requests received");
    }
  } catch (error) {
    res.status(400).send(`Something went wrong: ${error.message}`);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionModel.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", ["firstName", "lastName", "imageUrl", "aboutUs"])
      .populate("toUserId", ["firstName", "lastName", "imageUrl", "aboutUs"]);
    if (connections.length) {
      const data = connections.map((connection) => {
        if (
          connection.fromUserId._id.toString() === loggedInUser._id.toString()
        ) {
          return connection.toUserId;
        }
        return connection.fromUserId;
      });
      res.json({
        message: "Connections fetched successfully",
        data: data,
      });
    } else {
      res.status(404).send("No connections found");
    }
  } catch (error) {
    res.status(400).send(`Something went wrong: ${error.message}`);
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    // Users should see all cards expect the below
    // 1. Their own profile
    // 2. Own connections
    // 3. Ignored connections
    // 4. Rejected connections
    // 5. Already sent connection requests

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit; // Limit to a maximum of 50
    const skip = (page - 1) * limit;
    const loggedInUser = req.user;
    const connections = await ConnectionModel.find({
      $or: [
        {
          fromUserId: loggedInUser._id,
        },
        { toUserId: loggedInUser._id },
      ],
    })
      .select("fromUserId toUserId")
      .populate("fromUserId", ["firstName"])
      .populate("toUserId", ["firstName"]);

    const hideUsersFromFeed = new Set();
    connections.forEach((connection) => {
      hideUsersFromFeed.add(connection.fromUserId._id.toString());
      hideUsersFromFeed.add(connection.toUserId._id.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $ne: loggedInUser._id } },
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
      ],
    })
      .skip(skip)
      .limit(limit);

    res.json({
      message: "Feeds fetched successfully",
      data: users,
    });
  } catch (error) {
    res.status(400).send(`Something went wrong: ${error.message}`);
  }
});

module.exports = userRouter;
