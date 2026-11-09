import SwiftUI

/// An endless, zoomable wall of tiles. Only the copies that are on screen are drawn,
/// and every copy is the same cached bitmap, so pinch and pan stay at full frame rate.
struct InfiniteTileCanvas: View {
    @Bindable var model: TileEditorViewModel
    @Environment(\.displayScale) private var displayScale

    @GestureState private var pinch: CGFloat = 1
    @GestureState private var drag: CGSize = .zero

    /// Zoom and pan including any gesture still in progress.
    private var liveZoom: CGFloat { model.clampedZoom(model.zoom * pinch) }
    private var livePan: CGSize {
        let ratio = liveZoom / model.zoom
        return CGSize(width: model.pan.width * ratio + drag.width,
                      height: model.pan.height * ratio + drag.height)
    }

    /// Everything the renderer needs, read during `body` so SwiftUI tracks it and
    /// redraws the wall the moment the core tile or viewport changes.
    private struct WallSnapshot {
        var image: CGImage?
        var tileSize: CGFloat
        var zoom: CGFloat
        var pan: CGSize
        var repeatType: RepeatType
        var showSeamGuide: Bool
    }

    var body: some View {
        let snapshot = WallSnapshot(image: model.tileImage,
                                    tileSize: CGFloat(model.layout.tileSize),
                                    zoom: liveZoom,
                                    pan: livePan,
                                    repeatType: model.layout.repeatType,
                                    showSeamGuide: model.showSeamGuide)
        let scale = displayScale
        return Canvas(opaque: true, colorMode: .nonLinear, rendersAsynchronously: false) { ctx, size in
            Self.drawWall(snapshot, displayScale: scale, in: &ctx, size: size)
        }
        .background(DS.Colour.canvasBackground)
        .contentShape(Rectangle())
        .gesture(SimultaneousGesture(magnify, pan))
        .onTapGesture(count: 2) { model.resetViewport() }
        .accessibilityElement()
        .accessibilityLabel("Tile canvas")
        .accessibilityValue("\(Int(model.layout.tileSize)) pixel tile, \(model.layout.repeatType.title) repeat, zoom \(Int(model.zoom * 100)) percent")
        .accessibilityHint("Pinch to zoom, drag to move, double-tap to reset.")
    }

    // MARK: Gestures

    private var magnify: some Gesture {
        MagnifyGesture()
            .updating($pinch) { value, state, _ in state = value.magnification }
            .onEnded { value in model.commitZoom(to: model.zoom * value.magnification) }
    }

    private var pan: some Gesture {
        DragGesture(minimumDistance: 1)
            .updating($drag) { value, state, _ in state = value.translation }
            .onEnded { value in model.commitPan(by: value.translation) }
    }

    // MARK: Drawing

    private static func drawWall(_ snap: WallSnapshot, displayScale: CGFloat,
                                 in ctx: inout GraphicsContext, size: CGSize) {
        guard let cgImage = snap.image else { return }

        // On-screen size of one tile: true pixels at 100 % zoom.
        let tile = snap.tileSize / displayScale * snap.zoom
        guard tile >= 4 else { return }

        let originX = size.width / 2 + snap.pan.width - tile / 2
        let originY = size.height / 2 + snap.pan.height - tile / 2

        let image = Image(decorative: cgImage, scale: 1)
            .interpolation(snap.zoom > 2 ? .none : .high)
            .antialiased(false)
        let resolved = ctx.resolve(image)
        let repeatType = snap.repeatType

        // Snap tile edges to whole device pixels so neighbours never show hairline gaps.
        func px(_ v: CGFloat) -> CGFloat { (v * displayScale).rounded() / displayScale }
        func isOdd(_ n: Int) -> Bool { n & 1 == 1 }

        let rowFirst = Int(floor((0 - originY) / tile)) - 1
        let rowLast = Int(ceil((size.height - originY) / tile)) + 1
        let colFirst = Int(floor((0 - originX) / tile)) - 1
        let colLast = Int(ceil((size.width - originX) / tile)) + 1

        for row in rowFirst...rowLast {
            for col in colFirst...colLast {
                var x = originX + CGFloat(col) * tile
                var y = originY + CGFloat(row) * tile
                switch repeatType {
                case .brick: if isOdd(row) { x += tile / 2 }
                case .halfDrop: if isOdd(col) { y += tile / 2 }
                case .grid, .mirror: break
                }
                let rect = CGRect(x: px(x), y: px(y), width: px(x + tile) - px(x), height: px(y + tile) - px(y))
                guard rect.maxX >= 0, rect.minX <= size.width, rect.maxY >= 0, rect.minY <= size.height else { continue }

                if repeatType == .mirror && (isOdd(col) || isOdd(row)) {
                    var flipped = ctx
                    flipped.translateBy(x: rect.midX, y: rect.midY)
                    flipped.scaleBy(x: isOdd(col) ? -1 : 1, y: isOdd(row) ? -1 : 1)
                    flipped.draw(resolved, in: CGRect(x: -rect.width / 2, y: -rect.height / 2,
                                                      width: rect.width, height: rect.height))
                } else {
                    ctx.draw(resolved, in: rect)
                }
            }
        }

        // Outline the core tile so it is clear which tile is being edited.
        if snap.showSeamGuide {
            let core = CGRect(x: px(originX), y: px(originY), width: px(originX + tile) - px(originX),
                              height: px(originY + tile) - px(originY))
            let outline = Path(core.insetBy(dx: 0.75, dy: 0.75))
            ctx.stroke(outline, with: .color(.black.opacity(0.35)), style: StrokeStyle(lineWidth: 3))
            ctx.stroke(outline, with: .color(DS.Colour.seamGuide), style: StrokeStyle(lineWidth: 1.5, dash: [6, 4]))
        }
    }
}
