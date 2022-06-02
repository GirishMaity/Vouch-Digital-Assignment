const express = require("express");
const connectDB = require("../DB/db");
const authenticate = require("../Middleware/Authenticate");
const router = express.Router();

connectDB();
const User = require("../Models/UserSchema");

router.get("/", (req, res) => {
  res.send("api running");
});

//user register route
router.post("/register", async (req, res) => {
  const { name, email, password, cpassword } = req.body;

  if (!name || !email || !password || !cpassword) {
    return res.status(400).json({ error: "Invalid Credentials" });
  } else {
    if (password === cpassword) {
      try {
        const newUser = new User({
          name,
          email,
          password,
          cpassword,
        });

        await newUser.save();

        return res.status(201).json({ message: "User created successfully." });
      } catch (error) {
        console.log(error.message);
      }
    } else {
      return res.status(400).json({ error: "Invalid Credentials." });
    }
  }

  res.json({
    error: "There was an internal error.",
  });
});

//user login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please fill all the fields." });
  }

  try {
    const emailExist = await User.findOne({ email: email });

    if (!emailExist) {
      return res.status(400).json({ error: "Email not found" });
    }

    const isMatch = await User.findOne({ password: password });

    const token = await emailExist.generateAuthToken();
    //console.log(token);

    if (isMatch) {
      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 10000000),
        httpOnly: true,
      });

      return res.status(200).json({ message: "User login successfully." });
    } else {
      return res.status(400).json({ error: "Invalid Credentials" });
    }
  } catch (err) {
    console.log(err);
  }
});

//Addcontact and add bulk contact(pass as array) route
router.post("/addcontact", authenticate, async (req, res) => {
  const arr = req.body;

  try {
    const rootUser = req.rootUser;

    const isSaved = await rootUser.addNewContact(arr);

    if (isSaved) {
      return res
        .status(200)
        .json({ message: "Successfully added your contact." });
    } else {
      return res.status(400).json({ error: "Could not save contact." });
    }
  } catch (error) {
    console.log(error);
  }

  return res.status(400).json({ error: "An unknown error occured." });
});

//Delete contact route
router.post("/deletecontact", authenticate, async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Could not find data" });
  }

  try {
    const rootUser = req.rootUser;

    const isDeleted = await User.updateOne(
      { email: rootUser.email },
      { $pull: { contacts: { _id: id } } }
    );

    if (!isDeleted) {
      return res.status(400).json({ error: "Could not delete the contact." });
    }

    return res
      .status(200)
      .json({ message: "Successfully deleted your contact." });
  } catch (err) {
    console.log(err);
  }
});

//update contact
router.post("/updatecontact", authenticate, async (req, res) => {
  const { contactname, contact } = req.body;

  if (!contactname) {
    return res.status(400).json({ error: "Could not find data" });
  }

  try {
    const rootUser = req.rootUser;
    console.log("root" + rootUser.email);

    const isUpdated = await User.updateOne(
      {
        email: rootUser.email,
        contacts: {
          $elemMatch: {
            contactname: contactname,
          },
        },
      },
      {
        $set: {
          "contacts.$.contact": contact,
        },
      }
    );
    console.log(isUpdated.modifiedCount);

    if (!isUpdated.modifiedCount) {
      return res.status(400).json({ error: "Could not update the contact." });
    }

    return res
      .status(200)
      .json({ message: "Successfully updated your contact." });
  } catch (err) {
    console.log(err);
  }
});

//fetch single contact
router.post("/fetchsingle", authenticate, async (req, res) => {
  const { contactname } = req.body;

  if (!contactname) {
    return res.status(400).json({ error: "Could not find data" });
  }

  try {
    const rootUser = req.rootUser;
    const user = await User.findOne({
      email: rootUser.email,
    }).select({ contacts: { $elemMatch: { contactname: contactname } } });
    var arr = [];
    for (var i = 0; i < user.contacts.length; i++) {
      arr[i] = user.contacts[i].contact;
      console.log(user.contacts[i].contact);
    }

    if (!user) {
      return res.status(400).json({ error: "Could not update the contact." });
    }

    return res
      .status(200)
      .json({ message: "Successfully updated your contact.", data: arr });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
