const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Event = require('../models/events');
const PressKit = require('../models/pressKit');
require('dotenv').config()
const baseUrl = 'https://spikkr-next.vercel.app'

const signup = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg)
            return res.status(422).json({ errors: errorMessages })
        }
        const { email, password } = req.body
        const user = await User.findOne({ 'local.email': email })
        if (user) {
            console.log("user already exists")
            return res.status(401).json({ message: "User Already exists!" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpires = Date.now() + 10 * 3600
        const newUser = new User({
            method: 'local',
            local: {
                email: email,
                password: hashedPassword
            },
            url: baseUrl + email.split('@')[0],
            otp: otp,
            otpExpires: otpExpires
        });
        await newUser.save();
        const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '1h' })
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });
        const welcomeMessage = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
            <!-- Spikkr title -->
            <title>Welcome to Spikkr</title>
            <!-- End title -->

            <style type="text/css">
              /* Email font */
              @font-face {
                font-family: "TT_Firs_Neue";
                src: url("assets/font/TT_Firs_Neue_Regular.ttf");
              }
        
              p,
              p:visited {
                font-size: 15px;
                line-height: 24px;
                font-family: "TT_Firs_Neue", Arial, sans-serif;
                font-weight: 300;
                text-decoration: none;
                color: #000000;
              }
        
              h1 {
                /* Fallback heading style */
                font-size: 22px;
                line-height: 24px;
                font-family: "TT_Firs_Neue", Arial, sans-serif;
                font-weight: normal;
                text-decoration: none;
                color: #000000;
              }
            </style>
          </head>
        
          <body
            style="
              text-align: center;
              margin: 0;
              padding-top: 10px;
              padding-bottom: 10px;
              padding-left: 0;
              padding-right: 0;
              -webkit-text-size-adjust: 100%;
              background-color: #fafafa;
              color: #000000;
            "
            align="center"
          >
            <!-- Fallback force center content -->
            <div style="text-align: center">
              <table
                align="center"
                style="
                  text-align: start;
                  vertical-align: top;
                  width: 600px;
                  max-width: 600px;
                  background-color: #ffffff;
                "
                width="600"
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        width: 596px;
                        vertical-align: top;
                        padding-left: 30px;
                        padding-right: 0;
                        padding-top: 15px;
                        padding-bottom: 10px;
                      "
                      width="596"
                    >
                      <img
                        style="
                          width: 130px;
                          max-width: 130px;
                          height: 55px;
                          max-height: 55px;
                          text-align: start;
                          color: #ffffff;
                        "
                        alt="Logo"
                        src="./assets/icons/logo.svg"
                        align="start"
                        width="130"
                        height="55"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <table
                align="center"
                style="
                  text-align: start;
                  vertical-align: top;
                  width: 600px;
                  max-width: 600px;
                  background-color: #ffffff;
                "
                width="600"
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        width: 596px;
                        vertical-align: top;
                        padding-left: 30px;
                        padding-right: 30px;
                        padding-top: 0px;
                        padding-bottom: 20px;
                      "
                      width="596"
                    >
                      <h1
                        style="
                          font-size: 22px;
                          line-height: 24px;
                          font-family: 'TT_Firs_Neue', Arial, sans-serif;
                          font-weight: 600;
                          text-decoration: none;
                          color: #000000;
                        "
                      >
                        Welcome to Spikkr
                      </h1>
                      <p
                        style="
                          font-size: 15px;
                          line-height: 24px;
                          font-family: 'TT_Firs_Neue', Arial, sans-serif;
                          font-weight: 400;
                          text-decoration: none;
                          color: #5c6570;
                        "
                      >
                        Hello!
                      </p>
        
                      <p
                        style="
                          font-size: 15px;
                          line-height: 24px;
                          font-family: 'TT_Firs_Neue', Arial, sans-serif;
                          font-weight: 400;
                          text-decoration: none;
                          color: #5c6570;
                        "
                      >
                        <span style="display: block"
                          >Thank you for joining Spikkr.
                        </span>
                        Please enter the code below to verify your identity and complete
                        your registration.
                      </p>
        
                      <p
                        style="
                          font-size: 15px;
                          line-height: 24px;
                          font-family: 'TT_Firs_Neue', Arial, sans-serif;
                          font-weight: 600;
                          text-decoration: none;
                          color: #58cea2;
                        "
                      >
                       ${otp}
                      </p>
        
                      <p
                        style="
                          font-size: 15px;
                          line-height: 24px;
                          font-family: 'TT_Firs_Neue', Arial, sans-serif;
                          font-weight: 400;
                          text-decoration: none;
                          color: #5c6570;
                        "
                      >
                        You can reset your account
                        <a
                          target="_blank"
                          style="text-decoration: underline; color: #58cea2"
                          href="https://spikkr.com/reset"
                          download="HTML Email Template"
                          ><u>here</u></a
                        >
                      </p>
        
                      <p
                        style="
                          font-size: 15px;
                          line-height: 24px;
                          font-family: 'TT_Firs_Neue', Arial, sans-serif;
                          font-weight: 400;
                          text-decoration: none;
                          color: #5c6570;
                        "
                      >
                        If you did not make this request, kindly ignore this email and
                        take no further action.
                        <span style="display: block; padding-top: 20px"
                          >Warm regards,</span
                        >
                        <span style="display: block">Spikkr </span>
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
        
              <table
                align="center"
                style="
                  text-align: center;
                  vertical-align: top;
                  width: 600px;
                  max-width: 600px;
                  background-color: #ffffff;
                "
                width="600"
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        width: 596px;
                        vertical-align: top;
                        padding-left: 30px;
                        padding-right: 30px;
                        padding-top: 10px;
                        padding-bottom: 30px;
                      "
                      width="596"
                    >
                      <p
                        style="
                          font-size: 15px;
                          line-height: 24px;
                          font-family: 'TT_Firs_Neue', Arial, sans-serif;
                          font-weight: 400;
                          text-decoration: none;
                          color: #5c6570;
                          margin-bottom: 0;
                        "
                      >
                        Copyright &copy;
                        <span id="copyright">
                          <script>
                            document
                              .getElementById("copyright")
                              .appendChild(
                                document.createTextNode(new Date().getFullYear())
                              );
                          </script>
                        </span>
                      </p>
                      <div
                        style="
                          width: 100%;
                          margin: 17px auto 0 auto;
                          padding-top: 1px;
                          padding-bottom: 7px;
                          background-color: #032628;
                          border-radius: 1rem;
                        "
                      >
                        <p
                          style="
                            font-size: 15px;
                            line-height: 24px;
                            font-family: 'TT_Firs_Neue', Arial, sans-serif;
                            font-weight: 400;
                            text-decoration: none;
                            color: #ffffff;
                          "
                        >
                          Follow us on social media
                        </p>
                        <div
                          style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 16px;
                          "
                        >
                          <a href="">
                            <svg
                              width="21"
                              height="18"
                              viewBox="0 0 21 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20.96 2.5C20.19 2.85 19.36 3.08 18.5 3.19C19.38 2.66 20.06 1.82 20.38 0.81C19.55 1.31 18.63 1.66 17.66 1.86C16.87 1 15.76 0.5 14.5 0.5C12.15 0.5 10.23 2.42 10.23 4.79C10.23 5.13 10.27 5.46 10.34 5.77C6.78004 5.59 3.61004 3.88 1.50004 1.29C1.13004 1.92 0.920039 2.66 0.920039 3.44C0.920039 4.93 1.67004 6.25 2.83004 7C2.12004 7 1.46004 6.8 0.880039 6.5V6.53C0.880039 8.61 2.36004 10.35 4.32004 10.74C3.69077 10.9122 3.03013 10.9362 2.39004 10.81C2.66165 11.6625 3.19358 12.4084 3.91106 12.9429C4.62854 13.4775 5.49549 13.7737 6.39004 13.79C4.87367 14.9904 2.99404 15.6393 1.06004 15.63C0.720039 15.63 0.380039 15.61 0.0400391 15.57C1.94004 16.79 4.20004 17.5 6.62004 17.5C14.5 17.5 18.83 10.96 18.83 5.29C18.83 5.1 18.83 4.92 18.82 4.73C19.66 4.13 20.38 3.37 20.96 2.5Z"
                                fill="#FFDE6A"
                              />
                            </svg>
                          </a>
        
                          <a href=""
                            ><svg
                              width="19"
                              height="18"
                              viewBox="0 0 19 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M16.96 0C17.4904 0 17.9991 0.210714 18.3742 0.585786C18.7492 0.960859 18.96 1.46957 18.96 2V16C18.96 16.5304 18.7492 17.0391 18.3742 17.4142C17.9991 17.7893 17.4904 18 16.96 18H2.95996C2.42953 18 1.92082 17.7893 1.54575 17.4142C1.17067 17.0391 0.959961 16.5304 0.959961 16V2C0.959961 1.46957 1.17067 0.960859 1.54575 0.585786C1.92082 0.210714 2.42953 0 2.95996 0H16.96ZM16.46 15.5V10.2C16.46 9.33539 16.1165 8.5062 15.5051 7.89483C14.8938 7.28346 14.0646 6.94 13.2 6.94C12.35 6.94 11.36 7.46 10.88 8.24V7.13H8.08996V15.5H10.88V10.57C10.88 9.8 11.5 9.17 12.27 9.17C12.6413 9.17 12.9974 9.3175 13.2599 9.58005C13.5225 9.8426 13.67 10.1987 13.67 10.57V15.5H16.46ZM4.83996 5.56C5.28552 5.56 5.71284 5.383 6.0279 5.06794C6.34296 4.75288 6.51996 4.32556 6.51996 3.88C6.51996 2.95 5.76996 2.19 4.83996 2.19C4.39175 2.19 3.96189 2.36805 3.64495 2.68499C3.32801 3.00193 3.14996 3.43178 3.14996 3.88C3.14996 4.81 3.90996 5.56 4.83996 5.56ZM6.22996 15.5V7.13H3.45996V15.5H6.22996Z"
                                fill="#FFDE6A"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
             
            </div>
          </body>
        </html>
        
