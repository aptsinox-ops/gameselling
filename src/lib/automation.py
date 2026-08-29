import sys
import asyncio
import json
import re
from playwright.async_api import async_playwright

async def process_freefire_topup(player_uid: str, diamond_amount: str, voucher_code: str, pin_code: str = ""):
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-infobars",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--window-size=1280,800",
            ]
        )

        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            viewport={'width': 1280, 'height': 800},
            locale="en-US"
        )
        
        page = await context.new_page()

        # 🟢 স্পিড ৩ গুণ বাড়াতে অপ্রয়োজনীয় ছবি, ফন্ট এবং ভিডিও ব্লক করা হলো
        await page.route("**/*", lambda route, req: route.abort() if req.resource_type in ["image", "media", "font"] else route.continue_())

        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)

        try:
            #১. পেজ লোড
            await page.goto("https://shop.garena.my/?app=100067&channel=202953", wait_until="domcontentloaded", timeout=20000)

            # ২. UID ইনপুট (Fast Fill)
            uid_input = page.locator("input[placeholder*='player ID'], input[placeholder*='Player ID'], input[type='text']").first
            await uid_input.wait_for(timeout=8000)
            await uid_input.fill(str(player_uid)) # type(delay=100) এর জায়গায় দ্রুত fill করা হলো

            login_btn = page.locator("button:has-text('Login'), div[role='button']:has-text('Login'), .login-btn").first
            if await login_btn.is_visible():
                await login_btn.click()
            else:
                await page.keyboard.press("Enter")

            # ৩. Proceed to Payment
            proceed_btn = page.locator("button:has-text('Proceed to Payment'), div[role='button']:has-text('Proceed to Payment')").first
            await proceed_btn.wait_for(timeout=8000)
            await proceed_btn.click()

            # ৪. ডায়মন্ড সিলেক্ট
            num_only = re.sub(r"\D", "", str(diamond_amount))
            diamond_option = page.locator(f"text=/{num_only}\\s*Diamond/i").first
            if await diamond_option.is_visible(timeout=3000):
                await diamond_option.click()
            else:
                await page.locator(f"text={num_only}").first.click()

            # ৫. Physical Voucher সিলেক্ট
            physical_voucher_tab = page.locator("text=Physical Vouchers").first
            await physical_voucher_tab.wait_for(timeout=6000)
            await physical_voucher_tab.click()

            # ৬. ভাউচার ফিল্টারিং
            if " " in voucher_code or "," in voucher_code:
                parts = re.split(r'[\s,]+', voucher_code.strip())
                raw_serial = parts[0]
                raw_pin = parts[1] if len(parts) > 1 else pin_code
            else:
                raw_serial = voucher_code
                raw_pin = pin_code

            clean_serial = re.sub(r'[^A-Za-z0-9]', '', raw_serial).strip().upper()
            clean_pin = re.sub(r'[^A-Za-z0-9]', '', raw_pin).strip()

            if clean_serial.startswith("BDMB"):
                unipin_option = page.locator("text=/UniPin/i").first
                await unipin_option.click()
            elif clean_serial.startswith("UPBD"):
                up_gift_option = page.locator("text=/UP Gift/i").first
                await up_gift_option.click()
            else:
                return json.dumps({"success": False, "reason": "INVALID_PREFIX", "message": "Invalid Voucher Prefix"})

            # ৭. Frame খোঁজা
            target_scope = page
            await page.wait_for_timeout(1000) # আইফ্রেম লোড হওয়ার নিরাপদ ১ সে. সময়
            for frame in page.frames:
                if "unipin" in frame.url or "unibox" in frame.url:
                    target_scope = frame
                    break

            # ৮. সিরিয়াল ও পিন ইনপুট
            serial_input = target_scope.locator("input[placeholder*='UPBD'], input[placeholder*='Serial'], input[type='text']").first
            await serial_input.wait_for(timeout=8000)
            await serial_input.fill(clean_serial)

            pin_inputs = target_scope.locator("input[type='password'], input[name*='pin'], input[id*='pin']")
            pin_count = await pin_inputs.count()

            if pin_count >= 4 and len(clean_pin) >= 12:
                chunks = [clean_pin[i:i+4] for i in range(0, len(clean_pin), 4)]
                for idx, chunk in enumerate(chunks[:4]):
                    await pin_inputs.nth(idx).fill(chunk)
            elif pin_count > 0:
                if len(clean_pin) == 16:
                    formatted_pin = "-".join([clean_pin[i:i+4] for i in range(0, 16, 4)])
                    await pin_inputs.first.fill(formatted_pin)
                else:
                    await pin_inputs.first.fill(clean_pin)

            # ৯. Confirm বাটনে ক্লিক
            confirm_btn = target_scope.locator("input[type='submit'][value='Confirm'], input[value='Confirm']").first

            if await confirm_btn.is_visible(timeout=2000):
                await confirm_btn.click(force=True)
            else:
                await target_scope.evaluate("""
                    const btn = document.querySelector("input[type='submit'][value='Confirm']") || 
                                document.querySelector("input[value='Confirm']");
                    if (btn) btn.click();
                """)

            # ১০. রেসপন্সের জন্য অপেক্ষা (সাত সেকেন্ড থেকে কমিয়ে ৩ সেকেন্ড করা হয়েছে)
            await page.wait_for_timeout(3000)

            content = await target_scope.content()
            main_content = await page.content()
            full_text = (content + main_content).lower()
            current_url = page.url.lower()

            if "consumed voucher" in full_text or "consumed%20voucher" in current_url:
                return json.dumps({"success": False, "reason": "CONSUMED_VOUCHER", "message": "Voucher is already consumed/used."})

            success_keywords = [
                "transaction successful",
                "transactions successful",
                "successful",
                "transaction success",
                "transactions success",
                "success",
                "completed",
            ]

            if any(word in full_text for word in success_keywords):
                return json.dumps({"success": True, "message": "Topup Completed Successfully!"})
            else:
                return json.dumps({"success": False, "reason": "FAILED", "message": "Transaction Failed or Invalid Voucher Error."})

        except Exception as e:
            return json.dumps({"success": False, "reason": "ERROR", "message": str(e)})

        finally:
            await browser.close()

if __name__ == "__main__":
    if len(sys.argv) > 4:
        p_uid, d_amount, v_serial, v_pin = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
        res = asyncio.run(process_freefire_topup(p_uid, d_amount, v_serial, v_pin))
    elif len(sys.argv) == 4:
        p_uid, d_amount, v_code = sys.argv[1], sys.argv[2], sys.argv[3]
        res = asyncio.run(process_freefire_topup(p_uid, d_amount, v_code))
    else:
        res = json.dumps({"success": False, "reason": "INVALID_PARAMS", "message": "Missing Arguments"})
    
    print(res)