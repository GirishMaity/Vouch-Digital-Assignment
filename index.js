const express = require("express");
const connectDB = require("./DB/db");
const dotenv = require("dotenv");
const cookiesParser = require("cookie-parser");

const app = express();

dotenv.config();

connectDB();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cookiesParser());

app.use(require("./Routes/UserRoute"));

app.listen(PORT);
