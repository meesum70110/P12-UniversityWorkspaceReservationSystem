// Importing nodemailer module for sending emails
const nodeMailer = require('nodemailer');

// Function to send credentials via email
const sendCredentials = async (email, password) => {

    // Creating a transporter object to configure the email service
    var transporter = nodeMailer.createTransport({
        service: 'gmail', // Using Gmail's email service
        auth: {
            user: 'hrsystemseproject@gmail.com', // Gmail account used for sending the email
            pass: 'mysl ecpg bdoj kgbf' // The app password used for Gmail account authentication (Note: It's better to use environment variables for sensitive information)
        }
    });

    // HTML content for the email body, which contains the email and password
    const html = '<h1>Welcome Onboard!</h1> <h2>Below are your Workspace app login credentials</h2> <p>Email: '
        + email + '<br>Password: ' + password + '</p>';
    
    // Setting up the mail options (email subject, receiver, sender, and body content)
    var mailOptions = {
        from: 'hrsystemseproject@gmail.com', // Sender's email address
        to: email, // Recipient's email address (provided in the function)
        subject: 'Account Credential HR System', // Subject of the email
        html: html // HTML body content for the email
    };

    // Sending the email using the transporter and mail options
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error); // Log the error if email sending fails
        } else {
            console.log('Email sent: ' + info.response); // Log the response if email is successfully sent
        }
    });
}

// Exporting the function for use in other parts of the application
module.exports = {
    sendCredentials
};
