const nodemailer = require("nodemailer");

// ─── GMAIL TRANSPORTER ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// ─── SEND CONFIRMATION EMAIL ──────────────────────────────────────────────────
exports.sendConfirmationEmail = async (user, confirmUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f3ee;font-family:Georgia,serif;">
      <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#c4652a,#8b3a1a);padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">LibrAI System</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">Smart Library & Archive Management</p>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#1a1a1a;">Welcome, ${user.name}!</h2>
          <p style="color:#5a5a5a;line-height:1.7;">Please confirm your email address by clicking below:</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${confirmUrl}" style="background:#c4652a;color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-size:16px;font-weight:600;display:inline-block;">
              Confirm My Email
            </a>
          </div>
          <p style="color:#9a9a9a;font-size:13px;">This link expires in 24 hours.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await transporter.sendMail({
    from: `"LibrAI System" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: "Confirm your LibrAI Account",
    html,
  });
};

// ─── SEND PASSWORD RESET EMAIL ────────────────────────────────────────────────
exports.sendPasswordResetEmail = async (user, resetUrl) => {
  await transporter.sendMail({
    from: `"LibrAI System" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: "LibrAI Password Reset",
    html: `<div style="max-width:600px;margin:40px auto;padding:40px;font-family:Georgia,serif;">
      <h2 style="color:#c4652a;">Password Reset</h2>
      <p>Hello ${user.name}, click below to reset your password:</p>
      <a href="${resetUrl}" style="background:#c4652a;color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;display:inline-block;">Reset Password</a>
      <p style="color:#9a9a9a;font-size:13px;margin-top:20px;">Expires in 1 hour.</p>
    </div>`,
  });
};

// ─── SEND WELCOME EMAIL ───────────────────────────────────────────────────────
exports.sendWelcomeEmail = async (user) => {
  await transporter.sendMail({
    from: `"LibrAI System" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: "Welcome to LibrAI System!",
    html: `<div style="max-width:600px;margin:40px auto;padding:40px;font-family:Georgia,serif;">
      <h2 style="color:#c4652a;">Account Confirmed!</h2>
      <p>Hello ${user.name}, your LibrAI account is now active.</p>
      <p>You can now search books, use AI Assistant, and access digital archives.</p>
      <p style="color:#9a9a9a;font-size:13px;">— The LibrAI Team</p>
    </div>`,
  });
};
