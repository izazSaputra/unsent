# Unsent (Portfolio v3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Working rules for this repo (override defaults):** Izaz types the code; Claude explains each step and shows the code, and writes code only when Izaz explicitly asks for that step. Every "Commit" step is run **by Izaz**, with the message given and **no attribution trailer**. Claude never commits or pushes.

**Goal:** Rebuild Izaz's one-page portfolio as **Unsent**, a set of letters written in prose and code, with a source-code lens as the signature interaction and an epilogue where the visitor's letter finally gets sent.

**Architecture:** One React page with six sections (prologue, author, three project letters, epilogue), a fixed Contents bar, and a cursor lens. Design tokens live in one CSS file. All motion is GSAP inside `gsap.matchMedia()` with a reduced-motion branch. Behaviour is checked by a Puppeteer smoke script against the running dev server.

> **Change (2026-11-23):** at Izaz's request the v2 code was removed up front instead of in Task 8. Removed: `Hero`, `Manifesto`, `SelectedWorks` (+ css), `SectionIndex`, `Navbar`, `heroPointer.js`, `constant/`, `src/assets/`, `public/icons.svg`, and the unused `@fortawesome/*` packages. `src/App.jsx` is a bare `<main />` and `src/index.css` is empty. Kept: `src/utils/cursor.js`, `src/data/projects.js`, `public/images/projects/*`, `public/favicon.svg`. Task 1 Step 4 now writes `index.css` from an empty file, and Task 8 Step 4 is already done.

**Tech Stack:** React 19, Vite 8, GSAP 3 (ScrollTrigger, SplitText, `@gsap/react`), lucide-react, puppeteer-core (dev only), Google Fonts (Big Shoulders Display, Newsreader, JetBrains Mono).

**Spec:** `docs/superpowers/specs/2026-11-23-portfolio-v3-design.md`

## Global Constraints

- Colors only from tokens: `--ink: #151A3D`, `--paper: #E6E9F0`, `--nib: #C9A34A`, `--wash: #2C3366`, `--blot: #0B0D22`, `--paper-soft: rgba(230, 233, 240, 0.7)`. `--wash` is never used for text on `--ink`.
- Fonts: `--font-display: "Big Shoulders Display", Impact, sans-serif;` (headlines only), `--font-prose: "Newsreader", Georgia, serif;` (prose, labels, nav), `--font-code: "JetBrains Mono", ui-monospace, monospace;` (**only** source code in the lens and View source layer).
- No ALL-CAPS tracked labels, no "WORD — fragment" labels, no 01/02/03 numbering, no "→" appended to link text, no single accented word in a headline.
- No `white-space: nowrap` on display text; headlines use `clamp()` and may wrap. No horizontal page scroll at 360, 390, 1440, 1920px.
- Every GSAP animation lives inside a `gsap.matchMedia()` context with a `(prefers-reduced-motion: reduce)` branch that renders the final state.
- Section ids, in order: `prologue`, `author`, `akar`, `samira-travel`, `smilework`, `epilogue`.
- Placeholders Izaz must write are marked `// IZAZ:` in data files. Email placeholder `hello@example.com`, CV path `/cv.pdf`.
- Don't touch `src/Components/Navbar.jsx` or `src/assets/*`.

## Review Focus

1. **Wide-but-short and very narrow viewports** (1920×700, 360×640): headlines wrap and stay inside the viewport. Pinned in Task 4 at 360 and 1920.
2. **Touch devices**: the lens must not hide content behind an invisible layer, and "View source" must toggle. Pinned in Task 3.
3. **Reduced motion**: every section's content is visible with no scroll-scrub needed. Pinned in Task 8.
4. **Jumping via Contents links**: the section name in Contents matches the section in view after a jump. Pinned in Task 2.
5. **Empty letter or no email app on Send**: Send with an empty field must not open a blank email, and the plain email address must always be visible as a fallback. Pinned in Task 7.

---

### Task 0: Housekeeping

- [ ] **Step 1: Commit the lockfile rename left over from the rename**
```bash
git add package-lock.json
git commit -m "chore: update package-lock name to unsent"
```
- [ ] **Step 2: Commit these docs**
```bash
git add docs/superpowers
git commit -m "docs: add Unsent v3 design spec and implementation plan"
```

---

### Task 1: Foundation (tokens, fonts, reset, smoke harness)

