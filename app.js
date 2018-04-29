const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const path = require('path');

const app = express();
const port = process.env.PORT | 3000;

app.use('/', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

let userIndex = 0;
let users = [];
let selectedUserPosition;

app.get('/', (req, res) => {
    res.render('index.pug');
});

app.get('/create', (req, res) => {
    res.render('create-user');
});

app.post('/create', (req, res) => {
    let user = {
        uid: userIndex,
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    };
    userIndex++;

    users.push(user);

    res.redirect('/userlist');
});

app.get('/userlist', (req, res) => {
    res.render('user-listing', {
        userList: users
    });
});

app.get('/edit/:userid', (req, res) => {
    let elementPosition;

    for(let i = 0; i <= users.length; i++){
        if(users[i].uid == req.params.userid){
            elementPosition = i;
            break;
        }
    }

    let user = users[elementPosition];
    selectedUserPosition = elementPosition;


    res.render('edit-user', {
        editUser: user
    });
});

app.post('/update/:userid', (req, res) => {
    users[selectedUserPosition] = {
        uid: req.params.userid,
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    };

    selectedUserPosition = -1;

    res.redirect('/userlist');
});

app.get('/delete/:userid', (req, res) => {

    let elementPosition;

    for(let i = 0; i <= users.length; i++){
        if(users[i].uid == req.params.userid){
            elementPosition = i;
            break;
        }
    }
    users.splice(elementPosition, 1);


    res.redirect('/userlist');
});

app.listen(port);