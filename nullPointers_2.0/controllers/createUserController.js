const mongoose = require('mongoose');

const Users = require('../models/users');

exports.handleCreateUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        await Users.create({ name, email, password });
        return res.redirect('/login');
    } catch (error) {
        return res.status(500).send("Error creating user");
    }
};