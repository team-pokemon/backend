import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

mongoose
  .connect("mongodb://127.0.0.1:27017", { dbName: "backenf" })
  .then(() => {
    console.log("cpnnected");
  })
  .catch((e) => {
    console.log(e);
  });
const userSchema = mongoose.Schema({
  name: String,
  email: String,
});
const user = mongoose.model("user", userSchema);

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.set("view engine", "ejs");
const isAuthenticated = (req, res, next) => {
  if (!req.cookies.token) {
    res.render("login");
  } else {
    next();
  }
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout");
});

app.get("/hello", (req, res) => {
  user.create({ name: "vishal", email: "vishalkamboj9211@gmail.com" });
  res.send("yasv");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
console.log(req.body);
  // const User= await user.create();
  res.cookie("token","sub", {
    httpOnly: true,
  });

  res.redirect("/");
});
app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});
app.listen(3000, () => {
  console.log("port 3000");
});
