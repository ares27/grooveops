import { Router, json } from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/User.js";
import { verifyFirebaseToken, type AuthRequest } from "../middleware/auth.js";

const router = Router();

/**
 * Configure Email Transporter
 * Supports Gmail, SendGrid, or other SMTP providers
 */
let transporter: any = null;

const initializeTransporter = () => {
  if (transporter) return transporter;

  const emailProvider = process.env.EMAIL_PROVIDER || "gmail";

  if (emailProvider === "gmail") {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use Gmail App Password
      },
    });
  } else if (emailProvider === "sendgrid") {
    // SendGrid via SMTP
    transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    // Generic SMTP
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  return transporter;
};

/**
 * Helper to send invitation email
 */
const sendInvitationEmail = async (
  toEmail: string,
  invitationLink: string,
  organiserName: string
): Promise<boolean> => {
  try {
    const transporter = initializeTransporter();

    if (!transporter) {
      console.warn("Email transporter not configured");
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: toEmail,
      subject: `You're Invited to GrooveOps! 🎵`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .cta-button { display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
              .footer { color: #666; font-size: 12px; text-align: center; margin-top: 20px; }
              .link-text { color: #4f46e5; word-break: break-all; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎵 You're Invited to GrooveOps!</h1>
              </div>
              <div class="content">
                <p>Hi there!</p>
                <p><strong>${organiserName}</strong> has invited you to join their roster on <strong>GrooveOps</strong>, an all-in-one platform for artist & event management.</p>
                
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${invitationLink}" class="cta-button">Accept Invitation & Join</a>
                </p>
                
                <p>Or copy this link if the button doesn't work:</p>
                <p class="link-text">${invitationLink}</p>
                
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  <strong>Next steps:</strong><br>
                  1. Click the invitation link<br>
                  2. Create your account<br>
                  3. Complete your artist profile (3 simple steps)<br>
                  4. You're ready to accept bookings!
                </p>
              </div>
              <div class="footer">
                <p>This invitation expires in 7 days. If you have questions, reply to this email or contact the organiser directly.</p>
                <p>© 2026 GrooveOps. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        You're Invited to GrooveOps!
        
        ${organiserName} has invited you to join their roster on GrooveOps.
        
        Click this link to accept:
        ${invitationLink}
        
        This invitation expires in 7 days.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Invitation email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending invitation email:", error);
    return false;
  }
};

/**
 * POST /invitations/send
 * Organiser sends invitation to artist email
 */
router.post("/send", verifyFirebaseToken, async (req: AuthRequest, res) => {
  try {
    const { artistEmail } = req.body;
    const organiserUid = req.firebaseUid;
    const organiserRole = req.userRole;

    if (!organiserUid) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Only organisers and admins can send invitations
    if (organiserRole !== "Organiser" && organiserRole !== "Admin") {
      return res.status(403).json({ error: "Only organisers can send invitations" });
    }

    if (!artistEmail || !artistEmail.includes("@")) {
      return res.status(400).json({ error: "Invalid artist email" });
    }

    // Check if artist already exists in this organiser's roster
    const existingArtist = await User.findOne({
      email: artistEmail,
      belongsToOrganiser: organiserUid,
    } as any);

    if (existingArtist) {
      return res.status(400).json({ error: "Artist already invited to your roster" });
    }

    // Generate invitation token (simple approach: use a random string)
    const invitationToken = crypto.randomBytes(32).toString("hex");
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store invitation token in a temporary collection or in User doc
    // For now, we'll create a pending user record
    const existingUser = await User.findOne({ email: artistEmail });
    
    if (existingUser && existingUser.role === "Artist") {
      // Already an artist, just link them
      existingUser.belongsToOrganiser = organiserUid as any;
      await existingUser.save();
      
      return res.json({
        success: true,
        message: `Artist ${artistEmail} linked to your roster`,
      });
    }

    // Send invitation email
    // Build proper invitation link with fallback
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const invitationLink = `${clientUrl}/artist-join?organiser=${encodeURIComponent(
      organiserUid
    )}&email=${encodeURIComponent(artistEmail)}`;
    
    // Get organiser name for personalized email
    const organiser = await User.findOne({ firebaseUid: organiserUid } as any);
    const organiserName =
      organiser?.organiserProfile?.companyName ||
      organiser?.displayName ||
      "An GrooveOps Organiser";

    // Send email
    const emailSent = await sendInvitationEmail(artistEmail, invitationLink, organiserName);

    res.json({
      success: true,
      message: emailSent
        ? `✅ Invitation sent to ${artistEmail}`
        : `⚠️ Invitation link generated (email could not be sent due to configuration)`,
      invitationLink,
    });
  } catch (err) {
    console.error("Invitation error:", err);
    res.status(500).json({ error: "Failed to send invitation" });
  }
});

/**
 * GET /invitations/roster
 * Get all artists linked to this organiser
 */
router.get("/roster", verifyFirebaseToken, async (req: AuthRequest, res) => {
  try {
    const organiserUid = req.firebaseUid;
    const organiserRole = req.userRole;

    let query: any = {};

    if (organiserRole === "Organiser") {
      // Organisers see only their invited artists
      query.belongsToOrganiser = organiserUid;
    } else if (organiserRole === "Admin") {
      // Admins can see all artists (no filter needed)
    } else {
      // Artists cannot view rosters
      return res.status(403).json({ error: "Unauthorized" });
    }

    query.role = "Artist";

    const artists = await User.find(query).select(
      "email djProfile.alias djProfile.fee djProfile.genres djProfile.vibes belongsToOrganiser createdAt"
    );

    res.json({ artists });
  } catch (err) {
    console.error("Roster error:", err);
    res.status(500).json({ error: "Failed to fetch roster" });
  }
});

/**
 * DELETE /invitations/remove/:artistId
 * Remove artist from organiser's roster
 */
router.delete("/remove/:artistId", verifyFirebaseToken, async (req: AuthRequest, res) => {
  try {
    const { artistId } = req.params;
    const organiserUid = req.firebaseUid;
    const organiserRole = req.userRole;

    // Only organiser who invited or admin can remove
    const artist = await User.findById(artistId);
    
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    if (
      organiserRole !== "Admin" &&
      (organiserRole !== "Organiser" || artist.belongsToOrganiser !== organiserUid)
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Remove the artist from organiser's roster
    artist.belongsToOrganiser = undefined as any;
    await artist.save();

    res.json({ success: true, message: "Artist removed from roster" });
  } catch (err) {
    console.error("Remove artist error:", err);
    res.status(500).json({ error: "Failed to remove artist" });
  }
});

/**
 * POST /invitations/test-email
 * Test email configuration (development only)
 */
router.post("/test-email", async (req, res) => {
  try {
    const { testEmail } = req.body;

    if (!testEmail || !testEmail.includes("@")) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const transporter = initializeTransporter();

    if (!transporter) {
      return res.status(500).json({
        error:
          "Email transporter not configured. Check EMAIL_* environment variables.",
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: testEmail,
      subject: "🧪 GrooveOps Email Configuration Test",
      html: `
        <h2>✅ Email Configuration Working!</h2>
        <p>If you received this email, your GrooveOps email configuration is correct.</p>
        <p><strong>Email Provider:</strong> ${process.env.EMAIL_PROVIDER || "gmail"}</p>
        <p><strong>From Address:</strong> ${process.env.EMAIL_FROM || process.env.EMAIL_USER}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "✅ Test email sent successfully!",
      messageId: info.messageId,
      provider: process.env.EMAIL_PROVIDER || "gmail",
      fromAddress: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    });
  } catch (err: any) {
    console.error("Test email error:", err);
    res.status(500).json({
      error: "Failed to send test email",
      details: err.message,
      hint: "Check your EMAIL_* environment variables and email provider credentials",
    });
  }
});

export default router;
