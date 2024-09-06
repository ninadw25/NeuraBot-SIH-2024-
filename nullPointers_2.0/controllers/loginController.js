login = (req, res) => {
    res.render('login');
};

userValidate = async(req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await Users.findOne({ email });
        if (!user) {
            // If user not found, send a failure response
            return res.status(400).json({ message: "User not found" });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // If password does not match, send a failure response
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // If login is successful, send a success response
        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        // Handle server error
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    login,
    userValidate
}
