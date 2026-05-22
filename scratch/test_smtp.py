import os
import smtplib
from email.mime.text import MIMEText

# Load .env manually
if os.path.exists("backend/.env"):
    with open("backend/.env", "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip().strip('"').strip("'")

smtp_user = os.environ.get("SMTP_USER")
smtp_password = os.environ.get("SMTP_PASSWORD")
if smtp_password:
    smtp_password = smtp_password.replace(" ", "")

print(f"SMTP_USER: {smtp_user}")
print(f"SMTP_PASSWORD (sanitized): {smtp_password}")

if not smtp_user or not smtp_password:
    print("Error: SMTP_USER or SMTP_PASSWORD not set in backend/.env!")
    exit(1)

try:
    print("Connecting to smtp.gmail.com:587...")
    server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
    print("Sending EHLO...")
    server.ehlo()
    print("Starting TLS...")
    server.starttls()
    print("Sending EHLO post-TLS...")
    server.ehlo()
    print("Attempting login...")
    server.login(smtp_user, smtp_password)
    print("Login successful!")
    
    # Send test mail
    print("Sending test email...")
    msg = MIMEText("This is a test email to verify SMTP settings.", "plain")
    msg["Subject"] = "Test SMTP Verification"
    msg["From"] = smtp_user
    msg["To"] = smtp_user
    server.sendmail(smtp_user, [smtp_user], msg.as_string())
    server.quit()
    print("SUCCESS: Email sent successfully!")
except Exception as e:
    print(f"FAILURE: SMTP send failed. Details: {e}")
