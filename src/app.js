const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const connectionRouter = require("./routes/connection");
const userRouter = require("./routes/user");
const http = require("http");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

require("dotenv").config();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent
  })
);

app.use(
  "/",
  authRouter,
  profileRouter,
  connectionRouter,
  userRouter,
  chatRouter
);

const server = http.createServer(app);
initializeSocket(server);

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length) {
      res.send(users);
    }
    res.status(400).send("No data found");
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

/* app.get("/user", async (req, res) => {
  try {
    const emailId = req.body.emailId;
    const user = await User.findOne({ emailId: emailId });
    if (user) {
      res.send(user);
    } else {
      res.status(404).send("No data found");
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
}); */

app.delete("/user", async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

app.patch("/user", async (req, res) => {
  try {
    const userId = req.body.userId;
    const data = req.body;
    const user = await User.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true,
    });
    console.log(user);
    res.send("User Updated successfully");
  } catch (error) {
    res.status(400).send(`Something went wrong:- ${error.message}`);
  }
});

app.get("/test", (req, res) => {
  res.send({ Name: "Rohan", LastName: "Sonawane" });
});

app.post("/test", (req, res) => {
  res.send("Data saved successfully");
});

// http://localhost:3000/params/1/rohan
app.get("/params/:id/:name", (req, res) => {
  console.log(req.params);
  res.send("params logged successfully");
});

// http://localhost:3000/query?id=11&name=RohanSonawane
app.get("/query", (req, res) => {
  console.log(req.query);
  res.send("params logged successfully");
});

// Multiple route handlers
app.get(
  "/multipleroutehandler",
  (req, res, next) => {
    console.log("Route handler 1");
    //res.send("params logged successfully");
    next(); // It goes to next route handler
  },
  (req, res, next) => {
    console.log("Route handler 2");
    //res.send("params logged successfully");
    next();
  },
  (req, res) => {
    console.log("Route handler 3");
    res.send("Response from route handler 3");
  }
);

// This will match all the HTTP method API calls to /test whether it is GET/POST/DELETE etc
app.use("/test", (req, res) => {
  res.send("Hello from test");
});
app.use((req, res) => {
  res.send("Hello from devtinder");
});

connectDB()
  .then((data) => {
    console.log("DB connected successfully");
    server.listen(process.env.PORT, (req, res) => {
      console.log("Server started successfully");
    });
  })
  .catch((err) => {
    console.error("DB connection failed", err);
  });
