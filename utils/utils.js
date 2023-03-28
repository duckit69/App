const db = require('../config/db');

function checkAuthenticated (req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.redirect('/users/login');
}

async function checkDoctor (req, res, next) {
   const result = await db.query('SELECT * FROM doctor WHERE person_id = $1', [req.user.person_id]);
   if(result.rows.length === 0){
    console.log('u dont have the right');
    return res.redirect('/users/login');
   }
   else {
    return next();
   }
}
module.exports = {
    checkAuthenticated,
    checkDoctor
};