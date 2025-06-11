const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditData, validatePassword } = require("../utils/validation");
const bcrypt = require("bcrypt");

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      message: `Successfully fetched the ${user.firstName} user`,
      data: user,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateEditData(req);
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res.json({
      message: `Successfully edited the ${loggedInUser.firstName} user`,
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

profileRouter.patch("/profile/updatepassword", userAuth, async (req, res) => {
  try {
    validatePassword(req);
    const loggedInUser = req.user;
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    loggedInUser.password = passwordHash;
    await loggedInUser.save();
    res.json({
      message: `Successfully update the password for ${loggedInUser.firstName}`,
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});
module.exports = profileRouter;
