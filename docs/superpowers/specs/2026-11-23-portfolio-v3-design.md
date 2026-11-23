# Unsent — Portfolio v3 Design

Status: direction approved by Izaz in chat on 2026-11-23. Branch: `arc-unsent`. Repo: `github.com/izazSaputra/unsent`.

## Intent

Izaz's previous portfolio ("MONO", v2) looked well made but generic: black and white, sans plus Playfair italic accents, scroll reveals and a custom cursor. Nothing about it was specific to Izaz. Izaz wants a site that feels unmistakably *theirs*, at Awwwards level.

Who Izaz is, in their own words: a writer and reader, a harsh judge of design, someone who loves motion, drawn to minimalist-but-strong design close to the design language of *Metaphor: ReFantazio*, carrying a sad love story, and known by friends for frontend and web design.

Success, in Izaz's words:
1. Visitors feel the design is unique, something they haven't seen before.
2. Visitors immediately read Izaz as a frontend developer.
3. It leads to being hired.

## Name and concept

**Unsent**: a collection of letters that were never sent, until one finally is.

Izaz writes in two languages: **prose and code**. Each piece of prose on the page has its source code underneath, and visitors can read it through a lens. The prose is the letter; the code is its draft.

The site ends with the **one letter that finally gets sent**: the visitor writes to Izaz. "Unsent" turns into "Sent". The melancholy resolves into hope, and the hirer becomes part of the story.

The sad love story is **never told**. It is carried only as tone: a slightly melancholic voice in the copy, and the name itself.

The *Metaphor: ReFantazio* influence is its design language only: oversized kinetic type, hard diagonal slabs, dramatic transitions, a book as the frame. No assets, characters, logos, fonts, or UI copied from the game.

## Goals

- One signature interaction visitors remember: **the source lens**.
- Projects, contact, and CV reachable within a few seconds from anywhere on the page.
- Motion that a frontend reviewer recognises as hand-built, not templated.

## Non-goals (for now)

- A writings section. It can be added later as another letter.
- WebGL or 3D, sound, page routing, a CMS, a backend.
- Tailoring to one kind of hirer. Designed to creative-studio standard, which also serves startups and clients. This was Claude's call; Izaz has no specific hirer in mind.

## Anti-goals (failure even if it works)

- A recruiter can't find projects, contact, or CV quickly.
- It reads as a writer's or illustrator's site instead of a frontend developer's.
- It looks like a recognisable template, or like the game's UI.
- It falls into common AI-generated design tells: cream background with a serif and a warm accent; ALL-CAPS tracked labels; "WORD — fragment" labels; mono used for decorative labels; 01/02/03 numbering on content that isn't a sequence; "→" appended to link text; one italic word accented in a headline.
- Motion blocks reading, or is forced on visitors with `prefers-reduced-motion: reduce`.
- Horizontal page scroll or headlines clipped by the viewport at any width from 360px to 1920px. v2 clipped its hero at 1440px.

## Visual system: "pen ink"

Grounded in a writer's dip pen: blue-black ink, cool paper, a gold nib.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#151A3D` | page background (blue-black ink, not neutral black) |
| `--paper` | `#E6E9F0` | text on ink; the light diagonal slabs |
| `--nib` | `#C9A34A` | the only accent: lens ring, active item in Contents, link underline, the word "Sent" |
| `--wash` | `#2C3366` | the source layer inside the lens; never used for text on `--ink` (too low contrast) |
| `--blot` | `#0B0D22` | the panel that sweeps across in slab transitions |
| `--paper-soft` | `rgba(230, 233, 240, 0.7)` | secondary text on ink |

Text on `--paper` slabs uses `--ink`.

**Type**
- **Big Shoulders Display** (Google Fonts): headlines and display text only. Condensed and strong, built to be set huge, cut by slab edges, and animated.
- **Newsreader** (Google Fonts, variable, with italics): prose, labels, navigation, metadata. Labels are sentence case, not all caps.
- **JetBrains Mono** (Google Fonts): **only** for real source code inside the lens and the touch "view source" layer. Never for decoration.
- Headline sizes use `clamp()` and may wrap. Nothing at display size uses `white-space: nowrap`.
- Prose measure is about 65 characters. Newsreader body gets a line-height of about 1.55.

