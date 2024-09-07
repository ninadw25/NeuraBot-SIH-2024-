admin = (req, res) => {
    res.render('admin');
};

adminHome = (req, res) => {
    res.render('adminHome');
}

module.exports = {
    admin,
    adminHome
};