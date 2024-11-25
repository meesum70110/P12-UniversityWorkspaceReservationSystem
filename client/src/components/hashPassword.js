// Importing the bcrypt library for password hashing
const bcrypt = require('bcrypt');

// Asynchronous function to generate a hashed password
const generateHash = async (password) => {
    try {
        const saltRounds = 10; // Defining the number of salt rounds for bcrypt (higher values increase security but slow down the process)
        
        // Hashing the provided password using bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Logging the hashed password to the console
        console.log(`Hashed password for '${password}' is: ${hashedPassword}`);
    } catch (error) {
        // Catching and logging any errors that occur during the hashing process
        console.error('Error hashing the password:', error);
    }
};

// Calling the generateHash function with a sample password
generateHash('user123');
