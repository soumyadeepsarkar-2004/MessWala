const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

/**
 * Generate a 6-digit OTP and its expiry (10 minutes)
 */
function generateOTP() {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    return { otp, otpExpiry };
}

/**
 * Send OTP email for password reset
 */
async function sendOTPEmail(email, otp, name) {
    const mailOptions = {
        from: `"MessWala" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: 'MessWala - Password Reset OTP',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 16px; border: 1px solid #e5e7eb;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 40px;">🍛</span>
                    <h2 style="margin: 8px 0 0; color: #1f2937;">MessWala</h2>
                </div>
                <p style="color: #4b5563; font-size: 15px;">Hi <strong>${name}</strong>,</p>
                <p style="color: #4b5563; font-size: 15px;">You requested a password reset. Use the OTP below to verify your identity:</p>
                <div style="text-align: center; margin: 24px 0;">
                    <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316; background: #fff7ed; padding: 16px 32px; border-radius: 12px; border: 2px dashed #fdba74;">${otp}</span>
                </div>
                <p style="color: #6b7280; font-size: 13px; text-align: center;">This OTP expires in <strong>10 minutes</strong>.</p>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">If you didn't request this, please ignore this email.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { generateOTP, sendOTPEmail };
