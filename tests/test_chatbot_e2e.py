import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
def get_driver():
    # Try Chrome with Selenium 4 native driver resolution
    try:
        options = webdriver.ChromeOptions()
        # options.add_argument("--headless")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        return webdriver.Chrome(options=options)
    except Exception as e:
        print(f"Chrome initialization failed ({e}), falling back to Edge...")
        edge_options = webdriver.EdgeOptions()
        return webdriver.Edge(options=edge_options)

def test_chat_interaction():
    driver = get_driver()
    driver.maximize_window()

    try:
        # 2. Open Login Page
        print("[1/4] Navigating to Campus Mitra...")
        driver.get("http://localhost:5174/login")
        wait = WebDriverWait(driver, 10)

        # 3. Enter Credentials & Login
        print("[2/4] Logging in...")
        username_input = wait.until(EC.presence_of_element_located((By.NAME, "username")))
        password_input = driver.find_element(By.NAME, "password")

        username_input.send_keys("teststudent")
        password_input.send_keys("password123")
        
        # Click login button
        login_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]")
        login_btn.click()

        # 4. Navigate to Chat page
        print("[3/4] Navigating to Chat...")
        driver.get("http://localhost:5174/chat")

        # 5. Send a Question to the Chatbot
        chat_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder]")))
        test_query = "What are the eligibility criteria for admission?"
        print(f"[4/4] Sending query: '{test_query}'")
        
        chat_input.send_keys(test_query)
        chat_input.send_keys(Keys.ENTER)

        # 6. Wait for AI response to appear
        time.sleep(4)  # Wait for AI RAG pipeline
        messages = driver.find_elements(By.XPATH, "//div[contains(@class, 'messageBubble')]")
        
        print(f"Total messages rendered: {len(messages)}")
        for i, msg in enumerate(messages):
            print(f"Message {i+1}: {msg.text[:80]}...")

        assert len(messages) >= 2, "Chatbot did not respond!"
        print("Test Passed Successfully!")

    finally:
        driver.quit()

if __name__ == "__main__":
    test_chat_interaction()
