const db = require('../config/db');

function validatePersonId(req)  {
    return req.user.person_id ? true : false;
}

function checkPersonId(req, res, next) {
    if (!validatePersonId(req)) {
        return res.redirect('/users/login');
    }
    next();
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.redirect('/users/login');
}

async function checkDoctor(req, res, next) {
    if (validatePersonId(req)){
        const result = await db.query('SELECT * FROM doctor WHERE person_id = $1', [req.user.person_id]);
        if (result.rows.length === 0) {
            return res.redirect('/');
        }
        else {
            return next();
        }
    } else {
        return res.redirect('/')
    }
    
}

async function checkPatient(req, res, next) {
    if (validatePersonId(req)) {
        const result = await db.query('SELECT * from patient where person_id = $1', [req.user.person_id]);
        if (result.rows.length === 0) {
            return res.redirect('/users/doctor/dashboard');
        }
        else {
            return next();
        }
    } else {
        return res.redirect('/')
    }

}

async function isLoggedIn(req, res, next) {
    if (req.user) {
        res.locals.loggedIn = true;
        res.locals.user = req.user;
        console.log(res.locals.user);
    }
    else res.locals.loggedIn = false;
    next();
}
module.exports = {
    checkAuthenticated,
    checkDoctor,
    checkPatient,
    isLoggedIn,
    checkPersonId
};