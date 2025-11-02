import nodemailer from 'nodemailer';

export async function sendEmployeeDetailsEmail(
  email: string,
  firstName: string,
  password: string,
  institutionName: string
) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `� Welcome to ${institutionName}! Your Account Details`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; background-color: #4CAF50; padding: 15px; border-radius: 10px 10px 0 0;">
            <h2 style="color: #ffffff; margin: 0;">Welcome to ${institutionName}</h2>
          </div>

          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${firstName}</strong>,</p>
            <p style="font-size: 14px; color: #555;">
              Your account has been created at <strong>${institutionName}</strong>. Below are your login credentials:
            </p>

            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #e0e0e0; padding: 5px 10px; border-radius: 4px; font-size: 14px;">${password}</code></p>
            </div>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0;">
              <p style="font-size: 13px; color: #856404; margin: 0;">
                ⚠️ <strong>Important:</strong> Please log in and change your password immediately for security reasons.
              </p>
            </div>

            <div style="text-align: center; margin-top: 25px;">
              <a href="${
                process.env.FRONTEND_URL || 'http://localhost:3000'
              }/sign-in" target="_blank" style="
                display: inline-block;
                background-color: #4CAF50;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                font-size: 16px;
                border-radius: 5px;
                font-weight: bold;">
                Login to Your Account
              </a>
            </div>

            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee;">
              <p style="font-size: 13px; color: #666;">
                If you have any questions or need assistance, please contact your department administrator.
              </p>
            </div>
          </div>

          <div style="margin-top: 20px; padding: 15px; text-align: center; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <p style="font-size: 12px; color: #888; margin: 0;">
              If you did not expect this email, please contact the administration at ${institutionName} immediately.
            </p>
            <p style="font-size: 11px; color: #999; margin: 5px 0 0 0;">
              © ${new Date().getFullYear()} ${institutionName}. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, message: `Email sent: ${info.response}` };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send email' };
  }
}
