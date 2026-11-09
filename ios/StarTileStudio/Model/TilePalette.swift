import SwiftUI
import UIKit

struct RGB: Equatable, Hashable, Codable {
    var r: Double, g: Double, b: Double

    init(_ hex: UInt32) {
        r = Double((hex >> 16) & 0xFF) / 255
        g = Double((hex >> 8) & 0xFF) / 255
        b = Double(hex & 0xFF) / 255
    }

    /// The colour with its hue turned by `degrees` (saturation and brightness kept).
    func rotated(by degrees: Double) -> UIColor {
        let base = UIColor(red: r, green: g, blue: b, alpha: 1)
        guard degrees != 0 else { return base }
        var h: CGFloat = 0, s: CGFloat = 0, v: CGFloat = 0, a: CGFloat = 0
        base.getHue(&h, saturation: &s, brightness: &v, alpha: &a)
        var nh = h + CGFloat(degrees / 360)
        nh -= floor(nh)
        return UIColor(hue: nh, saturation: s, brightness: v, alpha: a)
    }

    var color: Color { Color(red: r, green: g, blue: b) }
}

/// Tile artwork colours. These are the tile's own glaze colours, so they stay fixed
/// in dark mode; only the app chrome around them is dynamic.
struct TilePalette: Identifiable, Equatable, Codable {
    var id: String { name }
    var name: String
    var ground: RGB, star: RGB, star2: RGB, star3: RGB
    var inner: RGB, band: RGB, outline: RGB, dot: RGB

    var previewSwatches: [RGB] { [star, star2, star3, ground] }

    static let lisbonBlue = TilePalette(name: "Lisbon blue",
        ground: RGB(0xF5F7FA), star: RGB(0x1F45C6), star2: RGB(0x6C93E6), star3: RGB(0xB3C8F2),
        inner: RGB(0xF5F7FA), band: RGB(0xFFFFFF), outline: RGB(0x14267A), dot: RGB(0x1F45C6))
    static let azulejo = TilePalette(name: "Azulejo",
        ground: RGB(0xFBFAF6), star: RGB(0x1F45C6), star2: RGB(0xF3BB26), star3: RGB(0x6C93E6),
        inner: RGB(0xF3BB26), band: RGB(0xFFFFFF), outline: RGB(0x14267A), dot: RGB(0xF3BB26))
    static let talavera = TilePalette(name: "Talavera",
        ground: RGB(0xF7F0DD), star: RGB(0x1D3F8F), star2: RGB(0xE2A626), star3: RGB(0x2F7D4A),
        inner: RGB(0xE2A626), band: RGB(0xF7F0DD), outline: RGB(0x1D3F8F), dot: RGB(0xC8522D))
    static let fezGreen = TilePalette(name: "Fez green",
        ground: RGB(0x1E6B52), star: RGB(0xF2EFE6), star2: RGB(0xC9963B), star3: RGB(0xC9963B),
        inner: RGB(0x1E6B52), band: RGB(0xF8F5ED), outline: RGB(0x1B1B1B), dot: RGB(0xB23A2E))
    static let seville = TilePalette(name: "Seville",
        ground: RGB(0xF3E5C4), star: RGB(0x2A5C9A), star2: RGB(0xD8861C), star3: RGB(0x3F8A5A),
        inner: RGB(0xF3E5C4), band: RGB(0xFCF4E0), outline: RGB(0x6B3A1F), dot: RGB(0xB8462A))
    static let pueblaPink = TilePalette(name: "Puebla pink",
        ground: RGB(0xFBF3EA), star: RGB(0xC2456B), star2: RGB(0x2C6E8F), star3: RGB(0xE7B33C),
        inner: RGB(0xFBF3EA), band: RGB(0xFBF3EA), outline: RGB(0x3B2A4A), dot: RGB(0x2C6E8F))
    static let midnightGold = TilePalette(name: "Midnight gold",
        ground: RGB(0x142046), star: RGB(0xD9A441), star2: RGB(0x3B6DB3), star3: RGB(0xE8E1CF),
        inner: RGB(0x142046), band: RGB(0xE8E1CF), outline: RGB(0x0A1130), dot: RGB(0xD9A441))

    static let all: [TilePalette] = [.lisbonBlue, .azulejo, .talavera, .fezGreen, .seville, .pueblaPink, .midnightGold]
}
