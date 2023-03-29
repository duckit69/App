const express = require('express');
const passport = require('passport');
const path = require('path');
const session = require('express-session');
const userRoute = require('./routes/User/userRoute');
const treatmentRoute = require('./routes/Treatment/treatmentRoute');
const ejsMate = require('ejs-mate');
const http = require('http');
const app = express();

app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))
app.use(passport.authenticate('session'));
app.use(passport.session());

app.use('/users', userRoute);
app.use('/treatment', treatmentRoute)

app.get('/', (req, res) => {
    res.render('home');
});

app.listen(3000, () => {
    console.log('Serving on Port: 3000');
});