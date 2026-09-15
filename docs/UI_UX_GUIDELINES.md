# Ultron UI/UX Guidelines

## Aesthetic Theme: Hacker Matrix
- **Color Palette:** Pure black backgrounds with glowing green text (`lime` or `#00FF00`).
- **Font/Typography:** Monospace terminal fonts to match the terminal emulator.

## Layout Components
- **System Vitals Panel:** Must have a solid green border. Should display system metrics like CPU and RAM usage.
- **Network Topology Panel:** Must have a solid green border. Dedicated to network status and diagnostics.
- **Command Line Input:** Positioned cleanly at the bottom. Dark background with green text, styled with a solid green border.
- **Main Log/Console:** Takes up the majority of the screen space (left pane). Outputs agent reasoning and responses in green.

## CSS Architecture
- **Strict Separation:** All Textual CSS styling must be strictly isolated from Python logic.
- **External Files:** Use `.tcss` files for styles and link them to components via the `CSS_PATH` class attribute in Textual Apps or Widgets.
