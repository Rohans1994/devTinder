const mongoose = require("mongoose");

async function connectDB() {
  await mongoose.connect(
    "mongodb+srv://rohansonawane555:sV09mWCMg1FjaTgw@nodetinder.pezhlvb.mongodb.net/devTinder"
  );
}

module.exports = connectDB;
