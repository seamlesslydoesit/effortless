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
        static let card: CGFloat = 12
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
        // Brand palette: warm off-white ground, near-black ink, pink accent.

        /// Pink fill for selected states, slider tracks and outlines.
        static let accent = dynamic(light: UIColor(hex: 0xFF58AE), dark: UIColor(hex: 0xFF58AE),
                                    lightHighContrast: UIColor(hex: 0xD62A86), darkHighContrast: UIColor(hex: 0xFF8CC8))
        /// Pink for small text and icons, deep enough to read on white.
        static let accentText = dynamic(light: UIColor(hex: 0xC4006B), dark: UIColor(hex: 0xFF7DC0),
                                        lightHighContrast: UIColor(hex: 0x9A0054), darkHighContrast: UIColor(hex: 0xFFA8D6))
        /// Text and icons sitting on a pink fill.
        static let onAccent = dynamic(light: UIColor(hex: 0x121212), dark: UIColor(hex: 0x121212))
        static let seamGuide = accent

        static let background = dynamic(light: UIColor(hex: 0xFBFAF9), dark: UIColor(hex: 0x121212))
        static let canvasBackground = dynamic(light: UIColor(hex: 0xEFEDEA), dark: UIColor(hex: 0x0B0B0D))
        static let surface = dynamic(light: .white, dark: UIColor(hex: 0x1D1D20))
        static let sheetBackground = background
        static let track = dynamic(light: UIColor(hex: 0xF1F1F4), dark: UIColor(hex: 0x2A2A2F),
                                   lightHighContrast: UIColor(hex: 0xDCDCE2), darkHighContrast: UIColor(hex: 0x3A3A41))
        static let separator = dynamic(light: UIColor(hex: 0xDCDCE2), dark: UIColor(hex: 0x34343A))
        static let textPrimary = dynamic(light: UIColor(hex: 0x121212), dark: UIColor(hex: 0xF6F4EF),
                                         lightHighContrast: .black, darkHighContrast: .white)
        static let textSecondary = dynamic(light: UIColor(hex: 0x5C5C63), dark: UIColor(hex: 0xA9A9B2),
                                           lightHighContrast: UIColor(hex: 0x3A3A40), darkHighContrast: UIColor(hex: 0xD0D0D8))
        static let thumbFill = dynamic(light: .white, dark: UIColor(hex: 0xF6F4EF))
        static let cardShadow = dynamic(light: UIColor(white: 0, alpha: 0.08), dark: UIColor(white: 0, alpha: 0.4))

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
