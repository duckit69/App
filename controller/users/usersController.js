
module.exports.login = (req, res) => {
    if (req.isAuthenticated()) return res.render('home');
    res.render('users/login');
}

module.exports.register = (req, res) => {
    res.render('users/register');
}

module.exports.logout = (req, res) => {
    req.logout(err => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.status(200).redirect('/');
        }
    });
}