**Files:**
- Create: `src/styles/tokens.css`, `scripts/smoke.mjs`
- Modify: `index.html`, `src/index.css` (full rewrite), `src/App.jsx`, `eslint.config.js`, `package.json`

**Interfaces:**
- Produces: the CSS custom properties from Global Constraints, in `src/styles/tokens.css`.
- Produces: `scripts/smoke.mjs`, holding an array `checks` of `{ name, viewport?: { width, height, hasTouch?, isMobile? }, reducedMotion?: boolean, run: async (page) => void }`. Each check gets a fresh page at its viewport (default 1440×900), navigated to `URL` with `waitUntil: "networkidle0"`. A check fails if it throws, or on any `pageerror` or console `error`. Helpers: `assert(cond, detail)` and `sleep(ms)`. CLI: `npm run smoke [-- --only <substring>]`; env `CHROME_PATH` (default `C:/Program Files/Google/Chrome/Application/chrome.exe`) and `URL` (default `http://localhost:5173`). Prints `PASS name` or `FAIL name: detail` per check, and exits 1 if any failed.
- The harness is about 60 lines of plumbing, not design. It's a good candidate for Izaz to ask Claude to type.

- [ ] **Step 1: Add the smoke harness**

`npm i -D puppeteer-core@23.11.1`; add `"smoke": "node scripts/smoke.mjs"` to `package.json` scripts; add an `eslint.config.js` block for `scripts/**` with `globals.node`. First checks:
```js
{ name: "foundation: ink background", run: async (p) => {
  const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert(bg === "rgb(21, 26, 61)", bg);
}},
{ name: "foundation: fonts loaded", run: async (p) => {
  const ok = await p.evaluate(async () => { await document.fonts.ready;
    return ['48px "Big Shoulders Display"', '18px "Newsreader"', '14px "JetBrains Mono"'].every((f) => document.fonts.check(f)); });
  assert(ok, "a font is missing");
}},
// one check per width W in [360, 390, 1440, 1920]:
{ name: `foundation: no horizontal scroll @${W}`, viewport: { width: W, height: 900 }, run: async (p) => {
  const [sw, iw] = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  assert(sw <= iw, `${sw} > ${iw}`);
}},
```
Run `npm run dev` in one terminal and `npm run smoke` in another. Expected: the harness runs; the background and fonts checks FAIL.
```bash
git add scripts/smoke.mjs package.json package-lock.json eslint.config.js
git commit -m "test: add browser smoke harness"
```

- [ ] **Step 2: Load the fonts**

`index.html`: add `preconnect` links to `fonts.googleapis.com` and `fonts.gstatic.com`, and one stylesheet link for Big Shoulders Display (700–900), Newsreader (opsz and weights 400–600, with italic), and JetBrains Mono (400). Check the exact family names at fonts.google.com first; if "Big Shoulders Display" has been merged into "Big Shoulders", use that name everywhere.
```bash
git commit -am "feat: load Big Shoulders Display, Newsreader and JetBrains Mono"
```

- [ ] **Step 3: Add the design tokens**

Create `src/styles/tokens.css` with `:root { ... }` holding every token from Global Constraints.
```bash
git add src/styles/tokens.css
git commit -m "feat: add pen-ink design tokens"
```

- [ ] **Step 4: Rewrite the global stylesheet**

`src/index.css`: `@import "./styles/tokens.css";`, box-sizing reset, `body { background: var(--ink); color: var(--paper); font-family: var(--font-prose); }`, `::selection { background: var(--nib); color: var(--ink); }`, a visible `:focus-visible` outline in `--nib`, and `.sr-only`. v2 components will look broken for a few commits after this, which is expected.
```bash
git commit -am "style: replace v2 global styles with Unsent base styles"
```

- [ ] **Step 5: Set up the empty page shell**

`src/App.jsx`: render `<main>` with six empty `<section>`s using the ids from Global Constraints, each with a temporary `min-height: 100vh`. Stop rendering the v2 components; their files are deleted in Task 8. Add one check:
```js
{ name: "foundation: section ids", run: async (p) => {
  const ids = await p.$$eval("main > section", (s) => s.map((e) => e.id));
  assert(JSON.stringify(ids) === JSON.stringify(["prologue","author","akar","samira-travel","smilework","epilogue"]), ids);
}},
```
Verify: `npm run smoke && npm run lint && npm run build` all pass.
```bash
git commit -am "feat: add Unsent page shell with section anchors"
```

---

### Task 2: Contents bar

