const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const path = require('path');
//const mongo = require('mongodb');
//const MongoClient = mongo.MongoClient;
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
//let selectedUserPosition;
let User = null;

Mongoose.connect(dbUrl);
let db = Mongoose.connection;
db.on('error', console.error.bind(console, 'there was a connection error: '));
db.once('open', () => {
    console.log('connected to database');

    let userSchema = Mongoose.Schema({
        uid: Number,
        name: String,
        email: String,
        age: Number
    });

    User = Mongoose.model('User', userSchema);

    User.find((err, users) => {
        userArray = users;

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
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    });
    // let user = {
    //     uid: userIndex,
    //     name: req.body.name,
    //     email: req.body.email,
    //     age: req.body.age
    // };

    userIndex++;

    newUser.save((err) => {
        if (err) return console.error(err);

        console.log(`user ${userIndex - 1} added to the database`);

        res.redirect('/userlist');
    });

    //users.push(user);
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
    // let elementPosition;
    //
    // for(let i = 0; i <= users.length; i++){
    //     if(users[i].uid == req.params.userid){
    //         elementPosition = i;
    //         break;
    //     }
    // }

    // let user = users[elementPosition];
    // selectedUserPosition = elementPosition;
});

app.post('/update/:userid', (req, res) => {
    User.update({uid: req.params.userid}, {$set: {
        uid: req.params.userid,
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    }}, (err) => {
        if (err) return console.error(err);

        console.log(`user ${req.params.userid} updated`);

        res.redirect('/userlist');
    });

    // User.find({uid: req.params.userid}, (err, foundUser) => {
    //     if (err) return console.error(err);
    // });
    // users[selectedUserPosition] = {
    //     uid: req.params.userid,
    //     name: req.body.name,
    //     email: req.body.email,
    //     age: req.body.age
    // };
    //
    // selectedUserPosition = -1;


});

app.get('/delete/:userid', (req, res) => {
    User.remove({uid: req.params.userid}, (err) => {
        if (err) return console.error(err);

        console.log(`user ${req.params.userid} deleted`);

        res.redirect('/userlist');
    });
    // let elementPosition;
    //
    // for(let i = 0; i <= users.length; i++){
    //     if(users[i].uid == req.params.userid){
    //         elementPosition = i;
    //         break;
    //     }
    // }
    // users.splice(elementPosition, 1);



});

app.listen(port);