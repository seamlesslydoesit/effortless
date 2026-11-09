# Seamless Tiles (iPhone app)

An iPhone and iPad app for designing seamless pattern tiles with Arabic star patterns.

## Open it in Xcode

You need a Mac with Xcode 15 or newer.

**Easiest way (no extra tools):**
1. In Xcode choose **File → New → Project → iOS → App**.
2. Name it `SeamlessTiles`, set Interface to **SwiftUI**, and save it somewhere.
3. In the new project, delete the `ContentView.swift` and `SeamlessTilesApp.swift` files Xcode made.
4. Drag the `SeamlessTiles` folder from here into the project. Tick **Copy items if needed**.
5. Set **Minimum Deployments** to iOS 17.0 (click the project, then the app target, then General).
6. If Xcode shows many errors about "actor" or "Sendable", go to Build Settings, search for
   **Swift Language Version**, and set it to **Swift 5**.
7. Press the ▶ Run button.

**With XcodeGen:** `brew install xcodegen`, then run `xcodegen` inside this `ios` folder and open `SeamlessTiles.xcodeproj`.

## What's in it so far

- **Endless canvas.** Pinch to zoom, drag to move, double-tap to go back to 100 %. The main tile has a pink dashed outline, and every copy around it changes as soon as you edit it.
- **Settings sheet.** Slides up from the bottom (half or full height) and lets you change:
  - the repeat type: grid, brick, half-drop or mirror
  - the tile size in pixels
  - the shift across and down
  - the hue (colour turn)
  - the pattern, the star shape and the colours
- **Precise sliders.** Each slider has − and + buttons for exact steps. The thumb snaps and locks onto key values (such as 512 px, a half-tile shift or 0°) with a small vibration.
- **Vibration feedback** on snapping, alignment locks, switches and repeat changes.

## Code layout

| Folder | What it holds |
| --- | --- |
| `DesignSystem` | Spacing, corner and colour tokens (light, dark and high-contrast), haptics |
| `Model` | Layout tokens (`TileLayout`), artwork settings (`StarStyle`), palettes, pattern geometry |
| `Rendering` | `TileRenderer`: draws one tile into a bitmap |
| `ViewModel` | `TileEditorViewModel`: the single source of truth for the editor |
| `Components` | `PrecisionSlider` |
| `Views` | The canvas, the settings sheet and the editor screen |
