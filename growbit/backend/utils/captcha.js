const fetch = require("node-fetch");

const captchaCheckData = (captchaCheck) => {
  if (captchaCheck === undefined || captchaCheck === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (captchaCheck.success !== true) {
    throw new Error("Your provided captcha token is invalid.");
  }
};

const captchaGetData = (captcha) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(
        `https://hcaptcha.com/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${captcha}`,
        { method: "POST" },
      );

      if (response !== undefined && response.status === 200) {
        const data = await response.json();
        resolve(data);
      } else {
        resolve({ success: false });
      }
    } catch (err) {
      resolve({ success: false });
    }
  });
};

module.exports = {
  captchaCheckData,
  captchaGetData,
};
