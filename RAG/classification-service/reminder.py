

from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta

scheduler = BackgroundScheduler()
scheduler.start()

def send_reminder(student_name, message):
    print(f"✅ Reminder sent to {student_name}: {message}")

# Simulate scheduling a reminder for a specific date/time
target_time = datetime.now() + timedelta(seconds=15)

scheduler.add_job(
    send_reminder,
    "date",
    run_date=target_time,
    args=["Rahul", "Your income certificate is still pending. Please upload it soon."]
)

print(f"⏳ Reminder scheduled for {target_time.strftime('%H:%M:%S')}")
print("Waiting...")
input("Press Enter to exit early\n")