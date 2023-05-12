const express = require('express');
const passport = require('passport');
const path = require('path');
const session = require('express-session');
const userRoute = require('./routes/User/userRoute');
const treatmentRoute = require('./routes/Treatment/treatmentRoute');
const appointmentRoute = require('./routes/Appointment/appointmentRoute');
const sensorRoute = require('./routes/Sensor/sensorRoute');
const medicalHistoryRoute = require('./routes/MedicalHistory/medicalHistoryRoute');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const Utils = require('./utils/utils');
const Doctor = require('./model/doctor/doctorModel')
const db = require('./config/db');

const app = express();
// WEB SOCKET RElATED STUFF
const http = require('http');
const WebSocket = require('ws');
const serverApp = http.createServer(app);
const ser = http.createServer(app);
const s = new WebSocket.Server({ server: serverApp, path: '/chat' });
const st = new WebSocket.Server({ server: ser, path: '/room' });


const patients = new Map(); // Map of patient IDs to their sockets
const doctors = new Map(); // Map of doctor IDs to their sockets


const patientsTest = new Map(); // Map of patient IDs to their sockets
const doctorsTest = new Map(); // Map of doctor IDs to their sockets


st.on('connection', (socket, req) => {

    console.log('WebSocket');

    socket.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            // sender_id , sender_name, receiver_id, content
            const { type, sender_id, sender_name, receiver_id, content, role } = data;
            if (type === 'login') {
                if (role === 'patient') {
                    patientsTest.set(sender_id, socket);
                } else {
                    doctorsTest.set(sender_id, socket);
                }
            } else if (type === 'message') {
                const receiverSocket = role === 'patient' ? doctorsTest.get(receiver_id) : patientsTest.get(receiver_id)
                
                if (receiverSocket) {
                    console.log("I am here");
                    const msg = JSON.stringify({type, sender_name, content})
                    receiverSocket.send(msg);
                }
            }
        } catch (e) {
            console.log(e);
        }
    });

    socket.on('close', () => {
        console.log('WebSocket closed');
    });
})

s.on('connection', (socket, req) => {

    console.log('WebSocket Connected');

    socket.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            // sender_id , sender_name, receiver_id, content
            const { type, sender_id, sender_name, receiver_id, content, role } = data;
            if (type === 'login') {
                if (role === 'patient') {
                    patients.set(sender_id, socket);
                } else {
                    doctors.set(sender_id, socket);
                }
            } else if (type === 'message') {
                await db.query('INSERT INTO message(message_sender, message_receiver, message_content) values($1, $2, $3)', [data.sender_id, data.receiver_id, data.content]);
                const receiverSocket = role === 'patient' ? doctors.get(receiver_id) : patients.get(receiver_id)
                if (receiverSocket) {
                    const msg = JSON.stringify({type, sender_id, sender_name,receiver_id, content})
                    receiverSocket.send(msg);
                }
            }
        } catch (e) {
            console.log(e);
        }
    });

    socket.on('close', () => {
        console.log('WebSocket closed');
    });
})
serverApp.listen(8080, () => {
    console.log('Server Socket Listening on port 8080');
})

ser.listen(9090, () => {
    console.log("test WS");
})

//
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

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
app.use('/uploads', express.static('uploads'));


app.use('/users', userRoute);
app.use('/treatment', treatmentRoute);
app.use('/appointment', Utils.isLoggedIn, appointmentRoute);
app.use('/sensor', sensorRoute);
app.use('/medicalHistory', medicalHistoryRoute);
app.get('/message', async(req, res) => {
    const {sender, receiver} = req.query;
    const { rows } = await db.query('select * from message where (message_sender = $1 and message_receiver = $2) or (message_sender = $2 and message_receiver = $1) ORDER BY message_date ASC;', [sender, receiver]);
    res.send(rows);
})
app.get('/', Utils.isLoggedIn,  async (req, res) => {
    const doctors = await Doctor.getAllDoctors();
    res.render('home', {doctors});
});

app.listen(3000, () => {
    console.log('Serving on Port: 3000');
});