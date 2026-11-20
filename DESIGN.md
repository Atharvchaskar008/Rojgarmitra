---
name: "RojgarMitra Design System"
description: "SETTLE-inspired powder-blue, midnight navy, and tactile neo-brutalist employment interface for rural and semi-urban India."
colors:
  canvas: "#F1F5FC"
  surface: "#FFFFFF"
  surface-subtle: "#E8F0FA"
  ink: "#101638"
  ink-secondary: "#526F9D"
  ink-muted: "#7E96BA"
  primary: "#214783"
  primary-hover: "#173463"
  primary-active: "#0F2344"
  border: "#101638"
  border-subtle: "#B8C9E1"
  shadow-solid: "#101638"
  success: "#15803D"
  success-bg: "#DCFCE7"
  warning: "#C2410C"
  warning-bg: "#FFEDD5"
  chip-bg: "#DCE7F6"
  chip-text: "#1A3660"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "18px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card-feature:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  chip-filter:
    backgroundColor: "{colors.chip-bg}"
    textColor: "{colors.chip-text}"
    rounded: "{rounded.pill}"
    padding: "8px 18px"
---

# RojgarMitra Design Specification

## 1. Overview

RojgarMitra (रोजगारमित्र) merges the aesthetic clarity of **SETTLE** (crisp powder-blue canvas, deep midnight navy typography, floating white cards, and selective solid offset shadows) with the high-speed functional utility of **WorkIndia**, **Apna**, and **Google Pay**.

The visual philosophy is **"Soft Neo-Brutalist Craft"**: tactile, confident, calm, and unmistakably premium. It treats vocational and blue-collar jobseekers in rural and semi-urban Maharashtra with absolute dignity, replacing noisy, scam-ridden aggregator layouts with an interface as clean and polished as a high-end consumer financial app.

---

## 2. Colors

The color palette is deliberately restrained, eliminating unnecessary gradients, neon accents, and political cliches:

- **Canvas (`#F1F5FC`):** An airy, pale powder-blue that feels open and calm, reducing visual fatigue under harsh mobile lighting.
- **Surface (`#FFFFFF`):** Pure white floating islands that provide maximum contrast for critical job data.
- **Ink (`#101638`):** Deep midnight navy for primary text, major headers, and structural card borders. Delivers a commanding 14.2:1 contrast ratio against the canvas.
- **Secondary Ink (`#526F9D`):** Balanced slate blue for supporting metadata (locations, shifts, timestamps). Maintains WCAG AA compliance (5.2:1).
- **Primary Action Blue (`#214783`):** Authoritative royal industrial blue for primary interactive buttons and key progress indicators.
- **Border Navy (`#101638`):** Crisp 1.5px to 2px solid outlines defining floating cards and hero inputs.
- **Shadow Solid (`#101638`):** Hard zero-blur offset shadow for tactile elevation on high-intent elements.
- **Verification Green (`#15803D` / bg `#DCFCE7`):** Unmistakable verification badge color for confirmed plant vacancies.
- **Alert Amber (`#C2410C` / bg `#FFEDD5`):** Transparent badge color for unverified web search leads.

---

## 3. Typography

RojgarMitra is natively trilingual (मराठी, हिंदी, English). The typographic hierarchy must handle both Latin and Devnagari scripts with equal elegance:

- **Display & Headlines:** Bold, high-contrast headings with tight negative tracking (`-0.03em`) for English and generous vertical line-height (`1.3` to `1.4`) for Devnagari matras.
- **Body & Metadata:** Minimum 16px body copy on mobile to prevent automatic iOS/Android input zooming. Line height set to `1.6` (`leading-relaxed`) ensuring Marathi vowels and conjuncts do not collide.
- **Labels & Micro-copy:** Uppercase tracking on short English system tags (`WORKSPACES`, `PILOT REGION`, `STATUS`), rendered in clear Devnagari bold when localized (`हिंगणा एमआयडीसी`, `अधिकृत पडताळणी`).

---

## 4. Layout

- **Mobile-First Responsive Grid:**
  - Viewport 360px–390px (Mobile): Single-column fluid stack with 16px lateral padding. Persistent bottom action bar for thumb-zone navigation (`Jobs`, `Voice Mitra`, `Career`, `Profile`).
  - Viewport 768px (Tablet): 2-column balanced grid with sticky filter sidebar.
  - Viewport 1280px+ (Desktop): Max-width `1200px` centered layout with spacious margins, preserving the airy SETTLE atmosphere.