**Composition**
- Left-aligned, ragged right. No hairline-rule broadsheet layout.
- Structure comes from **diagonal slabs**: each project sits on a paper slab cut at an angle between 8° and 14°. Headlines may be cropped by a slab's edge on purpose, but never by the viewport.
- Projects are named, not numbered. Their order isn't a sequence.

## Page structure (one page, top to bottom)

| Section id | What it is |
|---|---|
| `prologue` | The hero. A line of code types itself (in mono, inside the lens style), then "compiles" into the same sentence set huge in Big Shoulders Display. The site name, Izaz's name, and the role are visible from first paint, not animated in. |
| `author` | Author's note (about). Short first-person prose by Izaz plus a small facts list: role, location, what they write in, availability. Copy is a placeholder Izaz writes. |
| `akar`, `samira-travel`, `smilework` | One letter per project, ids taken from `projects.js`. Each opens with a slab transition: a blot panel sweeps across diagonally as the visitor scrolls, revealing a paper slab with the project. Shows the screenshot, a one-line note, category, role, description, and links to the live site and the source code (if any). Layout mirrors left/right per project. |
| `epilogue` | The letter that finally gets sent. A short letter from Izaz, then a field where the visitor writes their own message, and a **Send** button. Send opens the visitor's email app with the message filled in (`mailto:` with subject and body). The heading changes from "Unsent" to "Sent". Izaz's email address and a CV link are also shown plainly, for visitors who'd rather copy them. |

**Contents** (always visible): a small fixed bar with the site name "Unsent", the name of the section in view, and three links that are always present: **Work** (to the first project), **Contact** (to `#epilogue`), and **CV** (`/cv.pdf`, new tab). This replaces v2's SectionIndex and is the "findable in seconds" guardrail.

## Signature interaction: the source lens

- On fine-pointer devices the cursor is a small nib-gold ring.
- Over any element marked revealable (the prologue headline, the author's note, each project screenshot), the ring grows into a lens. Inside the circle, visitors see that element's **source code** (JetBrains Mono, paper text on `--wash`) instead of the rendered prose or image.
- Built on the existing `src/utils/cursor.js` reveal mechanism (`data-cursor-reveal`, `is-revealing`, `--rx` and `--ry`). The source layer is masked by a circle at `--rx`/`--ry`.
- Touch devices: no lens. Each revealable gets a small "View source" toggle that shows the source layer in full.
- Reduced motion: the lens still works, since it responds to the visitor rather than playing on its own, but transitions inside it are instant.

## Motion

- GSAP with ScrollTrigger and SplitText, as v2 already uses.
- Only **one** sequence plays on its own: the prologue's type-then-compile on load. Everything else answers the visitor: slab transitions scrubbed to scroll, the lens to the cursor, the "Unsent" to "Sent" change to the Send button.
- All motion is created inside `gsap.matchMedia()`, with a `(prefers-reduced-motion: reduce)` branch that shows the final state with no movement.

## Technology

Keep React 19, Vite 8, GSAP 3 and lucide-react. Fonts are loaded via a Google Fonts `<link>` in `index.html`. Add `puppeteer-core` as a dev dependency for a browser smoke script. It uses the locally installed Chrome via `CHROME_PATH`, because the repo has no test runner and the behaviour that matters is visual and DOM behaviour in a real browser.

## Reuse vs. replace

- **Keep:** `vite.config.js`, `eslint.config.js`, `src/main.jsx`, `public/images/projects/*`.
- **Keep and extend:** `src/data/projects.js` (new fields), `src/utils/cursor.js` (the lens).
- **Replace:** `Hero`, `Manifesto`, `SelectedWorks` (and its CSS), `SectionIndex`, `heroPointer.js`, `constant/index.js`, `src/index.css`. Old components are removed only at the end, so the site runs at every commit.
- **Leave alone** (unused already, not part of this work): `src/Components/Navbar.jsx`, `src/assets/*`.

## How we work (Izaz's rules)

- **Izaz types the code.** Claude explains each step and shows the code to type. Claude writes code only when Izaz explicitly asks for that step.
- **Many small commits**, each with an English message Claude suggests. Commit messages carry no Claude attribution.
- **Claude never commits or pushes.**

## Left to the builder

Exact easing and durations; the exact snippet text shown under each revealable (it must be plausible JSX or CSS for that element); the spacing scale; the exact slab angle within 8°–14°; the wording of placeholder copy marked `// IZAZ:`.
