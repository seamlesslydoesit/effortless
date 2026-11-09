import CoreGraphics
import Observation
import SwiftUI

/// Owns the tile being edited and the viewport. Views read from it and write intents
/// back; they never compute layout themselves.
@MainActor
@Observable
final class TileEditorViewModel {

    // MARK: Editing state

    /// Layout tokens (size, offsets, repeat type, hue). Isolated from the artwork.
    var layout = TileLayout() {
        didSet { layoutDidChange(from: oldValue) }
    }

    var style = StarStyle() {
        didSet { styleDidChange(from: oldValue) }
    }

    var palette: TilePalette = .lisbonBlue {
        didSet {
            guard palette != oldValue else { return }
            Haptics.shared.toggle()
            renderTile()
            renderThumbnails()
        }
    }

    // MARK: Presentation state

    var showSeamGuide = true {
        didSet { if showSeamGuide != oldValue { Haptics.shared.toggle() } }
    }
    var isControlsPresented = true

    /// The core tile as a bitmap. The canvas stamps this one image for every repeat,
    /// so editing the core tile updates every neighbour on the next frame.
    private(set) var tileImage: CGImage?
    private(set) var thumbnails: [TilingKind: CGImage] = [:]

    // MARK: Viewport

    /// 1.0 means one image pixel per screen pixel.
    private(set) var zoom: CGFloat = 1
    /// Offset of the core tile's centre from the canvas centre, in points.
    private(set) var pan: CGSize = .zero

    static let zoomRange: ClosedRange<CGFloat> = 0.1...8
    /// Largest bitmap used for the live canvas. Exports render at full size separately.
    static let previewPixelLimit = 1024
    static let thumbnailPixels = 120

    init() {
        renderTile()
        renderThumbnails()
    }

    // MARK: Viewport intents

    func clampedZoom(_ z: CGFloat) -> CGFloat {
        min(max(z, Self.zoomRange.lowerBound), Self.zoomRange.upperBound)
    }

    /// Called when a pinch ends. Snaps to 100 % when close, with a haptic lock.
    func commitZoom(to proposed: CGFloat) {
        var z = clampedZoom(proposed)
        if abs(z - 1) < 0.06 && zoom != 1 {
            z = 1
            Haptics.shared.snap()
        }
        let ratio = z / zoom
        pan = CGSize(width: pan.width * ratio, height: pan.height * ratio)
        zoom = z
    }

    func commitPan(by translation: CGSize) {
        pan = CGSize(width: pan.width + translation.width, height: pan.height + translation.height)
    }

    /// Centre the core tile at 100 %.
    func resetViewport() {
        withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
            zoom = 1
            pan = .zero
        }
        Haptics.shared.lock()
    }

    // MARK: Rendering

    private func layoutDidChange(from old: TileLayout) {
        guard layout != old else { return }
        if layout.repeatType != old.repeatType { Haptics.shared.toggle() }
        // Keep offsets inside the new tile when the size shrinks.
        if layout.tileSize != old.tileSize {
            let half = layout.tileSize / 2
            layout.shiftX = min(max(layout.shiftX, -half), half)
            layout.shiftY = min(max(layout.shiftY, -half), half)
        }
        let artworkChanged = layout.tileSize != old.tileSize || layout.shiftX != old.shiftX
            || layout.shiftY != old.shiftY || layout.hueRotation != old.hueRotation
        if artworkChanged { renderTile() }
        if layout.hueRotation != old.hueRotation { renderThumbnails() }
    }

    private func styleDidChange(from old: StarStyle) {
        guard style != old else { return }
        let switches = [style.innerStar != old.innerStar, style.dots != old.dots,
                        style.cornerCentred != old.cornerCentred, style.doubleLines != old.doubleLines,
                        style.tiling != old.tiling]
        if switches.contains(true) { Haptics.shared.toggle() }
        renderTile()
        if style.thumbnailKey != old.thumbnailKey { renderThumbnails() }
    }

    private func renderTile() {
        let px = min(Int(layout.tileSize.rounded()), Self.previewPixelLimit)
        tileImage = TileRenderer.image(style: style, palette: palette, layout: layout, pixelSize: px)
    }

    private func renderThumbnails() {
        var thumbLayout = layout
        thumbLayout.shiftX = 0
        thumbLayout.shiftY = 0
        var out: [TilingKind: CGImage] = [:]
        for kind in TilingKind.allCases {
            var s = style
            s.tiling = kind
            s.repeatsPerTile = 1
            out[kind] = TileRenderer.image(style: s, palette: palette, layout: thumbLayout, pixelSize: Self.thumbnailPixels)
        }
        thumbnails = out
    }
}
