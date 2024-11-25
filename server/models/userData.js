// Importing Mongoose to define schemas and models for MongoDB
const mongoose = require('mongoose');

// Extracting Schema from Mongoose to structure the user data
const Schema = mongoose.Schema;

// Defining the User schema to represent users in the database
const userSchema = new Schema({
    email: { 
        type: String, // Field to store the user's email
        required: true, // Ensures the email field is mandatory
        unique: true // Ensures no two users can have the same email
    },
    password: { 
        type: String, // Field to store the user's hashed password
        required: true // Ensures the password field is mandatory
    },
    fname: { 
        type: String, // Field to store the user's first name
    },
    lname: { 
        type: String, // Field to store the user's last name
    },
    dob: { 
        type: Date, // Field to store the user's date of birth
    },
    gender: { 
        type: String, // Field to store the user's gender
    },
    salary: { 
        type: Number, // Field to store the user's salary
        required: true // Ensures the salary field is mandatory
    },
    occupation: { 
        type: String, // Field to store the user's occupation
        required: true // Ensures the occupation field is mandatory
    },
    department: { 
        type: String, // Field to store the user's department
        required: true // Ensures the department field is mandatory
    },
    residence: { 
        type: String, // Field to store the user's residence address or location
    },
    photo: { 
        type: String, // Field to store the URL or path of the user's profile photo
    }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields for tracking
});

// Exporting the User model for use in other parts of the application
module.exports = mongoose.model('User', userSchema);
