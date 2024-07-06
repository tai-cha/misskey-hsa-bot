import puppeteer from 'puppeteer';

export const captureElement = async (url: string, selector: string, outputPath: string) => {
  // ヘッドレスモードでブラウザを起動します
  const browser = await puppeteer.launch({
    headless: true, // ヘッドレスモードをオンにします
    args: ['--window-size=1280,800'] // ウィンドウサイズを指定します
  });
  const page = await browser.newPage();

  // ビューポートを設定します
  await page.setViewport({ width: 1280, height: 800 });

  // 指定したURLにナビゲートします
  await page.goto(url, { waitUntil: "networkidle2" });

  // ページが完全にロードされるのを待ちます
  await page.waitForSelector(selector);

  // td2_lを表示するためにtd2_rをクリック
  if (selector === '#td2_l') {
    await page.evaluate((selector) => {
      if(typeof globalThis.swapTds === 'function') {
        globalThis.swapTds(document.querySelector(selector));
      }
    }, "#td2_s > a")
  }

  // 要素の位置にスクロールします
  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, selector);

  const customCSS = `
    span.b1, span.b2 {
      top: 14px !important;
    }
    span.p1, span.p2 {
      top: 60px !important;
    }
    span.r1, span.r2 {
      top: 106px !important;
    }
    div.map_container {
      height: 723px !important;
    }
  `;

  await page.evaluate((css) => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.append(style);
  }, customCSS)

  // 少し待ってからスクリーンショットを撮る（例：2秒待機）
  await setTimeout(() => {}, 2000);

  // 指定したセレクタの要素をキャプチャします
  const element = await page.$(selector);
  if (element) {
    await element.screenshot({ path: outputPath });
    console.log(`Screenshot saved to ${outputPath}`);
  } else {
    console.log(`Element with selector "${selector}" not found`);
  }

  // ブラウザを閉じます
  await browser.close();
};