const fs = require("fs");
const path = require("path");

const storageFile = path.join(__dirname, "users.json");

// Load users from file
const loadUsers = () => {
    try {
        if (!fs.existsSync(storageFile)) {
            fs.writeFileSync(storageFile, JSON.stringify([])); // Create file if not exists
        }
        const data = fs.readFileSync(storageFile, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading users file:", error);
        return [];
    }
};

// Save users to file
const saveUsers = (users) => {
    fs.writeFileSync(storageFile, JSON.stringify(users, null, 2));
};

// Save a new user
const saveUser = (user) => {
    const users = loadUsers();
    users.push(user);
    saveUsers(users);
};

// Find a user by email
const findUser = (email) => {
    const users = loadUsers();
    return users.find((user) => user.email === email);
};

module.exports = { saveUser, findUser, loadUsers };