**Files:**
- Create: `src/data/sections.js`, `src/Components/Contents.jsx`, `src/Components/Contents.css`
- Modify: `src/App.jsx`, `scripts/smoke.mjs`

**Interfaces:**
- Produces: `src/data/sections.js` exporting `sections`: `[{ id: "prologue", title: "Prologue" }, { id: "author", title: "Author's note" }, ...projects.map((p) => ({ id: p.id, title: p.title })), { id: "epilogue", title: "Epilogue" }]` (imports `projects`).
- Produces: `<Contents />` (no props): `<nav class="contents" aria-label="Contents">` with the site name "Unsent", `<span class="contents-current">` showing the title of the section in view, and links **Work** → `#${projects[0].id}`, **Contact** → `#epilogue`, **CV** → `/cv.pdf` (`target="_blank" rel="noopener"`). The current section comes from an `IntersectionObserver` on every section id, set up so the section crossing the middle of the viewport wins. Fixed position, Newsreader at a small size in sentence case, legible over both ink and paper slabs.

- [ ] **Step 1: Add the failing checks**
```js
{ name: "contents: links", run: async (p) => {
  const links = await p.$$eval(".contents a", (a) => a.map((e) => [e.textContent.trim(), e.getAttribute("href")]));
  assert(JSON.stringify(links) === JSON.stringify([["Work","#akar"],["Contact","#epilogue"],["CV","/cv.pdf"]]), links);
}},
{ name: "contents: jump updates current", run: async (p) => {
  await p.click('.contents a[href="#akar"]');
  await p.waitForFunction(() => document.querySelector(".contents-current")?.textContent.includes("AKAR"), { timeout: 4000 });
  await p.click('.contents a[href="#epilogue"]');
  await p.waitForFunction(() => document.querySelector(".contents-current")?.textContent.includes("Epilogue"), { timeout: 4000 });
}},
```
`npm run smoke -- --only contents` should FAIL.
```bash
git commit -am "test: add contents bar checks"
```
- [ ] **Step 2: Add the section list**
```bash
git add src/data/sections.js
git commit -m "feat: add section list for navigation"
```
- [ ] **Step 3: Build the Contents bar.** Add `html { scroll-behavior: smooth }`, except under reduced motion. Checks pass.
```bash
git add src/Components/Contents.jsx src/Components/Contents.css src/App.jsx
git commit -m "feat: add fixed contents bar with current section"
```

---

### Task 3: Source lens

**Files:**
- Create: `src/Components/Revealable.jsx`, `src/Components/Revealable.css`
- Modify: `src/utils/cursor.js`, `src/App.jsx`, `scripts/smoke.mjs`

**Interfaces:**
- Consumes: `initCursor(cursorElement)` from `src/utils/cursor.js`. Keep its `data-cursor-reveal`, `is-revealing`, `--rx`/`--ry` contract.
- Produces: `<Revealable source={string} label={string}>{children}</Revealable>`. It renders a wrapper with `data-cursor-reveal`, the children, and `<pre class="revealable-source" aria-hidden="true"><code>{source}</code></pre>` on top, clipped by `clip-path: circle(var(--lens-r, 0px) at var(--rx) var(--ry))`. `--lens-r` is about `110px` while the wrapper has `.is-revealing`. On `(pointer: coarse)` it renders a "View source" button (`aria-pressed`) that toggles `.is-source`, which shows the source layer with `clip-path: none`.
- Produces: `.cursor` is a small `--nib` ring, and `.cursor.is-reveal` grows to the lens diameter. `App` mounts the cursor element once and calls `initCursor` in an effect.

- [ ] **Step 1: Add the failing checks** (put a temporary `<Revealable source="const a = 1;" label="test">` in `#prologue`)
```js
{ name: "lens: hover reveals source", run: async (p) => {
  const el = await p.$("[data-cursor-reveal]"); assert(el, "no revealable");
  const b = await el.boundingBox(); await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await p.waitForFunction(() => document.querySelector("[data-cursor-reveal]").classList.contains("is-revealing"));
  const txt = await p.$eval("[data-cursor-reveal] .revealable-source", (e) => e.textContent.trim());
  assert(txt.length > 0, "empty source");
}},
{ name: "lens: touch toggle", viewport: { width: 390, height: 844, hasTouch: true, isMobile: true }, run: async (p) => {
  const btn = await p.$("[data-cursor-reveal] button"); assert(btn, "no toggle");
  await btn.tap();
  assert(await p.$eval("[data-cursor-reveal] button", (b) => b.getAttribute("aria-pressed")) === "true", "not pressed");
}},
```
```bash
git commit -am "test: add source lens checks"
```
- [ ] **Step 2: Restyle the cursor as a nib ring and mount it in App**
```bash
git commit -am "feat: restyle cursor as nib-gold ring"
```
- [ ] **Step 3: Build `Revealable` for pointer devices** (the hover check passes)
```bash
git add src/Components/Revealable.jsx src/Components/Revealable.css
git commit -m "feat: add source lens revealable component"
```
- [ ] **Step 4: Add the touch "View source" toggle** (the touch check passes)
```bash
git commit -am "feat: add view source toggle for touch devices"
```

