import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { createEsimEmailHTML } from "@/utils/emailTemplates";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      email,
      customerName,
      packageName,
      destinationName,
      dataAmount,
      dataUnit,
      validityDays,
      qrCodeUrl,
    } = req.body;

    // Validate required fields
    if (!email || !qrCodeUrl || !destinationName) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["email", "qrCodeUrl", "destinationName"],
        received: {
          email: !!email,
          qrCodeUrl: !!qrCodeUrl,
          destinationName: !!destinationName,
        },
      });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    // Create email HTML
    const emailHTML = createEsimEmailHTML({
      customerName: customerName || "Client",
      packageName: packageName || "Forfait eSIM",
      destinationName,
      dataAmount: dataAmount || "3",
      dataUnit: dataUnit || "GB",
      validityDays: validityDays || 30,
      qrCodeUrl,
    });

    // Email options
    const mailOptions = {
      from: `"eSIM Service" <hello@fenuasim.com>`,
      to: email,
      subject: `Votre eSIM pour ${destinationName} est prête ! 🌐`,
      html: emailHTML,
      // Optional: Add plain text version
      text: `
        Bonjour ${customerName || "Client"},
        
        Votre eSIM pour ${destinationName} est maintenant prête !
        
        Détails:
        - Forfait: ${packageName}
        - Données: ${dataAmount} ${dataUnit}
        - Validité: ${validityDays} jours
        
        Pour installer votre eSIM, scannez le code QR disponible dans la version HTML de cet email.
        
        Cordialement,
        L'équipe eSIM Service
      `,
      headers: {
        "List-Unsubscribe":
          "<mailto:unsubscribe@fenuasim.com>, <https://fenuasim.com/unsubscribe>",
        Precedence: "bulk",
        "X-Mailer": "FenuaSIM Mailer 1.0",
      },
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Email sent successfully",
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      message: "Failed to send email",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