`
        const mailContent = welcomeMessage
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Welcome to Spikkr - Please verify",
            html: mailContent
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).json({ message: error.message });
            } else {
                console.log(token, email, newUser.url)
                console.log("Email sent: " + info.response);
                res.status(201).json({ message: 'Successfully registered', token, email, url: newUser.url })
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

const verifyEmail = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg)
            return res.status(422).json({ errors: errorMessages })
        }
        const { otp } = req.body
        const user = req.user
        console.log(user.otp)
        if (otp !== user.otp) return res.status(400).json({ message: 'Invalid OTP' })
        if (user.otpExpires > Date.now()) return res.status(400).json({ message: "OTP Expired" })
        user.isVerified = true
        user.otp = null
        user.isVerified = true
        user.save()

        res.status(200).json({ message: 'Email verified successfully' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}
const login = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg)
            return res.status(422).json({ errors: errorMessages })
        }
        const { email, password } = req.body
        const user = await User.findOne({ 'local.email': email })
        if (!user) return res.status(404).json({ message: "User has not registered" })
        const isMatch = await bcrypt.compare(password, user.local.password)
        if (!isMatch) return res.status(403).json({ message: "Invalid Password" })
        const token = jwt.sign({ email: user.local.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json({ message: "Login successful", token: token, email: user.local.email, firstName: user.firstName, lastName: user.lastName })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, gender, role, bio, companyIndustry, topics, headshot, socials } = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg)
            return res.status(422).json({ errors: errorMessages })
        }
        const user = req.user
        user.firstName = firstName
        user.lastName = lastName
        user.gender = gender
        user.headshot = headshot
        user.role = role
        user.bio = bio
        user.topics = topics
        user.socials = socials
        user.companyIndustry = companyIndustry
        await user.save()
        res.status(200).json({ message: "User updated", user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map((error) => error.msg);
            return res.status(422).json({ errors: errorMessages });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ errors: "User does not exist" });

        // Generate a unique reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = Date.now() + 60 * 60 * 10;

        // Save the token and its expiration time in the user's document
        user.resetToken = resetToken;
        user.resetTokenExpires = resetTokenExpires;
        await user.save();

        // Send an email to the user with a link that includes the reset token
        const resetLink = `${baseUrl}/reset-password/${resetToken}`;

        // Send the email with the reset link
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Spikkr - Password Reset",
            html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Spikkr - Reset Password</title>
            <style type="text/css">
              @font-face {
                font-family: "TT_Firs_Neue";
                src: url("assets/font/TT_Firs_Neue_Regular.ttf");
              }
        
              p,
              p:visited {
                font-size: 15px;
                line-height: 24px;
                font-family: "TT_Firs_Neue", Arial, sans-serif;
                font-weight: 300;
                text-decoration: none;
                color: #000000;
              }
        
              h1 {
                font-size: 22px;
                line-height: 24px;
                font-family: "TT_Firs_Neue", Arial, sans-serif;
                font-weight: normal;
                text-decoration: none;
                color: #000000;
              }
            </style>
          </head>
          <body
            style="
              text-align: center;
              margin: 0;
              padding-top: 10px;
              padding-bottom: 10px;
              padding-left: 0;
              padding-right: 0;
              -webkit-text-size-adjust: 100%;
              background-color: #fafafa;
              color: #000000;
            "
            align="center"
          >
            
            <div style="text-align: center">
              <table
                align="center"
                style="
                  text-align: start;
                  vertical-align: top;
                  width: 600px;
                  max-width: 600px;
                  background-color: #ffffff;
                "
                width="600"
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        width: 596px;
                        vertical-align: top;
                        padding-left: 30px;
                        padding-right: 0;
                        padding-top: 15px;
                        padding-bottom: 10px;
                      "
                      width="596"
                    >
                      
                      <img
                        style="
                          width: 130px;
                          max-width: 130px;
                          height: 55px;
                          max-height: 55px;
                          text-align: start;
                          color: #ffffff;
                        "
                        alt="Logo"
                        src="./assets/icons/logo.svg"
                        align="start"
                        width="130"
                        height="55"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              
        
              
              <table
                align="center"
                style="
                  text-align: start;
                  vertical-align: top;
                  width: 600px;
                  max-width: 600px;
                  background-color: #ffffff;
                "
                width="600"
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        width: 596px;
                        vertical-align: top;
                        padding-left: 30px;
                        padding-right: 30px;
                        padding-top: 0px;
                        padding-bottom: 20px;
                      "
                      width="596"
                    >
                      <h1
                        style="
                          font-size: 22px;
                          line-height: 24px;
                          font-family: 'TT_Firs_Neue', Arial, sans-serif;
                          font-weight: 600;
                          text-decoration: none;
                          color: #000000;
                        "
                      >
                        Reset your password
                      </h1>
                      <p
                        style="
                          font-size: 15px;
                          line-height: 24px;
                          font-family: 'TT_Firs_Neue', Arial, sans-serif;
                          font-weight: 400;
                          text-decoration: none;
                          color: #5c6570;
                        "
                      >
                        Hi ${user.firstName},
                      </p>
        
                      <p
                        style="
                          font-size: 15px;
                          line-height: 24px;
                          font-family: 'TT_Firs_Neue', Arial, sans-serif;
                          font-weight: 400;
                          text-decoration: none;
                          color: #5c6570;
                        "
                      >
                        You recently tried to request a password change from for your
                        account. As a security measure, you need to lick the link below
                        to verify your identity
                      </p>
        
                      <p
                        style="
                          font-size: 15px;
                          line-height: 24px;
                          font-family: 'TT_Firs_Neue', Arial, sans-serif;
                          font-weight: 400;
                          text-decoration: none;
                          color: #5c6570;
                        "
                      >
                        You can reset your account
                        <a
                          target="_blank"
                          style="text-decoration: underline; color: #58cea2"
                          href="${resetLink}"
                          download="HTML Email Template"
                          ><u>here</u></a
                        >
                      </p>
        
                      <p
                        style="
                          font-size: 15px;
                          line-height: 24px;
                          font-family: 'TT_Firs_Neue', Arial, sans-serif;
                          font-weight: 400;
                          text-decoration: none;
                          color: #5c6570;
                        "
                      >
                        If you do not recognize this activity, please contact us at
                        support@spikkr.com or simply reply to this email to secure your
                        account.
        
                        <span style="display: block; padding-top: 20px"
                          >Warm regards,</span
                        >
                        <span style="display: block">Spikkr </span>
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
        
              <table
                align="center"
                style="
                  text-align: center;
                  vertical-align: top;
                  width: 600px;
                  max-width: 600px;
                  background-color: #ffffff;
                "
                width="600"
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        width: 596px;
                        vertical-align: top;
                        padding-left: 30px;
                        padding-right: 30px;
                        padding-top: 10px;
                        padding-bottom: 30px;
                      "
                      width="596"
                    >
                      <p
                        style="
                          font-size: 15px;
                          line-height: 24px;
                          font-family: 'TT_Firs_Neue', Arial, sans-serif;
                          font-weight: 400;
                          text-decoration: none;
                          color: #5c6570;
                          margin-bottom: 0;
                        "
                      >
                        Copyright &copy;
                        <span id="copyright">
                          <script>
                            document
                              .getElementById("copyright")
                              .appendChild(
                                document.createTextNode(new Date().getFullYear())
                              );
                          </script>
                        </span>
                      </p>
                      <div
                        style="
                          width: 100%;
                          margin: 17px auto 0 auto;
                          padding-top: 1px;
                          padding-bottom: 7px;
                          background-color: #032628;
                          border-radius: 1rem;
                        "
                      >
                        <p
                          style="
                            font-size: 15px;
                            line-height: 24px;
                            font-family: 'TT_Firs_Neue', Arial, sans-serif;
                            font-weight: 400;
                            text-decoration: none;
                            color: #ffffff;
                          "
                        >
                          Follow us on social media
                        </p>
                        <div
                          style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 16px;
                          "
                        >
                          <a href="">
                            <svg
                              width="21"
                              height="18"
                              viewBox="0 0 21 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20.96 2.5C20.19 2.85 19.36 3.08 18.5 3.19C19.38 2.66 20.06 1.82 20.38 0.81C19.55 1.31 18.63 1.66 17.66 1.86C16.87 1 15.76 0.5 14.5 0.5C12.15 0.5 10.23 2.42 10.23 4.79C10.23 5.13 10.27 5.46 10.34 5.77C6.78004 5.59 3.61004 3.88 1.50004 1.29C1.13004 1.92 0.920039 2.66 0.920039 3.44C0.920039 4.93 1.67004 6.25 2.83004 7C2.12004 7 1.46004 6.8 0.880039 6.5V6.53C0.880039 8.61 2.36004 10.35 4.32004 10.74C3.69077 10.9122 3.03013 10.9362 2.39004 10.81C2.66165 11.6625 3.19358 12.4084 3.91106 12.9429C4.62854 13.4775 5.49549 13.7737 6.39004 13.79C4.87367 14.9904 2.99404 15.6393 1.06004 15.63C0.720039 15.63 0.380039 15.61 0.0400391 15.57C1.94004 16.79 4.20004 17.5 6.62004 17.5C14.5 17.5 18.83 10.96 18.83 5.29C18.83 5.1 18.83 4.92 18.82 4.73C19.66 4.13 20.38 3.37 20.96 2.5Z"
                                fill="#FFDE6A"
                              />
                            </svg>
                          </a>
        
                          <a href=""
                            ><svg
                              width="19"
                              height="18"
                              viewBox="0 0 19 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M16.96 0C17.4904 0 17.9991 0.210714 18.3742 0.585786C18.7492 0.960859 18.96 1.46957 18.96 2V16C18.96 16.5304 18.7492 17.0391 18.3742 17.4142C17.9991 17.7893 17.4904 18 16.96 18H2.95996C2.42953 18 1.92082 17.7893 1.54575 17.4142C1.17067 17.0391 0.959961 16.5304 0.959961 16V2C0.959961 1.46957 1.17067 0.960859 1.54575 0.585786C1.92082 0.210714 2.42953 0 2.95996 0H16.96ZM16.46 15.5V10.2C16.46 9.33539 16.1165 8.5062 15.5051 7.89483C14.8938 7.28346 14.0646 6.94 13.2 6.94C12.35 6.94 11.36 7.46 10.88 8.24V7.13H8.08996V15.5H10.88V10.57C10.88 9.8 11.5 9.17 12.27 9.17C12.6413 9.17 12.9974 9.3175 13.2599 9.58005C13.5225 9.8426 13.67 10.1987 13.67 10.57V15.5H16.46ZM4.83996 5.56C5.28552 5.56 5.71284 5.383 6.0279 5.06794C6.34296 4.75288 6.51996 4.32556 6.51996 3.88C6.51996 2.95 5.76996 2.19 4.83996 2.19C4.39175 2.19 3.96189 2.36805 3.64495 2.68499C3.32801 3.00193 3.14996 3.43178 3.14996 3.88C3.14996 4.81 3.90996 5.56 4.83996 5.56ZM6.22996 15.5V7.13H3.45996V15.5H6.22996Z"
                                fill="#FFDE6A"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              
            </div>
          </body>
        </html>        
        `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: error.message });
            } else {
                console.log("Email sent: " + info.response);
                res.status(200).json({ message: 'Password reset email sent successfully', email });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map((error) => error.msg);
            return res.status(422).json({ errors: errorMessages });
        }

        const user = await User.findOne({ resetToken: token });

        if (!user) return res.status(404).json({ message: "User not found" });
        if (Date.now() < user.resetTokenExpires) return res.status(403).json({ message: "Token has expired" });
        const hashedPassword = bcrypt.hashSync(password, 10);
        user.local.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const searchUser = async (req, res) => {
    try {
        let users;

        if (!req.query.$search) {
            users = await User.find().select('-password -method -local -otp -otpExpires -isVerified -createdAt -updatedAt -__v').lean();
        } else {
            const searchRegex = new RegExp(req.query.$search, 'i'); // Case-insensitive regex
            users = await User.find({
                $or: [
                    { firstName: { $regex: searchRegex } },
                    { lastName: { $regex: searchRegex } },
                    { url: { $regex: searchRegex } },
                    { topics: { $regex: searchRegex } }
                ]
            }, {
                password: 0
            })
                .populate('event')
                .lean();
        }
        res.status(200).json({ message: 'Search results', users });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -method -local -otp -otpExpires -isVerified -createdAt -updatedAt -__v').lean();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

const getUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id })
        if (!user) return res.status(404).json({ message: "User not found" })
        res.status(200).json({ message: "User successfully fetched", user: user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: errror })
    }
}

const getUserPressKit = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id })
        if (!user) return res.status(404).json({ message: "User not found" })
        const pressKit = await PressKit.findOne({ user: req.params.id })
        if (!pressKit) return res.status(404).json({ message: "Press kit not found for user" })
        res.status(200).json({ message: "Successful", pressKit })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const createEvent = async (req, res) => {
    try {
        const { title, details, tags, media, date } = req.body
        const user = req.user
        const event = await Event.findOne({ user: user._id, title: title })
        if (event) return res.status(403).json({ message: "Event exists" })
        const newEvent = new Event({
            title: title,
            details: details,
            tags: tags,
            media: media,
            date: date,
        })
        await event.save()
        res.status(201).json({ message: "Event created successfully", event: newEvent })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: message.error })
    }
}

const signupGoogle = async (req, res) => {

}


module.exports = { signup, verifyEmail, login, updateProfile, forgotPassword, resetPassword, searchUser, getUsers, getUser, getUserPressKit, createEvent } 