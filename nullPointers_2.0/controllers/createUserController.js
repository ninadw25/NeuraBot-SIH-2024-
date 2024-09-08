const Users = require('../models/users');
const bcrypt = require('bcrypt');

exports.handleCreateUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).redirect('/login');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await Users.create({ name, email, password: hashedPassword });

        return res.redirect('/login');
    } catch (error) {
        return res.status(500).send("Error creating user");
    }
};