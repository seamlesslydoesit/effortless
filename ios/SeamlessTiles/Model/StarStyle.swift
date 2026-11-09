import Foundation

/// The artwork settings for an Arabic star tile (separate from layout tokens).
struct StarStyle: Equatable, Codable {
    var tiling: TilingKind = .octagon
    /// Angle the star lines leave each edge at, in degrees. Bigger means deeper points.
    var contactAngle: Double = 67.5
    /// Gap between neighbouring stars, as a fraction of each edge (0 = stars touch).
    var gap: Double = 0
    /// Width of the woven lines, as a fraction of one pattern repeat.
    var lineWidth: Double = 0.022
    /// How many pattern repeats fit across one tile.
    var repeatsPerTile: Int = 1
    var innerStar = true
    var dots = false
    var cornerCentred = false
    var doubleLines = false

    static let angleRange: ClosedRange<Double> = 20...80
    static let gapRange: ClosedRange<Double> = 0...0.6
    static let lineWidthRange: ClosedRange<Double> = 0...0.08
    static let repeatsRange: ClosedRange<Int> = 1...4

    /// The settings that change every pattern thumbnail (everything except which tiling is picked).
    var thumbnailKey: StarStyle {
        var copy = self
        copy.tiling = .octagon
        copy.repeatsPerTile = 1
        return copy
    }
}
