const adminLogin = (req, res) => {
    const { username, password } = req.body;

    if (username === "nullPointers" && password === "123456") {
        req.session.adminUsername = username;
        req.session.adminPassword = password;
        res.redirect('/admin/home');
    } else {
        res.redirect('/admin');
    }
};

const adminHome = (req, res) => {
    if (req.session.adminUsername && req.session.adminPassword) {
        res.render('adminHome');
    } else {
        res.redirect('/admin');
    }
};

const renderAdmin = (req, res) => {
    res.render('admin');
};

module.exports = {
    adminLogin,
    adminHome,
    renderAdmin
};