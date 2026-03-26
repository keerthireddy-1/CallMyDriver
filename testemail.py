import smtplib
from email.mime.text import MIMEText

EMAIL = "callmydriver2026@outlook.com"   # your new outlook email
PASSWORD = "Neha@097"        # your regular outlook login password

msg = MIMEText("Your CallMyDriver OTP is: 123456")
msg["Subject"] = "OTP Test"
msg["From"] = EMAIL
msg["To"] = EMAIL  # sending to yourself

try:
    server = smtplib.SMTP("smtp.office365.com", 587)
    server.starttls()
    server.login(EMAIL, PASSWORD)
    server.send_message(msg)
    print("✅ SUCCESS!")
    server.quit()
except Exception as e:
    print(f"❌ FAILED: {e}")