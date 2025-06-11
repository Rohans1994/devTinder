const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
};

const validateEditData = (req) => {
  const validFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "imageUrl",
    "aboutUs",
  ];
  const isValid = Object.keys(req.body).every((key) =>
    validFields.includes(key)
  );
  if (!isValid) {
    throw new Error("Requested fields cannot be edited");
  }
  return isValid;
};

const validatePassword = (req) => {
  const isValidPassword = validator.isStrongPassword(req.body.password);
  /* const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const isValidPassword = regex.test(req.body.password); */
  console.log(`isValidPassword - ${isValidPassword}`);
  if (!isValidPassword) {
    throw new Error("Password criteria is not fulfilled");
  }
  return isValidPassword;
};

module.exports = { validateSignUpData, validateEditData, validatePassword };
