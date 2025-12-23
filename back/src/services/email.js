// 이메일 발송 서비스
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    // Gmail SMTP 설정
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password
      },
    });
  }

  // 비밀번호 재설정 이메일 발송
  async sendPasswordResetEmail(email, resetToken) {
    const mailOptions = {
      from: `SpeakTrue <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '[SpeakTrue] 비밀번호 재설정 안내',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">
          <div style="background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">SpeakTrue</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">서로의 마음을 잇는 따뜻한 대화의 시작</p>
          </div>

          <div style="padding: 40px 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin: 0 0 20px 0;">비밀번호 재설정 요청</h2>
            <p style="color: #666; line-height: 1.6;">
              안녕하세요,<br><br>
              비밀번호 재설정을 요청하셨습니다.<br>
              아래 인증 코드를 앱에 입력해주세요.
            </p>

            <div style="background: white; border: 2px solid #6B73FF; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
              <p style="color: #999; margin: 0 0 10px 0; font-size: 14px;">인증 코드</p>
              <p style="color: #6B73FF; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 8px;">${resetToken}</p>
            </div>

            <p style="color: #999; font-size: 14px; line-height: 1.6;">
              • 이 코드는 <strong>15분</strong> 동안 유효합니다.<br>
              • 본인이 요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.
            </p>
          </div>

          <div style="padding: 20px 30px; background: #333; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © SpeakTrue. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email send failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
