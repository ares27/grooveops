# Email Integration - Quick Start

## 🚀 Getting Started

### 1. Install & Configure

```bash
# Nodemailer is already installed
cd server
npm status  # Verify nodemailer and @types/nodemailer are installed
```

### 2. Set Up Email Provider

Choose ONE option and configure your `.env` file:

#### 🟢 **Gmail (Easiest for testing)**
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx    # Your 16-char app password
EMAIL_FROM=noreply@grooveops.com
CLIENT_URL=http://localhost:5173
```

#### 🔵 **SendGrid (Best for production)**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-api-key
EMAIL_FROM=noreply@grooveops.com
CLIENT_URL=http://localhost:5173
```

See [EMAIL_SETUP.md](EMAIL_SETUP.md) for detailed setup instructions for all providers.

### 3. Restart Server

```bash
cd server
npm start
```

Look for this in console:
```
🚀 Server ready at http://localhost:5000
✅ Connected to MongoDB
```

---

## 🧪 Testing Endpoints

### Test Email Configuration

**Verify your email setup is working:**

```bash
curl -X POST http://localhost:5000/api/invitations/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail":"your-email@gmail.com"}'
```

**Success Response:**
```json
{
  "success": true,
  "message": "✅ Test email sent successfully!",
  "messageId": "message-id-123",
  "provider": "gmail",
  "fromAddress": "noreply@grooveops.com"
}
```

---

## 📧 Send Invitation Email

### From Frontend (Vault Page)

1. Click green **"Invite New Artist"** button
2. Enter artist email
3. Click **"Send Invitation"**
4. Artist receives email with invitation link!

### From API (Manual)

```bash
# First, get your auth token by logging in as organiser
# Then use Bearer token in the request:

curl -X POST http://localhost:5000/api/invitations/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -d '{"artistEmail":"artist@example.com"}'
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Invitation sent to artist@example.com",
  "invitationLink": "http://localhost:5173/join-as-artist?invitedBy=organiser-uid-123"
}
```

---

## 📋 Full API Reference

### Invitations Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| `POST` | `/api/invitations/send` | Send invitation to artist | ✅ Required |
| `POST` | `/api/invitations/test-email` | Test email configuration | ❌ Not required |
| `GET` | `/api/invitations/roster` | Get organiser's invited artists | ✅ Required |
| `DELETE` | `/api/invitations/remove/:artistId` | Remove artist from roster | ✅ Required |

---

## 🔐 Email Provider Setup Checklist

### Gmail
- [ ] 2-Step Verification enabled
- [ ] App Password generated (16 characters)
- [ ] `.env` configured with email/password
- [ ] Test email sent successfully

### SendGrid  
- [ ] Account created & verified
- [ ] API Key generated (SG.*)
- [ ] `.env` configured with API key
- [ ] (Optional) Domain verified in Sender Auth
- [ ] Test email sent successfully

### Other SMTP
- [ ] SMTP credentials from provider
- [ ] Host, port, username, password obtained
- [ ] `.env` configured with all details
- [ ] Test email sent successfully

---

## 📊 Email Flow Overview

```
┌─────────────────────────────────────┐
│  Organiser clicks "Invite Artist"   │
└──────────────┬──────────────────────┘
               │
               ▼
   ┌──────────────────────────┐
   │  InviteArtistModal opens │
   │  (Get artist email)      │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────────────────────────┐
   │  POST /invitations/send                      │
   │  - Check organiser role ✓                    │
   │  - Get organiser name from DB                │
   │  - Generate invitation link                  │
   │  - Create email HTML                         │
   │  - Send via Nodemailer ✉️                    │
   └──────────────┬─────────────────────────────┐
                  │                             │
         Success  │                 Failure     │
                  ▼                             ▼
      ┌─────────────────────┐      ┌──────────────────────┐
      │ Email sent! ✅      │      │ Error logged, link   │
      │ Show success modal  │      │ provided as fallback │
      └─────────────────────┘      └──────────────────────┘
              │                              │
              └──────────┬───────────────────┘
                         │
         Artist receives email with link ✉️
                         │
                         ▼
         Click link → /join-as-artist?invitedBy=...
                         │
                         ▼
         Artist signs up → Profile setup → ✨
```

---

## 🐛 Troubleshooting

### Email not sending?

1. **Check server logs** for errors
2. **Verify `.env` file** exists in `server/` directory
3. **Run test endpoint**:
   ```bash
   curl -X POST http://localhost:5000/api/invitations/test-email \
     -H "Content-Type: application/json" \
     -d '{"testEmail":"test@example.com"}'
   ```
4. **Check credentials** - Gmail app password, SendGrid API key, etc.

### Email appears in spam?

1. Verify sender domain (SendGrid: Sender Authentication)
2. Add SPF & DKIM DNS records
3. Use professional email domain instead of Gmail
4. See [EMAIL_SETUP.md](EMAIL_SETUP.md#issue-email-not-delivered-or-ends-up-in-spam)

### "Transporter not configured" error?

- Check that `EMAIL_USER` and `EMAIL_PASSWORD` are set
- Restart server with `npm start`
- Verify `EMAIL_PROVIDER` is set (gmail, sendgrid, or smtp)

---

## 💡 Tips

- **Gmail is easiest for testing** - Takes 5 minutes to set up
- **SendGrid for production** - Better deliverability & reliability
- **Test with `.../test-email` before inviting real artists**
- **Keep `.env` out of git** - Add `server/.env` to `.gitignore`
- **Check console logs** - Server prints `✅ Invitation email sent` when successful

---

## 📖 Full Documentation

See [EMAIL_SETUP.md](EMAIL_SETUP.md) for:
- Detailed provider setup (Gmail, SendGrid, Mailgun, etc.)
- DNS configuration for better delivery
- Production recommendations
- Comprehensive troubleshooting guide

---

## 🎯 What's Next?

1. ✅ Invitations sent via email
2. ✅ Artists receive professional HTML emails
3. ✅ Fallback links if email fails
4. ⏭️ Future: Email templates, unsubscribe links, analytics

**Ready to test?** Configure your email provider and invite an artist! 🚀
