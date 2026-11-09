import CoreGraphics
import Foundation

/// How copies of the core tile are placed around it.
enum RepeatType: String, CaseIterable, Identifiable, Codable {
    case grid, brick, halfDrop, mirror

    var id: String { rawValue }

    var title: String {
        switch self {
        case .grid: return "Grid"
        case .brick: return "Brick"
        case .halfDrop: return "Half-drop"
        case .mirror: return "Mirror"
        }
    }

    var systemImage: String {
        switch self {
        case .grid: return "square.grid.3x3"
        case .brick: return "rectangle.split.3x1"
        case .halfDrop: return "rectangle.split.1x2"
        case .mirror: return "flip.horizontal"
        }
    }
}

/// Layout tokens: everything about size and placement, kept apart from the artwork.
struct TileLayout: Equatable, Codable {
    var repeatType: RepeatType = .grid
    /// Edge length of the square tile, in pixels.
    var tileSize: Double = 512
    /// Content shift inside the tile, in pixels. The artwork wraps, so the tile stays seamless.
    var shiftX: Double = 0
    var shiftY: Double = 0
    /// Hue rotation applied to every palette colour, in degrees.
    var hueRotation: Double = 0

    static let sizeRange: ClosedRange<Double> = 64...2048
    static let sizeSnaps: [Double] = [128, 256, 512, 1024, 2048]
    static let hueRange: ClosedRange<Double> = -180...180

    var shiftRange: ClosedRange<Double> { -tileSize / 2 ... tileSize / 2 }
    /// Alignment locks: centred, quarter and half tile.
    var shiftSnaps: [Double] { [-tileSize / 2, -tileSize / 4, 0, tileSize / 4, tileSize / 2] }

    /// Shift as a fraction of the tile (what the renderer needs).
    var unitShift: CGPoint { CGPoint(x: shiftX / tileSize, y: shiftY / tileSize) }
}
