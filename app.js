const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const path = require('path');
const Mongoose = require('mongoose');
const dbUrl = "mongodb://localhost:27017/usermanage";

const app = express();
const port = process.env.PORT | 3000;

app.use('/', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

let userIndex = 0;
let userArray = [];
let User = null;

Mongoose.connect(dbUrl);
let db = Mongoose.connection;
db.on('error', console.error.bind(console, 'there was a connection error: '));
db.once('open', () => {
    console.log('connected to database');

    let userSchema = Mongoose.Schema({
        uid: Number,
        firstName: String,
        lastName: String,
        email: String,
        age: Number
    });

    User = Mongoose.model('User', userSchema);

    User.find((err, users) => {
        userArray = users;

        if (userArray.length > 9)
            userIndex = users[userArray.length - 1].uid + 1;
    });
});

app.get('/', (req, res) => {
    res.render('index.pug');
});

app.get('/create', (req, res) => {
    res.render('create-user');
});

app.post('/create', (req, res) => {
    let newUser = new User({
        uid:userIndex,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        age: req.body.age
    });

    userIndex++;

    newUser.save((err) => {
        if (err) return console.error(err);

        console.log(`user ${userIndex - 1} added to the database`);

        res.redirect('/userlist');
    });
});

app.get('/userlist', (req, res) => {

    User.find((err, users) => {
        if (err) return console.error(err);

        userArray = users;

        console.log(`all existing users successfully queried`);

        res.render('user-listing', {
            userList: userArray
        });
    });
});

app.get('/edit/:userid', (req, res) => {

    User.find({uid: req.params.userid}, (err, foundUser) => {
        if (err) return console.error(err);

        console.log(`user ${req.params.userid} found and sent to edit page`);

        res.render('edit-user', {
            editUser: foundUser[0]
        });
    });
});

app.post('/update/:userid', (req, res) => {
    User.update({uid: req.params.userid}, {$set: {
        uid: req.params.userid,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        age: req.body.age
    }}, (err) => {
        if (err) return console.error(err);

        console.log(`user ${req.params.userid} updated`);

        res.redirect('/userlist');
    });
});

app.get('/delete/:userid', (req, res) => {
    User.remove({uid: req.params.userid}, (err) => {
        if (err) return console.error(err);

        console.log(`user ${req.params.userid} deleted`);

        res.redirect('/userlist');
    });
});

app.get('/userlist/alphabetized/asc', (req, res) => {
    User.find().sort({lastName: 1}).then((users) => {
        userArray = users;

        res.render('user-listing', {
            userList: userArray
        });
    });
});

app.get('/userlist/alphabetized/desc', (req, res) => {
    User.find().sort({lastName: -1}).then((users) => {
        userArray = users;

        res.render('user-listing', {
            userList: userArray
        });
    });
});

app.post('/userlist/search', (req, res) => {
    User.find({lastName: req.body.searchUser}, (err, results) => {
        userArray = results;

        res.render('user-listing', {
            userList: userArray
        });
    })
});



app.listen(port);