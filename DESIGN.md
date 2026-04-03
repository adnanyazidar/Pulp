# Design System Strategy: Chromatic Flow & Temporal Depth

## 1. Overview & Creative North Star: "The Rhythmic Pulse"
The Creative North Star for this design system is **The Rhythmic Pulse**. Most productivity tools feel like rigid spreadsheets; this system aims to feel like a living, breathing organism that adapts to the user's mental state. We move away from the "static app" feel toward an editorial, immersive environment.

By utilizing **intentional asymmetry** and **dynamic tonal shifts**, we break the traditional grid. The layout shouldn't feel locked; it should feel positioned. We use extreme typographic scales—massive display numbers contrasted with tiny, precise labels—to create a sense of focused hierarchy. The goal is "Atmospheric Performance": a UI so quiet it disappears, leaving only the work and the time.

---

### 2. Colors & Atmospheric Shift
This system utilizes a dynamic tri-state logic. The interface doesn't just change a button color; it shifts its entire "atmospheric pressure" based on the current mode.

#### The State Logic
*   **Focus Mode (Primary):** Utilizes the `primary` (#ffb4aa) and `primary_container` (#ff5446) tokens. Warmth triggers alertness.
*   **Short Break (Secondary):** Transitions to `secondary` (#66d9cc) and `secondary_container` (#1ea296). Cool teals signal recovery.
*   **Long Break (Tertiary):** Shifts to `tertiary` (#a2c9ff) and `tertiary_container` (#3394f1). Deep blues signal deep rest.

#### The "No-Line" Rule
**Borders are strictly prohibited for structural sectioning.** Boundaries must be defined solely through background shifts. 
*   Place a `surface_container_high` card against a `surface` background. 
*   Use `surface_container_lowest` for inset areas like task lists to create a "carved out" look rather than a "boxed in" look.

#### The "Glass & Gradient" Rule
To elevate beyond flat material design, use **Glassmorphism** for the main timer controls. 
*   Apply a `surface_variant` at 60% opacity with a `backdrop-filter: blur(20px)`.
*   **Signature Texture:** Main CTA buttons should use a linear gradient from `primary` to `primary_container` at a 135-degree angle to provide a tactile, high-end "glow" that solid hex codes cannot replicate.

---

### 3. Typography: Editorial Precision
We pair **Manrope** (Display/Headlines) for its geometric modernism with **Inter** (Body/Labels) for its clinical readability.

*   **The Timer (Display-lg):** Set in Manrope, 3.5rem. Use a `font-variant-numeric: tabular-nums` to prevent the timer from "jumping" as seconds change.
*   **The Narrative (Headline-sm):** Used for task titles. It should feel like a book title, not a form entry.
*   **The Metadata (Label-sm):** Set in Inter, uppercase with 0.05em letter spacing. This provides a "technical" feel to the timestamps and session counts.

---

### 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "heavy" for a focus app. We use light to define space.

*   **The Layering Principle:** 
    *   **Level 0 (Base):** `surface` (#121416).
    *   **Level 1 (Sectioning):** `surface_container_low`. Use this for large layout blocks.
    *   **Level 2 (Interaction):** `surface_container_highest`. Use this for active tasks or hovered states.
*   **Ambient Shadows:** For floating elements (like a settings modal), use a shadow color derived from `on_surface` at 6% opacity with a 40px blur and 20px Y-offset. It should feel like a soft glow, not a dark smudge.
*   **The "Ghost Border":** If a separator is required for accessibility in task lists, use `outline_variant` at 15% opacity. Never use 100% opaque lines.

---

### 5. Components

#### The Chrono-Slider (Progress Bar)
*   **Track:** `surface_container_highest` with a height of 4px.
*   **Indicator:** A gradient of `primary` to `primary_fixed`. No rounded caps on the leading edge; use sharp 90-degree cuts for a "high-performance" look.

#### Action Buttons
*   **Primary (Start):** `primary_container` background with `on_primary_container` text. Large horizontal padding (2rem) and `xl` (0.75rem) corner radius.
*   **Secondary (Pause/Reset):** Glassmorphism style. `surface_variant` at 40% opacity, `backdrop-blur: 12px`.
*   **Interaction:** On hover, the button should not get darker; it should "brighten" using the `primary_fixed` token.

#### Task Cards
*   **Design:** Forbid divider lines. Separate tasks using 1.5rem of vertical whitespace.
*   **Active State:** Use a `surface_container_high` background.
*   **Inactive State:** Use `surface` (the card disappears into the background, leaving only the text visible).

#### The Pulse Chip
*   Used to show "Current Mode" (Focus/Break).
*   **Style:** Minimalist. `outline_variant` ghost border (20% opacity) with a 4px dot of the current mode's `primary` color. No background fill.

---

### 6. Do's and Don'ts

#### Do
*   **Do** use extreme white space. If you think there is enough space, add 20% more.
*   **Do** animate color transitions. When switching from Focus to Break, the background should transition over 1.2s to prevent jarring the user.
*   **Do** use `on_surface_variant` for secondary information to maintain a soft visual hierarchy.

#### Don't
*   **Don't** use pure black (#000000). Use the `surface` token (#121416) to keep the "ink" feel of the UI soft on the eyes.
*   **Don't** use standard "Success" greens for the break mode. Use the `secondary` (#66d9cc) teal to maintain the sophisticated, high-end palette.
*   **Don't** use "Pop-up" windows. Use sliding panels that emerge from the `surface_container` layers to maintain the feeling of a single, unified environment.