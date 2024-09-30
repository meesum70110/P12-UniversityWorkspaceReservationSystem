const nodeMailer = require('nodemailer');


const sendCredentials = async (email, password) => {
    
    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'hrsystemseproject@gmail.com',
        pass: 'mysl ecpg bdoj kgbf'
      }
    });

    const html = '<h1>Welcome Onboard!</h1> <h2>Below are your Hr app login credentials</h2> <p>Email: '
    + email + '<br>Password: ' + password + '</p>';
    
    var mailOptions = {
        from: 'hrsystemseproject@gmail.com',
        to : email,
        subject: 'Account Credential HR System',
        html: html
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });




}

module.exports = {
    sendCredentials
}