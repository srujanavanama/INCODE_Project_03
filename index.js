const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));

const bcrypt = require("bcrypt");
const saltRounds = 10;

const data = require("./data");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/users", (req, res) => {
  let users = data.users;
  for (let i = 0; i < users; i++) {
    users[i]["user_id"] = i;
    console.log(users[i].user_id);
  }
  res.render("pages/users", {
    users: users,
  });
});

app.get("/schedules", (req, res) => {
  let schedules = data.schedules;
  res.render("pages/schedules", {
    schedules: schedules,
  });
});

app.get("/users/new", (req, res) => {
  res.render("pages/newUser");
});

app.get("/users/:id", (req, res, next) => {
  if (req.params.id < data.users.length) {
    let user = data.users[req.params.id];
    user["user_id"] = req.params.id;
    res.render("pages/user", {
      user: user,
    });
  } else {
    res.render("pages/error", {
      message: "User with provided ID is not available",
    });
  }
});

app.get("/users/:id/schedules", (req, res) => {
  let requiredSchedule = data.schedules.filter(
    (value) => value.user_id == req.params.id
  );
  if (requiredSchedule.length > 0) {
    res.render("pages/schedules", {
      schedules: requiredSchedule,
    });
  } else {
    res.render("pages/error", {
      message: "User with provided ID doesnot have any schedule",
    });
  }
});

app.post("/users/new", (req, res, next) => {
  let namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ \-']+$/i;
  let passwordPattern =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,32}$/gm;
  let emailPattern = /^[a-zA-Z0-9_.-]+[a-zA-Z0-9_.-]+@+[a-z]{3,5}.+[a-z]{2,4}/g;
  let lnameValid = namePattern.test(req.body.lastname);
  let fnameValid = namePattern.test(req.body.firstname);
  let passwordValid = passwordPattern.test(req.body.password);
  let emailVallid = emailPattern.test(req.body.email);
  if (fnameValid && lnameValid && passwordValid && emailVallid) {
    let newUser = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
    };
    bcrypt
      .genSalt(saltRounds)
      .then((salt) => {
        return bcrypt.hash(newUser.password, saltRounds);
      })
      .then((hash) => {
        newUser.password = hash;
        data.users.push(newUser);
        res.redirect("/users");
      })
      .catch((err) => {
        console.log(err.message);
        res.send("Can not add user, error while hashing password");
      });
  } else {
    res.render("pages/error", {
        message: "Invalid input values. " + 
         "First name and Last name should be alphabetical. " + 
         "Email id should be valid. " + 
         "Password should contain minimum 8 characters, a mixture of both uppercase and lowercase letters. " +
         "A mixture of letters and numbers. Atleast one special character"
      });
  }
});

app.get("/schedules/new", (req, res) => {
  let users = data.users;
  res.render("pages/newSchedule", {
    users: users,
  });
});

app.post("/schedules/new", (req, res, next) => {
    let start_at = req.body.start_at;
    let end_at = req.body.end_at;
    let newSchedule = {
        user_id: Number(req.body.user_id),
        day: Number(req.body.day),
        start_at: req.body.start_at,
        end_at: req.body.end_at
    };
    data.schedules.push(newSchedule);
    res.redirect("/schedules");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});