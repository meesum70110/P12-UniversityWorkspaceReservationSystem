const nodeMailer = require('nodemailer');

const sendCredentials = async (email, password) => {
    console.log('Initializing email sending process...'); // Debugging Statement

    try {
        // Logging environment details
        console.log('Environment Details:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password ? 'Password present' : 'Password missing'}`);

        // Step 1: Create Transporter
        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'hrsystemseproject@gmail.com', // Use env variable
                pass: process.env.EMAIL_PASS || 'mysl ecpg bdoj kgbf', // Use env variable
            },
        });

        console.log('Transporter created successfully.'); // Debugging Statement

        // Step 2: Prepare Email Content
        const html = `
            <h1>Welcome Onboard!</h1>
            <h2>Below are your Workspace app login credentials</h2>
            <p>Email: ${email}<br>Password: ${password}</p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'hrsystemseproject@gmail.com',
            to: email,
            subject: 'Account Credentials',
            html: html,
        };

        console.log('Mail options prepared:');
        console.log(mailOptions);

        // Step 3: Send Email
        console.log('Sending email...');
        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully:');
        console.log(info.response);
    } catch (error) {
        console.error('Error during email sending process:');
        console.error(error);

        // Ensure the error is logged in Render's logs
        console.error('Error stack trace:', error.stack);
    }

    console.log('Email sending process completed.');
};

module.exports = {
    sendCredentials,
};
