const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");

authRouter.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, password, age, gender } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({
    firstName,
    lastName,
    emailId,
    age,
    gender,
    password: passwordHash,
  });
  try {
    validateSignUpData(req);
    const result = await user.save();
    const token = await result.getJWT(); // We can also offload the JWT token creation directly to schema methods
    res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) }); // cookie will be removed after 8 hours
    res.send({ message: "Sign Up Successful", data: result });
  } catch (error) {
    res.status(400).send(`Error adding user:- ${error.message}`);
  }
});

authRouter.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    // const result = await bcrypt.compare(password, user.password );   // This is also the best way to validate password
    const result = await user.validatePassword(password);
    if (!result) {
      throw new Error("Invalid Credentials");
    }
    // const token = await jwt.sign({_id: user._id}, "rohansecret@123", {expiresIn: '1h'});          // This is also the best way to create JWT token
    const token = await user.getJWT(); // We can also offload the JWT token creation directly to schema methods
    res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) }); // cookie will be removed after 8 hours
    res.send({ message: "Login Successful", data: user });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("Logout Successful");
});

module.exports = authRouter;
