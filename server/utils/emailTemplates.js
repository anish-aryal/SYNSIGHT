export const otpEmailTemplate = (fullName, otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #155DFC 0%, #9810FA 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">SYNSIGHT</h1>
                  <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">Social Media Sentiment Analysis</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px;">Verify Your Email</h2>
                  <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                    Hi ${fullName},
                  </p>
                  <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                    Thank you for signing up for SYNSIGHT. Please use the verification code below to complete your registration:
                  </p>
                  
                  <!-- OTP Box -->
                  <div style="background: linear-gradient(135deg, #f5f7ff 0%, #faf5ff 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                    <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">Your verification code:</p>
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #155DFC;">
                      ${otp}
                    </div>
                    <p style="margin: 15px 0 0; color: #999999; font-size: 12px;">Valid for 10 minutes</p>
                  </div>
                  
                  <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                    If you didn't create an account with SYNSIGHT, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #eaeaea;">
                  <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                    © 2025 SYNSIGHT AI. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    This is an automated message, please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const welcomeEmailTemplate = (fullName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SYNSIGHT</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #155DFC 0%, #9810FA 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">SYNSIGHT</h1>
                  <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">Social Media Sentiment Analysis</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px;">Welcome to SYNSIGHT! 🎉</h2>
                  <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                    Hi ${fullName},
                  </p>
                  <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                    Your email has been verified successfully. You're all set to start analyzing social media sentiment!
                  </p>
                  
                  <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                    Here's what you can do with SYNSIGHT:
                  </p>
                  
                  <ul style="margin: 0 0 30px; padding-left: 20px; color: #666666; font-size: 14px; line-height: 2;">
                    <li>Analyze sentiment across social media platforms</li>
                    <li>Track trends and patterns over time</li>
                    <li>Generate comprehensive reports</li>
                    <li>Get AI-powered insights and recommendations</li>
                  </ul>
                  
                  <a href="http://localhost:5173/chat" style="display: inline-block; background: linear-gradient(135deg, #155DFC 0%, #9810FA 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                    Start Analyzing
                  </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #eaeaea;">
                  <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                    © 2025 SYNSIGHT AI. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const loginOtpTemplate = (name, otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .otp-box {
          background: white;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
          border-radius: 5px;
          border: 2px dashed #667eea;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          color: #667eea;
          letter-spacing: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 10px;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SYNSIGHT</h1>
          <p>Login Verification</p>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>We received a login attempt to your SYNSIGHT account. Please use the following verification code to complete your login:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p style="margin-top: 10px; color: #666;">This code will expire in 10 minutes</p>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you did not attempt to log in, please ignore this email and consider changing your password immediately.
          </div>

          <p>For your security:</p>
          <ul>
            <li>Never share this code with anyone</li>
            <li>SYNSIGHT will never ask for your verification code</li>
            <li>This code is valid for 10 minutes only</li>
          </ul>

          <p>Best regards,<br>The SYNSIGHT Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; 2024 SYNSIGHT. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};