import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { d as db, v as verifications, b as accounts, s as sessions, u as users } from './index_D15ihLaC.mjs';
import { Resend } from 'resend';

const resendApiKey = "re_your_api_key";
const resend = new Resend(resendApiKey) ;
const fromEmail = "noreply@yourdomain.com";
const appName = "Dziennik Treningowy";
async function sendVerificationEmail(email, verificationUrl) {
  if (!resend) {
    console.warn("Resend API key not configured. Skipping email sending. Verification URL:", verificationUrl);
    return;
  }
  try {
    await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: email,
      subject: `Potwierdź swój adres email - ${appName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Potwierdź swój adres email</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${appName}</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Potwierdź swój adres email</h2>
            <p style="color: #4b5563;">Dziękujemy za rejestrację w ${appName}! Aby aktywować swoje konto, kliknij poniższy przycisk:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Potwierdź email</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Jeśli przycisk nie działa, skopiuj i wklej poniższy link do przeglądarki:</p>
            <p style="color: #3b82f6; word-break: break-all; font-size: 14px;">${verificationUrl}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Jeśli nie rejestrowałeś się w ${appName}, zignoruj tę wiadomość.</p>
          </div>
        </body>
        </html>
      `
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}
async function sendPasswordResetEmail(email, resetUrl) {
  if (!resend) {
    console.warn("Resend API key not configured. Skipping email sending. Reset URL:", resetUrl);
    return;
  }
  try {
    await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: email,
      subject: `Resetowanie hasła - ${appName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resetowanie hasła</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${appName}</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Resetowanie hasła</h2>
            <p style="color: #4b5563;">Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta. Kliknij poniższy przycisk, aby ustawić nowe hasło:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Zresetuj hasło</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Jeśli przycisk nie działa, skopiuj i wklej poniższy link do przeglądarki:</p>
            <p style="color: #3b82f6; word-break: break-all; font-size: 14px;">${resetUrl}</p>
            <p style="color: #ef4444; font-size: 14px; margin-top: 20px;">Link jest ważny przez 1 godzinę.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość. Twoje hasło pozostanie niezmienione.</p>
          </div>
        </body>
        </html>
      `
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications
    }
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // Wyłączone dla developmentu lokalnego
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    }
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
    sendOnSignUp: true
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    // 7 days
    updateAge: 60 * 60 * 24,
    // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
      // 5 minutes
    }
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:4321"]
});

export { auth as a };
