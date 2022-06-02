const jwt = require("jsonwebtoken");
const User = require("../Models/UserSchema");

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken;
    const verify = jwt.verify(token, "qwerty");

    var rootUser = await User.findOne({
      _id: verify._id,
      "tokens.token": token,
    });

    if (!rootUser) {
      throw new Error("User not found");
    }

    req.token = token;
    req.rootUser = rootUser;
    req.userId = rootUser._id;

    next();
  } catch (error) {
    res.status(400).json({ error: "Unauthorised user.", msg: error.message });
  }
};

module.exports = authenticate;
