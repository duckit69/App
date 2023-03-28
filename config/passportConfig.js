const passport = require('passport');
const DoctorStrategy = require('passport-local');
const PatientStrategy = require('passport-local');
const db = require('./db');
const bcrypt = require('bcrypt');
require('dotenv').config();
const salt = 10;

passport.use('doctor-login', new DoctorStrategy(async (username, password, done) => {
    const result = await db.query('SELECT * FROM doctor WHERE person_username = $1', [username]);
    if (result.rows.length === 0) return done(null, false, { message: 'wrong user/pass' });
    const hashedPasswored = await bcrypt.hash(result.rows[0].person_password, salt);
    if ( bcrypt.compare(password, hashedPasswored) ) return done(null, result.rows[0]);
    return done(null, false, { message: 'wrong pass/user' });
}));

passport.use('patient-login', new PatientStrategy(async (username, password, done) => {
    const result = await db.query('SELECT * FROM patient WHERE person_username = $1', [username]);
    if (result.rows.length === 0) return done(null, false, { message: 'wrong user/pass' });
    const hashedPasswored = await bcrypt.hash(result.rows[0].person_password, salt);
    if ( bcrypt.compare(password, hashedPasswored) ) return done(null, result.rows[0]);
    return done(null, false, { message: 'wrong pass/user' });
}));

passport.serializeUser((user, done) => {
    process.nextTick(()=>{
        done(null, user);
    })
});
passport.deserializeUser((user, done) => {
    process.nextTick( () => {
        return done(null, user);
    })
})

module.exports = passport;