---

### Task 4: Prologue

**Files:**
- Create: `src/data/content.js`, `src/Components/Prologue.jsx`, `src/Components/Prologue.css`
- Modify: `src/App.jsx`, `scripts/smoke.mjs`

**Interfaces:**
- Produces: `src/data/content.js` exporting `prologue = { typed: 'write("I build interfaces the way I write letters.");', title: "I build interfaces the way I write letters.", site: "Unsent", name: "Izaz Saputra", role: "Frontend developer", place: "Malang, Indonesia" }`. The title is a placeholder; mark it `// IZAZ:`. `author` and `epilogue` are added in Tasks 5 and 7.
- Produces: `<Prologue />` inside `section#prologue`. Site, name, role, and place are visible from first paint. Motion branch: `.prologue-typed` types `prologue.typed` character by character in mono (about 1.2s), then the typed line collapses and `h1.prologue-title` (Big Shoulders Display, `clamp(56px, 11vw, 200px)`, wraps) sets in line by line through SplitText line masks. The `h1` is wrapped in `<Revealable>`, whose `source` is this component's JSX as a string. Reduced-motion branch: the `h1` is shown immediately and the typed line is hidden.

- [ ] **Step 1: Add the failing checks**
```js
{ name: "prologue: identity visible at once", run: async (p) => {
  await p.reload({ waitUntil: "domcontentloaded" }); await sleep(800);
  const t = await p.$eval("#prologue", (e) => e.innerText);
  assert(t.includes("Izaz Saputra") && t.includes("Frontend developer"), t);
}},
// for W in [360, 1920]:
{ name: `prologue: title fits @${W}`, viewport: { width: W, height: 700 }, run: async (p) => {
  await sleep(3500);
  const r = await p.$eval("#prologue h1", (e) => { const b = e.getBoundingClientRect(); return [b.left, b.right, innerWidth, getComputedStyle(e).fontFamily]; });
  assert(r[0] >= 0 && r[1] <= r[2] && r[3].includes("Big Shoulders"), r);
}},
```
```bash
git commit -am "test: add prologue checks"
```
- [ ] **Step 2: Add the prologue content data**
```bash
git add src/data/content.js
git commit -m "feat: add prologue copy"
```
- [ ] **Step 3: Static prologue layout** (no motion yet; remove the temporary Revealable from Task 3)
```bash
git add src/Components/Prologue.jsx src/Components/Prologue.css src/App.jsx
git commit -m "feat: add static prologue layout"
```
- [ ] **Step 4: Type-then-compile animation with the reduced-motion branch.** Checks pass; take a 1440×900 screenshot and look at it.
```bash
git commit -am "feat: animate prologue typing and compile"
```
- [ ] **Step 5: Wrap the title in the source lens**
```bash
git commit -am "feat: reveal prologue source through the lens"
```

---

### Task 5: Author's note

**Files:**
- Create: `src/Components/AuthorNote.jsx`, `src/Components/AuthorNote.css`
- Modify: `src/data/content.js`, `src/App.jsx`, `scripts/smoke.mjs`

**Interfaces:**
- Produces: `content.js` exports `author = { heading: string, paragraphs: string[], facts: [["Role","Frontend developer"],["Based in","Malang, Indonesia"],["Writes in","React, GSAP, CSS, and prose"],["Status","Open to work"]] }`; `heading` and `paragraphs` are placeholder prose marked `// IZAZ:`.
- Produces: `<AuthorNote />` inside `section#author`: an `h2` in Big Shoulders Display, paragraphs in Newsreader wrapped in one `<Revealable>`, and `<dl class="facts">` rendering `facts`. Heading lines set in on scroll (motion branch only).

