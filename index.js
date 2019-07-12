const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const redis = require("redis");

const port = 3000;

let client = redis.createClient();

client.on("connect", params => {
  console.log("Redis is connected");
});

const app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.post("/users/search", (req, res, next) => {
  let id = req.body.id;
  client.HGETALL(id, (err, obj) => {
    if (!obj) {
      res.render("searchusers", { error: "User does not exist" });
    } else {
      obj.id = id;
      res.render("details", { user: obj });
    }
  });
});

app.get("/", (req, res, next) => {
  res.render("searchusers");
});

app.get("/users/add", (req, res, next) => {
  res.render("addUser");
});

app.post("/users/add", (req, res, next) => {
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;

  client.HMSET(
    id,
    [
      "first_name",
      first_name,
      "last_name",
      last_name,
      "email",
      email,
      "phone",
      phone
    ],
    (err, reply) => {
      if (err) {
        console.log(err);
      }
      console.log(reply);
      res.redirect("/");
    }
  );
});

app.delete("/users/delete/:id", (req, res, next) => {
  client.DEL(req.params.id);
  res.redirect("/");
});

app.listen(port, error => {
  console.log("Server started");
});
