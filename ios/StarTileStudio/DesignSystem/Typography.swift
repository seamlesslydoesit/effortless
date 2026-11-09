import CoreText
import SwiftUI

/// Brand type: Bricolage Grotesque for headings, Inter for everything else.
/// Every style is tied to an Apple text style, so it still grows and shrinks with
/// the reader's Dynamic Type setting.
enum BrandFont {

    /// The font files bundled in Resources/Fonts. Registered at launch, so no Info.plist entry is needed.
    static let files = [
        "BricolageGrotesque-ExtraBold", "BricolageGrotesque-SemiBold",
        "Inter-Regular", "Inter-Medium", "Inter-SemiBold", "Inter-Bold"
    ]

    static func registerAll() {
        for name in files {
            guard let url = Bundle.main.url(forResource: name, withExtension: "ttf") else { continue }
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }

    enum Weight: String {
        case regular = "Inter-Regular"
        case medium = "Inter-Medium"
        case semibold = "Inter-SemiBold"
        case bold = "Inter-Bold"
    }

    /// Bricolage Grotesque, for titles and section headings.
    static func display(_ size: CGFloat, relativeTo style: Font.TextStyle, semibold: Bool = false) -> Font {
        .custom(semibold ? "BricolageGrotesque-SemiBold" : "BricolageGrotesque-ExtraBold", size: size, relativeTo: style)
    }

    /// Inter, for labels, values and body text.
    static func text(_ size: CGFloat, _ weight: Weight = .regular, relativeTo style: Font.TextStyle) -> Font {
        .custom(weight.rawValue, size: size, relativeTo: style)
    }
}

extension DS {
    /// Named type styles. Sizes follow Apple's default text sizes.
    enum TypeStyle {
        static let screenTitle = BrandFont.display(17, relativeTo: .headline)
        static let sectionTitle = BrandFont.display(20, relativeTo: .title3)
        static let label = BrandFont.text(15, .medium, relativeTo: .subheadline)
        static let value = BrandFont.text(15, .semibold, relativeTo: .subheadline).monospacedDigit()
        static let body = BrandFont.text(15, .regular, relativeTo: .subheadline)
        static let chip = BrandFont.text(13, .semibold, relativeTo: .footnote).monospacedDigit()
        static let cardTitle = BrandFont.text(12, .medium, relativeTo: .caption)
        static let caption = BrandFont.text(11, .semibold, relativeTo: .caption2)
        static let captionLight = BrandFont.text(11, .regular, relativeTo: .caption2)
        static let status = BrandFont.text(12, .medium, relativeTo: .caption).monospacedDigit()
    }
}