- [ ] **Step 1: Add the failing check**: `#author h2` exists, `#author dl.facts dt` count is 4, and `#author [data-cursor-reveal]` exists.
```bash
git commit -am "test: add author's note checks"
```
- [ ] **Step 2: Author's note copy and static layout**
```bash
git add src/Components/AuthorNote.jsx src/Components/AuthorNote.css
git commit -am "feat: add author's note section"
```
- [ ] **Step 3: Heading reveal on scroll and source lens.** Checks pass; take screenshots at 1440 and 390.
```bash
git commit -am "feat: animate author's note heading and add source lens"
```

---

### Task 6: Project letters with diagonal slabs

**Files:**
- Create: `src/Components/ProjectLetter.jsx`, `src/Components/ProjectLetter.css`
- Modify: `src/data/projects.js`, `src/App.jsx`, `scripts/smoke.mjs`

**Interfaces:**
- Consumes: `<Revealable>` (Task 3).
- Produces: each object in `projects.js` gains `type` and `note` (from v2 `editions`: "Data and education" / "Making complex data feel clear."; "Travel company profile" / "A considered start to a meaningful journey."; "Spaces and services" / "A digital home for spaces with character."), and `source` (a plausible JSX or CSS snippet string for that project). Existing fields stay unchanged.
- Produces: `<ProjectLetter project={Project} index={number} />` rendering `section#{project.id}.letter`. Entry: a `.letter-blot` panel in `--blot` whose `clip-path: polygon(...)` is scrubbed by ScrollTrigger, so a diagonal edge (8°–14°) sweeps across and uncovers a `--paper` slab. Content: `type` in small Newsreader, the title in Big Shoulders Display in `--ink`, a `<figure>` with the screenshot (`width="2880" height="1800"`, `loading="lazy"`) wrapped in `<Revealable source={project.source}>`, `note` in Newsreader italic, then category, role, description, and the links **Visit website** (→ `url`) and **Source code** (→ `repository`, only if present), both `target="_blank" rel="noopener noreferrer"`. Odd indexes mirror the layout.

- [ ] **Step 1: Add the failing checks**
```js
{ name: "letters: three projects", run: async (p) => {
  const ids = await p.$$eval("section.letter", (s) => s.map((e) => e.id));
  assert(JSON.stringify(ids) === JSON.stringify(["akar","samira-travel","smilework"]), ids);
}},
{ name: "letters: images load and keep ratio", run: async (p) => {
  for (const id of ["akar","samira-travel","smilework"]) {
    await p.$eval(`#${id}`, (e) => e.scrollIntoView()); await sleep(1200);
    const [nw, ratio] = await p.$eval(`#${id} figure img`, (i) => { const b = i.getBoundingClientRect(); return [i.naturalWidth, b.width / b.height]; });
    assert(nw > 0 && Math.abs(ratio - 1.6) < 0.05, `${id} ${nw} ${ratio}`);
  }
}},
{ name: "letters: visit links", run: async (p) => {
  const l = await p.$$eval("section.letter a", (a) => a.filter((e) => e.textContent.includes("Visit")).map((e) => [e.href, e.target]));
  assert(l.length === 3 && l.every(([h, t]) => h.startsWith("https://") && t === "_blank"), l);
}},
```
```bash
git commit -am "test: add project letter checks"
```
- [ ] **Step 2: Extend the project data**
```bash
git commit -am "feat: add type, note and source snippet to projects"
```
- [ ] **Step 3: Static project letter layout** (the three checks pass)
```bash
git add src/Components/ProjectLetter.jsx src/Components/ProjectLetter.css
git commit -am "feat: add project letter layout on paper slabs"
```
- [ ] **Step 4: Scroll-scrubbed diagonal blot transition** with the reduced-motion branch. Take screenshots mid-sweep and settled at 1440 and 390.
```bash
git commit -am "feat: add diagonal slab transition between letters"
```
- [ ] **Step 5: Source lens on screenshots**
```bash
git commit -am "feat: reveal project source through the lens"
```

---

### Task 7: Epilogue, the letter that gets sent

**Files:**
- Create: `src/Components/Epilogue.jsx`, `src/Components/Epilogue.css`
- Modify: `src/data/content.js`, `src/App.jsx`, `scripts/smoke.mjs`

**Interfaces:**
- Produces: `content.js` exports `epilogue = { letter: string[], signoff: "Izaz", email: "hello@example.com", cv: "/cv.pdf", subject: "A letter from your portfolio", links: [{ label: "GitHub", href: "" }, { label: "LinkedIn", href: "" }] }`. `letter`, `email`, and the `href`s are marked `// IZAZ:`. Links with an empty `href` aren't rendered.
- Produces: `<Epilogue />` inside `section#epilogue`: `h2` reading "Unsent", Izaz's letter paragraphs and signoff, a labelled `<textarea id="visitor-letter">` ("Write back"), and a **Send** button. Send is disabled while the trimmed text is empty. On Send: set `location.href` to `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}` and change the `h2` to "Sent" (the "Sent" word in `--nib`, with a short motion in the motion branch). Always visible: the plain email as a `mailto:` link, a **Download CV** link to `cv`, and the social links.

