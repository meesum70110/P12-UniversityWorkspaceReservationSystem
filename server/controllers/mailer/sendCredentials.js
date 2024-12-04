const nodemailer = require('nodemailer');

const sendCredentials = async (email, password) => {
    try {
        // Configure the transporter with environment variables
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Use environment variables
                pass: process.env.EMAIL_PASS, // Use environment variables
            },
        });

        // Prepare email content
        const html = `
            <h1>Welcome Onboard!</h1>
            <h2>Below are your Workspace app login credentials:</h2>
            <p>Email: ${email}<br>Password: ${password}</p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Account Credentials',
            html: html,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error; // Ensure errors are propagated
    }
};

module.exports = {
    sendCredentials,
};
