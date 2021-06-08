const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));

const bcrypt = require("bcrypt");
const saltRounds = 10;

const data = require("./data");

const db = require('./database');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/users", (req, res) => {
  db.any('SELECT * FROM users;')
  .then((users) => {
    res.render("pages/users", {
      users: users
    });
  }).catch((err) => {
    res.render("pages/error", {
      message:err.message + err.query
    });
  })
});

app.get("/schedules", (req, res) => {
  db.any('SELECT users.firstname, users.lastname, schedules.day, schedules.start_at, schedules.end_at FROM users INNER JOIN schedules ON users.user_id=schedules.user_id;')
  .then((data) => {
    res.render("pages/schedules", {
      schedules: data
    })
  }).catch((err) => {
    res.render("pages/error", {
      message:err.message + err.query
    });
  })
});

app.get("/users/new", (req, res) => {
  res.render("pages/newUser");
});

app.get("/users/:id", (req, res, next) => {
  let userId = Number(req.params.id);
  db.one('SELECT * FROM users WHERE user_id = $1;', [userId])
  .then((user) => {
    res.render("pages/user", {
      user: user,
    });
  }).catch((err) => {
    res.render("pages/error", {
      message:err.message + err.query
    });
  })
});

app.get("/users/:id/schedules", (req, res) => {
  let userId = Number(req.params.id);
  db.any('SELECT users.firstname, users.lastname, schedules.day, schedules.start_at, schedules.end_at FROM users INNER JOIN schedules ON users.user_id=schedules.user_id AND schedules.user_id = $1;', [userId])
  .then((schedules) => {
    if(schedules.length > 0) {
      res.render("pages/schedules", {
        schedules: schedules,
      });
    } else {
      res.render("pages/error", {
        message: "User with provided ID doesnot have any schedule"
      });
    }
  }).catch((err) => {
    res.render("pages/error", {
      message:err.message + err.query
    });
  })
});

app.post("/users/new", (req, res, next) => {
  let namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ \-']+$/i;
  let passwordPattern =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,32}$/gm;
  let emailPattern = /^[a-zA-Z0-9_.-]+[a-zA-Z0-9_.-]+@+[a-z]{3,5}.+[a-z]{2,4}/g;
  let firstname = String(req.body.firstname);
  let lastname = String(req.body.lastname);
  let email = String(req.body.email);
  let password = String(req.body.password);
  let lnameValid = namePattern.test(lastname);
  let fnameValid = namePattern.test(firstname);
  let passwordValid = passwordPattern.test(password);
  let emailVallid = emailPattern.test(email);
  if (fnameValid && lnameValid && passwordValid && emailVallid) {
    bcrypt
      .genSalt(saltRounds)
      .then((salt) => {
        return bcrypt.hash(password, saltRounds);
      })
      .then((hash) => {
        password = String(hash);
        db.any('INSERT INTO users(firstname, lastname, email, password) VALUES ($1, $2, $3, $4);', [firstname, lastname, email, password])
        .then(() => {
          res.redirect("/users");
        })
        .catch((err) => {
          res.render("pages/error", {
            message:err.message + err.query
          });
        })
      })
      .catch((err) => {
        console.log(err.message + err.query);
        res.render("pages/error", {
          message:err.message + err.query
        });
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
  db.any('SELECT * FROM users;')
  .then((users) => {
    res.render("pages/newSchedule", {
      users: users,
    });
  }).catch((err) => {
    res.render("pages/error", {
      message:err.message + err.query
    });
  })
});

app.post("/schedules/new", (req, res, next) => {
    let user_id = Number(req.body.user_id);
    let day = Number(req.body.day);
    let start_at = String(req.body.start_at);
    let end_at = String(req.body.end_at);
    db.any('INSERT INTO schedules(user_id, day, start_at, end_at) VALUES ($1, $2, $3, $4);',
    [user_id, day, start_at, end_at])
    .then(() => {
      res.redirect("back")
    }).catch((err) => {
      res.render("pages/error", {
        message:err.message + err.query
      });
    })
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});