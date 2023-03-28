
module.exports.login = (req, res) => {
    if (req.isAuthenticated()) return res.render('home');
    res.render('users/login');
}


module.exports.register = (req, res) => {
    res.render('users/register');
}




