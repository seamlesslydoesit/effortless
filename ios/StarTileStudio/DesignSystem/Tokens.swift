import SwiftUI
import UIKit

/// Design tokens. Spacing follows Apple's 4-pt rhythm; colours are dynamic so every
/// token resolves separately for light and dark mode (and increased contrast).
enum DS {

    enum Space {
        static let xxs: CGFloat = 4
        static let xs: CGFloat = 8
        static let s: CGFloat = 12
        static let m: CGFloat = 16
        static let l: CGFloat = 20
        static let xl: CGFloat = 24
    }

    enum Radius {
        static let card: CGFloat = 10
        static let thumbnail: CGFloat = 8
        static let control: CGFloat = 10
    }

    enum Size {
        /// Apple's minimum comfortable tap target.
        static let hitTarget: CGFloat = 44
        static let thumb: CGFloat = 28
        static let track: CGFloat = 6
    }

    /// Semantic colours. Brand colours are built with a dynamic provider so they
    /// flip with the trait collection; system colours are used wherever one fits.
    enum Colour {
        /// Star Tile Studio cobalt, taken from the azulejo glaze. Lighter in dark mode so it stays legible.
        static let accent = dynamic(light: UIColor(hex: 0x1F45C6), dark: UIColor(hex: 0x7FA1EE),
                                    lightHighContrast: UIColor(hex: 0x14267A), darkHighContrast: UIColor(hex: 0xB3C8F2))
        static let canvasBackground = dynamic(light: UIColor(hex: 0xEDECEA), dark: UIColor(hex: 0x0B0B0D))
        static let seamGuide = accent
        /// Text and icons sitting on an accent fill.
        static let onAccent = dynamic(light: .white, dark: UIColor(hex: 0x0B1230))
        static let surface = Color(uiColor: .secondarySystemGroupedBackground)
        static let sheetBackground = Color(uiColor: .systemGroupedBackground)
        static let track = Color(uiColor: .tertiarySystemFill)
        static let separator = Color(uiColor: .separator)
        static let textPrimary = Color(uiColor: .label)
        static let textSecondary = Color(uiColor: .secondaryLabel)
        static let thumbFill = dynamic(light: .white, dark: UIColor(hex: 0xF2F2F7))

        static func dynamic(light: UIColor, dark: UIColor,
                            lightHighContrast: UIColor? = nil, darkHighContrast: UIColor? = nil) -> Color {
            Color(uiColor: UIColor { traits in
                let high = traits.accessibilityContrast == .high
                switch traits.userInterfaceStyle {
                case .dark: return high ? (darkHighContrast ?? dark) : dark
                default:    return high ? (lightHighContrast ?? light) : light
                }
            })
        }
    }
}

extension UIColor {
    convenience init(hex: UInt32, alpha: CGFloat = 1) {
        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255,
                  green: CGFloat((hex >> 8) & 0xFF) / 255,
                  blue: CGFloat(hex & 0xFF) / 255,
                  alpha: alpha)
    }
}
