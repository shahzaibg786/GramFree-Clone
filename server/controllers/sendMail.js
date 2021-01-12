const nodemailer =require('nodemailer')
const google = require('googleapis');



const {OAuth2Client} = require('google-auth-library');
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground'

const {
    MAILING_SERVICE_CLIENT_ID,
    MAILING_SERVICE_CLIENT_SECRET,
    MAILING_SERVICE_REFRESH_TOKEN,
    SENDER_EMAIL_ADDRESS
} = process.env

const auth = new OAuth2Client(
    MAILING_SERVICE_CLIENT_ID,
    MAILING_SERVICE_CLIENT_SECRET,
    MAILING_SERVICE_REFRESH_TOKEN,
    OAUTH_PLAYGROUND
)



// const oauth2Client = new OAuth2(
//     MAILING_SERVICE_CLIENT_ID,
//     MAILING_SERVICE_CLIENT_SECRET,
//     MAILING_SERVICE_REFRESH_TOKEN,
//     OAUTH_PLAYGROUND
// )

//Send Mail

const sendEmail = ( to, url, txt ) => {
        auth.setCredentials({
        refresh_token: MAILING_SERVICE_REFRESH_TOKEN
    })

    const accessToken = auth.getAccessToken()
    const smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: SENDER_EMAIL_ADDRESS,
            clientId: MAILING_SERVICE_CLIENT_ID,
            clientSecret: MAILING_SERVICE_CLIENT_SECRET,
            refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
            accessToken
        }
    })
    const mailOptions = {
        from: SENDER_EMAIL_ADDRESS,
        to: to,
        subject: "GramFree-Clone Testing",
        html : `
        <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
        <h2 style="text-align:center; text-transform: uppercase; color: teal;"> Welcome to Gramfree-Clone</h2>
        <p>Congratualtions! You are almost set to start using GramFree-Clone.
            Just click the button below to validate your email address.
        </p>
        <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
        <p>If the button does not work for any reason, you can also click on the link below:</p>

        <div>${url}</div>
        </div>
        `
    }
    smtpTransport.sendMail(mailOptions, (err, infor) => {
        if(err) return err;
        return infor
    })
}

module.exports = sendEmail