- [ ] **Step 1: Add the failing checks**
```js
{ name: "epilogue: send disabled when empty", run: async (p) => {
  assert(await p.$eval("#epilogue button[type=submit], #epilogue button.send", (b) => b.disabled), "send enabled on empty");
}},
{ name: "epilogue: fallback contact always visible", run: async (p) => {
  assert(await p.$('#epilogue a[href^="mailto:"]'), "no plain email link");
  assert(await p.$('#epilogue a[href="/cv.pdf"]'), "no CV link");
}},
{ name: "epilogue: sending turns Unsent into Sent", run: async (p) => {
  await p.evaluate(() => { window.__mail = null; Object.defineProperty(window, "location", { value: { set href(v) { window.__mail = v; } } }); });
  await p.type("#visitor-letter", "Hello Izaz");
  await p.click("#epilogue button.send");
  assert((await p.$eval("#epilogue h2", (h) => h.textContent)).includes("Sent"), "heading not Sent");
}},
```
(If `location` can't be redefined in Chrome, make `Epilogue` call an injectable `openMail(url)` helper from `src/utils/mail.js` and stub that in the check instead.)
```bash
git commit -am "test: add epilogue checks"
```
- [ ] **Step 2: Epilogue copy and static letter layout**
```bash
git add src/Components/Epilogue.jsx src/Components/Epilogue.css
git commit -am "feat: add epilogue letter layout"
```
- [ ] **Step 3: Write back and Send with mailto** (checks pass)
```bash
git commit -am "feat: let visitors write back and send a letter"
```
- [ ] **Step 4: Unsent to Sent heading transition**
```bash
git commit -am "feat: animate Unsent turning into Sent"
```

---

### Task 8: Reduced motion, mobile pass, remove v2

**Files:**
- Delete: `src/Components/Hero.jsx`, `src/Components/Manifesto.jsx`, `src/Components/SelectedWorks.jsx`, `src/Components/SelectedWorks.css`, `src/Components/SectionIndex.jsx`, `src/utils/heroPointer.js`, `constant/index.js`
- Modify: any component whose motion bypasses the reduced-motion branch; `scripts/smoke.mjs`

- [ ] **Step 1: Add the failing check**
```js
{ name: "reduced motion: all content visible", reducedMotion: true, run: async (p) => {
  await sleep(300);
  const hidden = await p.evaluate(() => [...document.querySelectorAll("main h1, main h2, main figure, main p")]
    .filter((e) => { const s = getComputedStyle(e); return +s.opacity < 1 || s.visibility === "hidden"; }).length);
  assert(hidden === 0, `${hidden} hidden`);
}},
```
(`reducedMotion: true` means the harness calls `page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }])` before navigating.)
```bash
git commit -am "test: add reduced motion check"
```
- [ ] **Step 2: Fix anything that fails the check** (skip this step if it already passes)
```bash
git commit -am "fix: respect reduced motion in all sections"
```
- [ ] **Step 3: Mobile pass.** Take screenshots of every section at 390×844 and fix spacing or wrapping problems.
```bash
git commit -am "style: polish Unsent layout on mobile"
```
- [ ] **Step 4: Remove the v2 components.** Afterwards, `grep -rE "heroPointer|SelectedWorks|SectionIndex|Manifesto|constant/index" src` should print nothing.
```bash
git rm src/Components/Hero.jsx src/Components/Manifesto.jsx src/Components/SelectedWorks.jsx src/Components/SelectedWorks.css src/Components/SectionIndex.jsx src/utils/heroPointer.js constant/index.js
git commit -m "chore: remove v2 Mono components"
```
- [ ] **Step 5: Final verification**: `npm run smoke && npm run lint && npm run build` all pass, and screenshots at 390×844 and 1440×900 have been reviewed with Izaz.
