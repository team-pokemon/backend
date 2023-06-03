import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from 'multer'

mongoose
  .connect("mongodb://127.0.0.1:27017", { dbName: "backenf" })
  .then(() => {
    console.log("cpnnected");
  })
  .catch((e) => {
    console.log(e);
  });
const UserSchema = mongoose.Schema({
  email: String,
  password: String,
});
const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer({ dest: 'uploads/' });

app.set("view engine", "ejs");
const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "sdjasdbajsdbjasd");
    console.log("decoded", decoded);

    req.User = await User.findById(decoded._id);

    next();
  } else {
    res.redirect("/login");
  }
};

const User = mongoose.model("User", UserSchema);


const photoSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  uploadedAt: { type: Date, default: Date.now }
});
const Photo = mongoose.model('Photo', photoSchema);
// Handle the POST request to upload a photo
app.get('/photos', async (req, res) => {
  try {
    const photos = await Photo.find();
    res.json(photos);
  } catch (error) {
    console.error('Failed to retrieve photos:', error);
    res.status(500).json({ error: 'Failed to retrieve photos' });
  }
});
app.post('/photos', upload.single('photo'), async (req, res) => {
  const { filename, mimetype, buffer } = req.file;

  try {
    // Create a new instance of the Photo model
    const photo = new Photo({
      filename,
      contentType:mimetype ,
    });

    // Save the photo to MongoDB
    const savedPhoto = await photo.save();
    console.log('Photo uploaded successfully');
    res.json({ message: 'Photo uploaded successfully' ,
  filename,mimetype});
  } catch (error) {
    console.error('Failed to save the photo:', error);
    res.status(500).json({ error: 'Failed to save the photo' });
  }
});


app.get("/", isAuthenticated, (req, res) => {
  res.render("logout");
});
app.get("/hello", (req, res) => {
  User.create({ name: "vishal", email: "vishalkamboj9211@gmail.com" });
  res.send("yasv");
});

//login
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  if (!user) return res.redirect("/register");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    return res.render("login", { email, message: "Incorrect Password" });

  const token = jwt.sign({ _id: user._id }, "sdjasdbajsdbjasd");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});
//register
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", async (req, res) => {
  const {  email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return res.redirect("/login");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ _id: user._id }, "sdjasdbajsdbjasd");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});
//logout
app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});
//getall users
app.get('/users', async (req, res) => {
  try {
    const allusers = await User.find({});
    res.json(allusers);
  } catch (err) {
res.json({err})
  }
});
app.listen(3000, () => {
  console.log("port 3000");
});
