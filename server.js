const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const { urlencoded } = require("express");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  log: [{ description: String, duration: Number, date: Date }],
});
const User = mongoose.model("User", userSchema);

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded());
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/exercise/users", async (req, resp) => {
  User.find({}).then((allUsers) => {
    resp.send(
      allUsers.map((user) => {
        return { username: user.username, id: user._id };
      })
    );
  });
  return;
  resp.send(
    await User.find({}).map((user) => {
      return { username: user.username, id: user._id };
    })
  );
});
// app.get("/api/exercise/log", async (req, resp) => {
//   if (!req.body) {
//     const users = await User.find({}).exec();
//     return resp.send(`${users.length}`);
//   }
//   const foundUser = await User.findById(req.body.userId);
//   return resp.send(foundUser);
// });
app.post("/api/exercise/new-user", (req, resp) => {
  const newUser = new User({
    username: req.body.username,
  });
  newUser
    .save()
    .then((savedUser) => {
      resp.status(200).send({ message: "saved", savedItem: savedUser });
    })
    .catch((err) => {
      resp.status(500).send(err);
    });
});

app.post("/api/exercise/add", async (req, resp) => {
  const toUpdate = req.body;
  if (!req.body.description || !req.body.duration)
    return resp.status(400).send({ message: "Required feilds not put" });
  if (isNaN(Number(toUpdate.duration)))
    return resp.status(500).send({ message: "Bad Duration" });
  if (!toUpdate.date) toUpdate.date = Date();
  const toPush = {
    description: toUpdate.description,
    duration: Number(toUpdate.duration),
    date: toUpdate.date,
  };
  try {
    const user = await User.findByIdAndUpdate(toUpdate.userId, {
      $push: { log: toPush },
    }).then();
    return;
    const foundUser = await User.findById(toUpdate.userId);
    const updatedFields = {
      description: toUpdate.description,
      duration: Number(toUpdate.duration),
      date: toUpdate.date,
    };
    foundUser.log.push(updatedFields);
    foundUser.save().then((user) => {
      resp.send({ username: user.username, ...updatedFields });
    });
  } catch (e) {
    return resp.status(400).send(e);
  }
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