- **Vertical Rhythm:** Strict 8px baseline grid (`8px`, `16px`, `24px`, `32px`, `48px`). Content sections are separated by generous whitespace rather than arbitrary horizontal dividers.

---

## 5. Elevation & Depth

RojgarMitra borrows SETTLE's signature solid offset drop shadows:

- **Hero Input & Primary Cards:**
  - `border: 2px solid #101638`
  - `box-shadow: 4px 4px 0px #101638`
- **Pill Buttons & Signature CTAs:**
  - `border: 1.5px solid #101638`
  - `box-shadow: 3px 3px 0px #101638`
  - On active/pressed: `transform: translate(2px, 2px); box-shadow: 1px 1px 0px #101638;` (tactile physical depression).
- **Secondary Cards & Passive Items:**
  - `border: 1.5px solid #B8C9E1` (subtle steel blue outline).
  - `box-shadow: none` or subtle `0 2px 8px rgba(16, 22, 56, 0.04)`.
  - *Rule:* Never apply hard offset shadows to every passive card; reserve them for high-intent interactive components.

---

## 6. Shapes

- **Floating Cards:** Generously rounded corners (`rounded-2xl` / 18px radius) with solid borders.
- **Interactive Actions:** Full pill shapes (`rounded-full`) for all buttons, search prompts, and filter chips.
- **Mitra Companion:** A distinct rounded geometric speech-bubble icon with expressive micro-motion indicating active voice listening.

---

## 7. Components

### A. The SETTLE Search / Voice Hero Bar
- Floating white pill with a 2px navy border and 4px solid offset shadow.
- Left: Speech/Search prompt placeholder ("कोणती नोकरी शोधत आहात?..." / "MIG Welder in Butibori...").
- Right: Mitra voice microphone trigger pill with pulsating soundwave visualizer.

### B. The 3-Second Scannable Job Card
- Header: Bold Trade Title (e.g. `MIG Welder & Fabricator`) + Verification Badge (`✓ Verified Direct Vacancy` or `ℹ Public Search Lead`).
- Subtitle: Verified Employer Name (`BraMHanee Industries`) + Industrial Cluster (`Butibori MIDC, Nagpur · 8 km`).
- Financial Highlight: Big bold salary callout (`₹16,000 - ₹22,000 / month`).
- Skill Match Pills: Green chips for matched skills (`Arc Welding`, `Gas Cutting`), amber chip for missing skill (`TIG Welding`).
- Actions: Primary pill `Call HR Directly` (or `Apply in 1 Click`) + secondary pill `View Plant Details`.

### C. The Mitra Voice Onboarding Sheet
- Step-by-step conversational sheet: Mitra asks one clear question in Marathi or Hindi.
- Real-time audio waveform visualizer.
- Live transcribed text displayed with clear editable fields.
- Zero fake transcripts: honest error handling if speech is not detected.

### D. The Upskilling / Skill-Bridge Card
- When a candidate lacks required skills for a dream job, this card maps missing skills directly to official Government ITI courses.
- Displays: Course Name (`CTS Welder Structural`), Institute Name (`Government ITI Butibori`), Duration (`6 Months`), and direct link to `https://admission.dvet.gov.in`.

---

## 8. Do's and Don'ts

### Do's:
- **Do** maintain generous whitespace and calm powder-blue background throughout.
- **Do** use authentic Marathi and Hindi vocational terms recognized on Maharashtra industrial shop floors.
- **Do** use solid offset shadows selectively on hero cards and primary CTAs for tactile satisfaction.
- **Do** provide transparent evidence and source URLs for all job listings.
- **Do** test every screen at 360px mobile width to guarantee thumb reachability.

### Don'ts:
- **Don't** use tricolor or saffron/green national palettes.
- **Don't** use purple/pink "AI sparkle" gradients.
- **Don't** put hard offset shadows on every single element.
- **Don't** use kicker/eyebrow headings above section titles—let headings speak for themselves.
- **Don't** use low-contrast gray text on colored backgrounds.
- **Don't** invent fake jobs, candidate transcripts, or salaries.
