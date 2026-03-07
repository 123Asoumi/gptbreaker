const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

    console.log('Navigating to local server...');
    await page.goto('http://127.0.0.1:1337/index.html');

    console.log('Clicking login button on navbar...');
    await page.click('a[onclick*="openLoginModal"]');

    console.log('Waiting for modal...');
    await page.waitForTimeout(500);

    console.log('Clicking Google auth button...');
    await page.click('button[data-google-auth]');

    await page.waitForTimeout(2000);

    console.log('Filling form and submitting...');
    await page.fill('#email', 'test@test.com');
    await page.fill('#password', 'password123');
    await page.click('#submitBtn');

    await page.waitForTimeout(2000);

    await browser.close();
    console.log('Done.');
})();
