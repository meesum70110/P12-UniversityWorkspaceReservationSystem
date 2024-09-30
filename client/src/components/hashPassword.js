const bcrypt = require('bcrypt');

const generateHash = async (password) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log(`Hashed password for '${password}' is: ${hashedPassword}`);
    } catch (error) {
        console.error('Error hashing the password:', error);
    }
};

// Replace 'user123' with the password you want to hash
generateHash('user123');
