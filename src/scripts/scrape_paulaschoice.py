from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import json
import time

BASE_URL = "https://www.paulaschoice.com"

def get_product_links():
    print("🔍 Loading skincare product page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=80)
        page = browser.new_page()
        page.goto(f"{BASE_URL}/skin-care-products", timeout=60000, wait_until="domcontentloaded")
        time.sleep(6)

        # Close any modal popup if present
        try:
            page.click("button[aria-label='Close']")
            time.sleep(1)
        except:
            pass

        html = page.content()
        soup = BeautifulSoup(html, "html.parser")

        product_links = []
        for a in soup.select("a.ProductCarouselTileStyles__TileContent-sc-gatefb-1"):
            href = a.get("href")
            if href and href.startswith("/"):
                full_url = BASE_URL + href.split("?")[0]
                if full_url not in product_links:
                    product_links.append(full_url)

        browser.close()
        print(f"✅ Found {len(product_links)} product links.")
        return product_links

# === Run and save
if __name__ == "__main__":
    links = get_product_links()

    with open("paulaschoice_product_links.json", "w") as f:
        json.dump(links, f, indent=2)

    print("🎉 Saved all product links to paulaschoice_product_links.json")


