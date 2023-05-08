const db = require('../config/db');

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.redirect('/users/login');
}

async function checkDoctor(req, res, next) {
    const result = await db.query('SELECT * FROM doctor WHERE person_id = $1', [req.user.person_id]);
    if (result.rows.length === 0) {
        return res.redirect('/users/patient/dashboard');
    }
    else {
        return next();
    }
}

async function checkPatient(req, res, next) {
    const result = await db.query('SELECT * from patient where person_id = $1', [req.user.person_id]);
    if (result.rows.length === 0) {
        return res.redirect('/users/doctor/dashboard');
    }
    else {
        return next();
    }
}

async function isLoggedIn(req, res, next) {
    if (req.user) res.locals.loggedIn = true;
    else res.locals.loggedIn = false;
    next();
}
module.exports = {
    checkAuthenticated,
    checkDoctor,
    checkPatient,
    isLoggedIn
};