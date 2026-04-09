const nodemailer = require('nodemailer');

// ─── Email Configuration ────────────────────────────────────
// Using Gmail SMTP. To use this:
// 1. Go to https://myaccount.google.com/apppasswords
// 2. Generate an "App Password" for "Mail"
// 3. Replace the values below with your email and the app password
//
// Or set environment variables:
//   EMAIL_USER=your_email@gmail.com
//   EMAIL_PASS=your_app_password

const EMAIL_USER = process.env.EMAIL_USER || 'agricargasapp@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || '';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

/**
 * Generate a random 5-digit OTP code
 */
function generateOTP() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

/**
 * Send OTP code via email
 */
async function sendOTPEmail(toEmail, otpCode, userName) {
    const mailOptions = {
        from: `"AgriCargas" <${EMAIL_USER}>`,
        to: toEmail,
        subject: '🔐 Código de Recuperação de Senha - AgriCargas',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0; }
          .container { max-width: 480px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #22C55E, #16a34a); padding: 32px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
          .body { padding: 32px 24px; }
          .greeting { font-size: 16px; color: #333; margin-bottom: 16px; }
          .message { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 24px; }
          .otp-box { background: #F0FFF5; border: 2px dashed #22C55E; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
          .otp-code { font-size: 36px; font-weight: bold; color: #22C55E; letter-spacing: 8px; margin: 0; }
          .otp-label { font-size: 12px; color: #999; margin-top: 8px; }
          .warning { font-size: 13px; color: #999; background: #FFF8E1; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #F59E0B; margin-bottom: 24px; }
          .footer { background: #f9fafb; padding: 20px 24px; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚜 AgriCargas</h1>
            <p>Recuperação de Senha</p>
          </div>
          <div class="body">
            <p class="greeting">Olá, <strong>${userName || 'Usuário'}</strong>!</p>
            <p class="message">
              Recebemos uma solicitação para redefinir a senha da sua conta. 
              Use o código abaixo para continuar:
            </p>
            <div class="otp-box">
              <p class="otp-code">${otpCode}</p>
              <p class="otp-label">Código de verificação</p>
            </div>
            <div class="warning">
              ⚠️ Este código expira em <strong>10 minutos</strong>. 
              Se você não solicitou a recuperação de senha, ignore este email.
            </div>
            <p class="message">
              Por segurança, nunca compartilhe este código com ninguém.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} AgriCargas. Todos os direitos reservados.
          </div>
        </div>
      </body>
      </html>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email OTP enviado para: ${toEmail} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error.message);
        // In development, log the OTP to console so testing is possible
        console.log(`⚠️ [DEV] OTP para ${toEmail}: ${otpCode}`);
        return { success: false, error: error.message };
    }
}

module.exports = {
    generateOTP,
    sendOTPEmail,
};
