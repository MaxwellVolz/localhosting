# Contact Form Setup Guide

This guide explains how to configure the contact form email functionality.

## Features

- **Contact Form Endpoint**: Accepts Name, Email, Phone, and optional Message
- **Dual Email Notifications**:
  1. **Admin Notification**: Sent to you with form details
  2. **User Confirmation**: Sent to the person who submitted the form
- **Background Processing**: Emails sent asynchronously for fast response
- **HTML Emails**: Beautiful, responsive email templates
- **Error Handling**: Graceful failure if email service is down

## Quick Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This includes:
- `email-validator`: Email validation for Pydantic
- `aiosmtplib`: Async SMTP email sending

### 2. Configure Email Settings

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your email settings:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_USE_TLS=True
CONTACT_EMAIL_RECIPIENT=your-email@gmail.com
```

### 3. Gmail Setup (Recommended for Testing)

**Option A: Gmail App Password (Recommended)**

1. Enable 2-Factor Authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an "App Password" for "Mail"
4. Use this 16-character password in `SMTP_PASSWORD`

**Option B: Less Secure App Access (Not Recommended)**

1. Go to https://myaccount.google.com/lesssecureapps
2. Enable "Allow less secure apps"
3. Use your regular Gmail password

⚠️ **Note**: Gmail has daily sending limits (~500 emails/day). For production, consider SendGrid, Mailgun, or Amazon SES.

### 4. Test the Endpoint

Start the server:

```bash
python run.py
```

Test with curl:

```bash
curl -X POST http://localhost:8000/api/v1/contact/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1-800-555-1234",
    "message": "This is a test message"
  }'
```

Expected response:

```json
{
  "success": true,
  "message": "Thank you for contacting us! We'll be in touch soon.",
  "timestamp": "2025-12-27T12:34:56.789"
}
```

## API Endpoints

### POST /api/v1/contact/

Submit contact form (emails sent in background).

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "message": "Optional message"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Thank you for contacting us! We'll be in touch soon.",
  "timestamp": "2025-12-27T12:34:56.789"
}
```

### POST /api/v1/contact/send-now

Submit contact form with synchronous email sending (waits for email to send).

Use this if you need to verify emails were sent successfully before responding.

## Email Templates

### Admin Notification Email

You receive:
- Submitter's name, email, phone
- Message content (if provided)
- Timestamp
- Clean HTML formatting

### User Confirmation Email

Submitter receives:
- Thank you message
- Confirmation that form was received
- Your app name/branding

## Frontend Integration

### HTML Form

```html
<form id="contact-form">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <input type="tel" name="phone" required>
  <textarea name="message"></textarea>
  <button type="submit">Submit</button>
</form>

<script>
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message') || ''
  };

  const response = await fetch('http://localhost:8000/api/v1/contact/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  alert(result.message);
});
</script>
```

### React Example

```jsx
import { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const response = await fetch('http://localhost:8000/api/v1/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setStatus(data.message);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setStatus('Error: Please try again');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Name"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Email"
        required
      />
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        placeholder="Phone"
        required
      />
      <textarea
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        placeholder="Message (optional)"
      />
      <button type="submit">Submit</button>
      {status && <p>{status}</p>}
    </form>
  );
}
```

## Alternative Email Providers

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=verified-sender@yourdomain.com
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

### Amazon SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
SMTP_FROM_EMAIL=verified@yourdomain.com
```

## Troubleshooting

### Emails Not Sending

**Check logs**:
```bash
# The app logs email send status
python run.py
# Submit form and watch console output
```

**Common issues**:
1. **Wrong password**: Use App Password for Gmail, not regular password
2. **2FA not enabled**: Gmail requires 2FA for App Passwords
3. **Firewall blocking port 587**: Check your firewall rules
4. **From email not verified**: Some providers require email verification

### Testing Email Functionality

Use the synchronous endpoint to see immediate errors:

```bash
curl -X POST http://localhost:8000/api/v1/contact/send-now \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "phone": "555-1234"
  }'
```

Watch server logs for error messages.

### Gmail Blocking Sign-In

If you see "Less secure app access":
1. Enable 2FA on your Google account
2. Create an App Password
3. Use App Password instead of your regular password

## Production Recommendations

1. **Use a dedicated email service**: SendGrid, Mailgun, or Amazon SES
2. **Set up SPF/DKIM**: Prevent emails from going to spam
3. **Rate limiting**: Add rate limits to prevent abuse
4. **Validation**: Add CAPTCHA or honeypot fields
5. **Monitoring**: Log all submissions for audit trail
6. **Backup**: Store submissions in database in addition to email

## Security Notes

- ✅ Email credentials stored in `.env` (not committed to git)
- ✅ Email validation prevents invalid addresses
- ✅ Background tasks prevent blocking the API
- ✅ Error handling prevents crashes
- ⚠️ Add rate limiting in production
- ⚠️ Consider adding CAPTCHA for public forms
- ⚠️ Never expose SMTP credentials in frontend code

## Next Steps

- [ ] Customize email templates in `app/core/email.py`
- [ ] Add rate limiting with `slowapi`
- [ ] Implement CAPTCHA verification
- [ ] Store submissions in database
- [ ] Add admin dashboard to view submissions
- [ ] Set up email monitoring/alerts

## Support

For issues, check:
- Server logs for error messages
- SMTP provider documentation
- Email validation errors in response
