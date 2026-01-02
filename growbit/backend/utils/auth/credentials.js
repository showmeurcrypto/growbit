const validator = require("validator");
const { logger } = require("../logger");

const authCheckLoginData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.captcha === undefined ||
    data.captcha === null ||
    typeof data.captcha !== "string"
  ) {
    throw new Error("Your provided captcha token is invalid.");
  } else if (!data.email === undefined || typeof data.email !== "string") {
    throw new Error("Your provided email is invalid.");
  } else if (
    data.password === undefined ||
    typeof data.password !== "string" ||
    data.password.length <= 4
  ) {
    throw new Error("Your provided password is invalid.");
  }
};

const authCheckPostCredentialsUser = (userDatabase, isMatch) => {
  if (userDatabase === null || isMatch !== true) {
    throw new Error("Your provided credentials are invalid.");
  }
};

const authCheckPostCredentialsRegisterData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.captcha === undefined ||
    data.captcha === null ||
    typeof data.captcha !== "string"
  ) {
    throw new Error("Your provided captcha token is invalid.");
  } else if (data.username === undefined || typeof data.username !== "string") {
    throw new Error("Your provided name is invalid.");
  } else if (data.username.length > 20) {
    throw new Error(
      "Your provided name too long. Maximum allowed username length is 20",
    );
  } else if (data.username.length < 3) {
    throw new Error(
      "Your provided name too short. Minimum allowed username length is 3",
    );
  } else if (
    data.email === undefined ||
    typeof data.email !== "string" ||
    validator.isEmail(data.email) !== true
  ) {
    throw new Error("Your provided email is invalid.");
  } else if (
    data.password === undefined ||
    typeof data.password !== "string" ||
    data.password.length <= 4 ||
    data.password.length > 128
  ) {
    throw new Error("Your provided password is invalid.");
  }
};

const authCheckResetPasswordData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    !data.password ||
    typeof data.password !== "string" ||
    data.password.length <= 4 ||
    data.password.length > 128
  ) {
    throw new Error("Your provided password is invalid.");
  }
};

const authCheckPostCredentialsRegisterUser = (
  userDatabase,
  username,
  normalizedEmail,
  ip,
) => {
  if (userDatabase) {
    if (userDatabase.local.normalizedEmail === normalizedEmail) {
      throw new Error("Your provided email is already used.");
    }
    if (userDatabase.username.toLowerCase() === username.toLowerCase()) {
      throw new Error("Your provided username is already used.");
    }

    //Multi acc
    return true;
  }
};

const authCheckPostCredentialsLinkData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.email === undefined ||
    typeof data.email !== "string" ||
    validator.isEmail(data.email) !== true
  ) {
    throw new Error("Your provided email is invalid.");
  } else if (
    data.password === undefined ||
    typeof data.password !== "string" ||
    data.password.length <= 4 ||
    data.password.length > 128
  ) {
    throw new Error("Your provided password is invalid.");
  }
};

const authCheckPostCredentialsLinkUser = (dataDatabase) => {
  if (dataDatabase[0].local !== undefined) {
    throw new Error("Your account has already linked an email.");
  } else if (dataDatabase[1] !== null) {
    throw new Error("Your provided email is already used.");
  }
};

const authCheckPostCredentialsRequestData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.type === undefined ||
    typeof data.type !== "string" ||
    ["verify", "reset"].includes(data.type) !== true
  ) {
    throw new Error("Your provided type is invalid.");
  } else if (
    data.email === undefined ||
    typeof data.email !== "string" ||
    validator.isEmail(data.email) !== true
  ) {
    throw new Error("Your provided email is invalid.");
  }
};

const authCheckPostCredentialsRequestUser = (userDatabase, data) => {
  if (userDatabase === null) {
    throw new Error("Your provided email is invalid.");
  } else if (
    data.type === "verify" &&
    userDatabase.local.emailVerified === true
  ) {
    throw new Error("Your provided user is already verified.");
  }
};

const authCheckPostCredentialsVerifyData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.userId === undefined ||
    typeof data.userId !== "string" ||
    validator.isMongoId(data.userId) !== true
  ) {
    throw new Error("Your provided user id is invalid.");
  } else if (
    data.token === undefined ||
    typeof data.token !== "string" ||
    data.token.length > 50
  ) {
    throw new Error("Your provided token is invalid.");
  }
};

const authCheckPostCredentialsVerifyToken = (tokenDatabase) => {
  if (tokenDatabase === null) {
    throw new Error("Token not found.");
  }

  if (tokenDatabase.user?.local?.emailVerified) {
    throw new Error("Email already verified.");
  }
};

const authCheckPostCredentialsResetData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.captcha === undefined ||
    data.captcha === null ||
    typeof data.captcha !== "string"
  ) {
    throw new Error("Your provided captcha token is invalid.");
  } else if (
    data.userId === undefined ||
    typeof data.userId !== "string" ||
    validator.isMongoId(data.userId) !== true
  ) {
    throw new Error("Your provided user id is invalid.");
  } else if (
    data.token === undefined ||
    typeof data.token !== "string" ||
    data.token.length > 50
  ) {
    throw new Error("Your provided token is invalid.");
  } else if (
    data.password === undefined ||
    typeof data.password !== "string" ||
    data.password.length <= 4 ||
    data.password.length > 128
  ) {
    throw new Error("Your provided password is invalid.");
  }
};

const authCheckPostCredentialsResetToken = (tokenDatabase) => {
  if (tokenDatabase === null) {
    throw new Error("Token not found.");
  }
};

module.exports = {
  authCheckLoginData,
  authCheckPostCredentialsUser,
  authCheckPostCredentialsRegisterData,
  authCheckPostCredentialsRegisterUser,
  authCheckPostCredentialsLinkData,
  authCheckPostCredentialsLinkUser,
  authCheckPostCredentialsRequestData,
  authCheckPostCredentialsRequestUser,
  authCheckPostCredentialsVerifyData,
  authCheckPostCredentialsVerifyToken,
  authCheckPostCredentialsResetData,
  authCheckPostCredentialsResetToken,
  authCheckResetPasswordData,
};
