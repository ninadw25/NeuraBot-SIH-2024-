const User = require('../models/users');
const bcrypt = require('bcrypt');

const login = (req, res) => {
    res.render('login', { errorMessage: "" });
};

const userValidate = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).redirect('/login');
        }

        req.session.isAuthenticated = true;
        req.session.userId = user._id;

        return res.status(200).redirect('/');
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: `${error}` });
    }
};

module.exports = {
    login,
    userValidate
};