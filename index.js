const express = require('express'); 
const app = express();
const port = process.env.PORT || 3000;

const bcrypt = require('bcrypt');
const saltRounds = 10;

const data = require('./data')

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req,res) => {
    res.send('Welcome to our schedule website');
});

app.get('/users', (req,res) => {
    res.send(data.users);
});

app.get('/schedules', (req,res) => {
    res.send(data.schedules);
});

app.get('/users/:id', (req,res) => {
    req.params.id<data.users.length ? res.send(data.users[req.params.id]) : res.send('User with provided ID is not available')
});

app.get('/users/:id/schedules', (req,res) => {
    let requiredSchedule = data.schedules.filter((value) => value.user_id==req.params.id);
    requiredSchedule.length>0 ? res.send(requiredSchedule) : res.send('User with provided ID doesnot have any schedule');
});

app.post('/users', (req,res) => {
    let newUser = {
        'firstname' : req.body.firstname,
        'lastname' : req.body.lastname,
        'email' : req.body.email,
        'password' : req.body.password
    }
    bcrypt.genSalt(saltRounds)
    .then(salt => {
        return bcrypt.hash(newUser.password, saltRounds);
    }).then(hash => {
        newUser.password = hash;
        data.users.push(newUser);
        res.send(data.users[data.users.length -1]);
    }).catch(err => {
        console.log(err.message);
        res.send('Can not add user, error while hashing password');
    });
});

app.post('/schedules', (req,res) => {
    if(Number(req.body.user_id) < data.users.length) {
        let newSchedule = {
            'user_id': Number(req.body.user_id),
            'day': Number(req.body.day),
            'start_at': req.body.start_at,
            'end_at': req.body.end_at
        }
        data.schedules.push(newSchedule);
        res.send(data.schedules[data.schedules.length - 1]);
    } else {
        res.send('Can not add schedule, user with provided user_id does not exist');
    }

});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});