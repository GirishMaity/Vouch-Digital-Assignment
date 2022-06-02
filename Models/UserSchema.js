const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const schema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cpassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: false,
      },
    },
  ],
  contacts: [
    {
      contactname: {
        type: String,
        required: false,
      },
      contact: {
        type: String,
        required: false,
      },
    },
  ],
});

schema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();

    return token;
  } catch (error) {
    console.log(error);
  }
};

schema.methods.addNewContact = async function (arr) {
  console.log(arr + "inthis");
  try {
    for (var i = 0; i < arr.length; i++) {
      this.contacts = this.contacts.concat({
        contactname: arr[i].contactname,
        contact: arr[i].contact,
      });
    }

    await this.save();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const User = mongoose.model("User", schema);

module.exports = User;
