# Email Configuration Guide for GrooveOps

This guide shows how to set up email sending for artist invitations using Nodemailer.

---

## 📋 Table of Contents

1. [Gmail Setup (Recommended for Testing)](#gmail-setup)
2. [SendGrid Setup (Recommended for Production)](#sendgrid-setup)
3. [Generic SMTP Setup](#generic-smtp-setup)
4. [Testing Email Configuration](#testing-email-configuration)
5. [Troubleshooting](#troubleshooting)

---

## 🟢 Gmail Setup (Recommended for Testing)

Gmail is the easiest option for development and testing.

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Scroll to "How you sign in to Google"
3. Click "2-Step Verification"
4. Follow the prompts to enable it

### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Windows Computer** (or your device)
3. Click **Generate**
4. Copy the 16-character yellow password (format: `xxxx xxxx xxxx xxxx`)

### Step 3: Configure `.env`
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=noreply@grooveops.com
```

**Note**: Replace hyphens with spaces if your app password has them.

### Step 4: Test
```bash
# In the server directory, after starting the server:
curl -X POST http://localhost:5000/api/invitations/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail":"your-test-email@gmail.com"}'
```

---

## 🔵 SendGrid Setup (Recommended for Production)

SendGrid is reliable, scalable, and has excellent deliverability.

### Step 1: Create SendGrid Account
1. Sign up at [SendGrid](https://sendgrid.com)
2. Verify your email address
3. Complete identity verification

### Step 2: Generate API Key
1. Go to [API Keys Settings](https://app.sendgrid.com/settings/api_keys)
2. Click **Create API Key**
3. Name it "GrooveOps Server"
4. Select **Full Access**
5. Click **Create & Copy**
6. Copy the key (format: `SG._...`)

### Step 3: Configure `.env`
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-api-key-here
EMAIL_FROM=noreply@grooveops.com
```

### Step 4: Verify Sender (Optional but Recommended)
1. Go to [Sender Authentication](https://app.sendgrid.com/settings/sender_auth)
2. Verify your domain or single sender email
3. This improves deliverability

### Step 5: Test
```bash
curl -X POST http://localhost:5000/api/invitations/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail":"your-test-email@gmail.com"}'
```

---

## 🟡 Generic SMTP Setup

Use this for any SMTP provider (Mailgun, Postmark, AWS SES, etc.).

### Example: Mailgun

#### Step 1: Get SMTP Credentials
1. Sign up at [Mailgun](https://www.mailgun.com)
2. Go to **Sending → Domain Settings**
3. Find **SMTP Credentials** section
4. Copy: SMTP Server, Port, Username, Password

#### Step 2: Configure `.env`
```env
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@yourdomain.mailgun.org
EMAIL_PASSWORD=3hg2-8hf7j-2k9l-8x9c
EMAIL_FROM=noreply@yourdomain.mailgun.org
```

#### Step 3: Test
```bash
curl -X POST http://localhost:5000/api/invitations/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail":"your-test-email@gmail.com"}'
```

---

## 🧪 Testing Email Configuration

### Method 1: Test Endpoint (REST API)

After starting the server, test your email configuration:

```bash
POST http://localhost:5000/api/invitations/test-email
Content-Type: application/json

{
  "testEmail": "your-email@gmail.com"
}
```

**Response on Success**:
```json
{
  "success": true,
  "message": "✅ Test email sent successfully!",
  "messageId": "message-id-123",
  "provider": "gmail",
  "fromAddress": "noreply@grooveops.com"
}
```

**Response on Error**:
```json
{
  "error": "Failed to send test email",
  "details": "Authentication failed",
  "hint": "Check your EMAIL_* environment variables..."
}
```

### Method 2: Using Curl in Terminal

```bash
# Test with cURL
curl -X POST http://localhost:5000/api/invitations/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "testEmail": "test@example.com"
  }' | jq
```

### Method 3: Using Postman

1. Open Postman
2. Create a new request:
   - **Method**: POST
   - **URL**: `http://localhost:5000/api/invitations/test-email`
3. Go to **Body** → Select **raw** → Choose **JSON**
4. Enter:
   ```json
   {
     "testEmail": "your-email@gmail.com"
   }
   ```
5. Click **Send**

---

## 🔍 Troubleshooting

### Issue: "Authentication failed" or "Invalid credentials"

**Gmail**:
- ✅ Double-check your App Password (16 characters, usually in format `xxxx xxxx xxxx xxxx`)
- ✅ Ensure 2-Step Verification is enabled
- ✅ Make sure you copied the *app password*, not the regular Gmail password
- ✅ Check that `EMAIL_PROVIDER=gmail`

**SendGrid**:
- ✅ Verify your API key starts with `SG.`
- ✅ Ensure the API key has Full Access permissions
- ✅ Check that `EMAIL_PROVIDER=sendgrid`

### Issue: "Email not delivered" or "Ends up in spam"

**Solutions**:
1. **Verify sender domain** (SendGrid):
   - Go to Sender Authentication
   - Add and verify your domain
   
2. **Add SPF & DKIM records**:
   - Your email provider will give you DNS records
   - Add them to your domain's DNS settings
   - Wait 24-48 hours for propagation

3. **Use professional domain**:
   - Use `@yourdomain.com` instead of `@gmail.com`
   - Personal email providers have lower trust scores

4. **Check email headers**:
   - Look at received email source
   - Check for authentication errors
   - Use tools like [MXToolbox](https://mxtoolbox.com/spf.aspx)

### Issue: "Transporter not configured"

**Solutions**:
- ✅ Ensure `.env` file exists in `server/` directory
- ✅ Restart the server after changing `.env`
- ✅ Check that `EMAIL_USER` and `EMAIL_PASSWORD` are set
- ✅ Run test endpoint to verify configuration

### Issue: "Module not found 'nodemailer'"

**Solution**:
```bash
cd server
npm install nodemailer
npm start
```

### Issue: "Connection timeout" or "SMTP connection failed"

**Solutions**:
- ✅ Check firewall rules
- ✅ Verify SMTP host and port are correct
- ✅ Try `EMAIL_SECURE=false` with port 587
- ✅ For port 465, try `EMAIL_SECURE=true`
- ✅ Check if ISP blocks outgoing SMTP (port 25)

---

## 📊 Email Configuration Reference

| Provider | Setup Time | Cost | Deliverability | Best For |
|----------|-----------|------|-----------------|----------|
| **Gmail** | 5 min | Free | Medium | Testing & Dev |
| **SendGrid** | 10 min | Free (100/day) | Excellent | Production |
| **Mailgun** | 10 min | Free (10K/month) | Excellent | Production |
| **AWS SES** | 15 min | Pay-per-use | Excellent | Large Scale |
| **Postmark** | 10 min | Paid only | Excellent | Premium |

---

## 🚀 Production Recommendations

1. **Use SendGrid** or **AWS SES** for reliability
2. **Verify your domain** to improve deliverability
3. **Add SPF & DKIM** DNS records
4. **Monitor bounce rates** in email provider dashboard
5. **Test with real emails** before going live
6. **Set up email logs** for debugging issues
7. **Use HTTPS** for all client URLs in invitations

---

## 📝 Environment Variables Reference

```env
# Required
EMAIL_PROVIDER=gmail|sendgrid|smtp
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@domain.com

# Optional (for SMTP provider)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Optional (for SendGrid)
SENDGRID_API_KEY=SG.your-key
```

---

## 💡 Tips

- **Keep `.env` secure**: Add to `.gitignore`, never commit credentials
- **Use environment-specific configs**: Different settings for dev/prod
- **Test before sending**: Use test endpoint on every environment change
- **Monitor logs**: Check server console for "✅ Invitation email sent"
- **Handle failures gracefully**: System works even if email fails to send

---

## 🎯 Next Steps

1. Choose your email provider
2. Follow the setup steps for that provider
3. Add credentials to `.env`
4. Restart the server: `npm start`
5. Test with the test endpoint
6. Invite an artist from the Vault page!

---

**Need help?** Check the server console for error messages or run the test endpoint for configuration details.
