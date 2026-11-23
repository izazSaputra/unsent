import puppeteer from "puppeteer-core";

const CHROME_PATH =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE_URL = process.env.URL ?? "http://localhost:5173";

const onlyIndex = process.argv.indexOf("--only");
const only = onlyIndex === -1 ? null : process.argv[onlyIndex + 1];

const assert = (condition, detail) => {
  if (!condition) {
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
};
// eslint-disable-next-line no-unused-vars -- used by checks added in later tasks
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checks = [
  {
    name: "foundation: ink background",
    run: async (page) => {
      const bg = await page.evaluate(
        () => getComputedStyle(document.body).backgroundColor,
      );
      assert(bg === "rgb(21, 26, 61)", bg);
    },
  },
  {
    name: "foundation: fonts loaded",
    run: async (page) => {
      // fonts.check() returns true for unknown families, so load() each one
      // and treat an empty result as missing.
      const missing = await page.evaluate(async () => {
        const fonts = [
          '48px "Big Shoulders Display"',
          '18px "Newsreader"',
          '14px "JetBrains Mono"',
        ];
        const loaded = await Promise.all(
          fonts.map((font) => document.fonts.load(font)),
        );
        return fonts.filter((_, index) => loaded[index].length === 0);
      });
      assert(missing.length === 0, `missing: ${missing.join(", ")}`);
    },
  },
  ...[360, 390, 1440, 1920].map((width) => ({
    name: `foundation: no horizontal scroll @${width}`,
    viewport: { width, height: 900 },
    run: async (page) => {
      const [scrollWidth, innerWidth] = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        window.innerWidth,
      ]);
      assert(scrollWidth <= innerWidth, `${scrollWidth} > ${innerWidth}`);
    },
  })),
];

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
});

let failed = 0;

for (const check of checks.filter((c) => !only || c.name.includes(only))) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  try {
    await page.setViewport(check.viewport ?? { width: 1440, height: 900 });
    if (check.reducedMotion) {
      await page.emulateMediaFeatures([
        { name: "prefers-reduced-motion", value: "reduce" },
      ]);
    }
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await check.run(page);
    assert(errors.length === 0, `page errors: ${errors.join(" | ")}`);
    console.log(`PASS ${check.name}`);
  } catch (error) {
    failed++;
    console.log(`FAIL ${check.name}: ${error.message}`);
  } finally {
    await page.close();
  }
}

await browser.close();
process.exit(failed ? 1 : 0);
