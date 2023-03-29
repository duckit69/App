const express = require('express');
const passport = require('passport');
const path = require('path');
const session = require('express-session');
const userRoute = require('./routes/User/userRoute');
const treatmentRoute = require('./routes/Treatment/treatmentRoute');
const ejsMate = require('ejs-mate');

const app = express();
// WEB SOCKET RElATED STUFF
const http = require('http');
const WebSocket = require('ws');
const serverApp = http.createServer(app);
const s = new WebSocket.Server({ server: serverApp, path: '/chat' });

const patients = new Map(); // Map of patient IDs to their sockets
const doctors = new Map(); // Map of doctor IDs to their sockets

s.on('connection', (socket, req) => {

    console.log('WebSocket Connected');

    socket.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const { type, sender_id, sender_name, receiver_id, content, role } = data;
            if (type === 'login') {
                if (role === 'patient') {
                    patients.set(sender_id, socket);
                } else {
                    doctors.set(sender_id, socket);
                }
            } else if (type === 'message') {
                const receiverSocket = role === 'patient' ? doctors.get(receiver_id) : patients.get(receiver_id)
                if (receiverSocket) {
                    const msg = JSON.stringify({type, sender_id, sender_name,receiver_id, content})
                    receiverSocket.send(msg);
                }
            }
        } catch (e) {
            console.log(err);
        }
    });

    socket.on('close', () => {
        console.log('WebSocket closed');
    });
})
serverApp.listen(8080, () => {
    console.log('Server Socket Listening on port 8080');
})
//
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