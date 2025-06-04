const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // This field references the user who is sending the connection request and the ref is case-sensitive
      // so it should match the model name exactly
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // This field references the user who is receiving the connection request and the ref is case-sensitive
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  { timestamps: true }
);

connectionSchema.index({ fromUserId: 1, toUserId: 1 });

// Pre-save hook to validate connection request
// This will ensure that a user cannot send a connection request to themselves
connectionSchema.pre("save", async function (next) {
  const connection = this;
  if (connection.fromUserId.equals(connection.toUserId)) {
    throw new Error(`Cannot send connection request to self`);
  }
  next();
});

const connectionModel = new mongoose.model(
  "ConnectionRequest",
  connectionSchema
);

module.exports = connectionModel;
