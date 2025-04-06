const express = require("express");
const bcrypt = require("bcryptjs");
const { saveUser, findUser, loadUsers } = require("../utils/localStorage");

const router = express.Router();

// User Signup
router.post("/signup", async (req, res) => {
    
    const { name, email, phone, location, password } = req.body;

    // Check if user exists
    if (findUser(email)) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = { name, email, phone, location, password: hashedPassword };
    saveUser(newUser);

    res.status(201).json({ message: "User registered successfully" });
});

router.post("/login", async (req, res) => {
    const { phone, password } = req.body;

    const users = loadUsers();
    const user = users.find((user) => user.phone === phone);

    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", user });
});

// Get User Info
router.get("/user", (req, res) => {
    const { email } = req.query;
    const user = findUser(email);
    
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
});

module.exports = router;
