import CoreGraphics
import UIKit

/// Draws one seamless tile into a bitmap. Pure function of its inputs, so it is easy
/// to cache and safe to call for thumbnails, the live canvas and exports alike.
enum TileRenderer {

    /// Colours after hue rotation, resolved once per render.
    private struct Ink {
        var ground, star, star2, star3, inner, band, outline, dot: CGColor

        init(palette: TilePalette, hue: Double, outlineOnly: Bool) {
            if outlineOnly {
                let white = UIColor.white.cgColor, black = UIColor.black.cgColor
                ground = white; star = white; star2 = white; star3 = white
                inner = white; band = white; outline = black; dot = white
            } else {
                ground = palette.ground.rotated(by: hue).cgColor
                star = palette.star.rotated(by: hue).cgColor
                star2 = palette.star2.rotated(by: hue).cgColor
                star3 = palette.star3.rotated(by: hue).cgColor
                inner = palette.inner.rotated(by: hue).cgColor
                band = palette.band.rotated(by: hue).cgColor
                outline = palette.outline.rotated(by: hue).cgColor
                dot = palette.dot.rotated(by: hue).cgColor
            }
        }

        func fill(for shapeClass: ShapeClass) -> CGColor {
            switch shapeClass {
            case .primary: return star
            case .secondary: return star2
            case .tertiary: return star3
            }
        }
    }

    static func image(style: StarStyle, palette: TilePalette, layout: TileLayout,
                      pixelSize: Int, outlineOnly: Bool = false) -> CGImage? {
        let side = CGFloat(max(8, pixelSize))
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        format.preferredRange = .standard
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: side, height: side), format: format)
        let uiImage = renderer.image { rc in
            draw(in: rc.cgContext, side: side, style: style, palette: palette, layout: layout, outlineOnly: outlineOnly)
        }
        return uiImage.cgImage
    }

    static func draw(in ctx: CGContext, side s: CGFloat, style: StarStyle, palette: TilePalette,
                     layout: TileLayout, outlineOnly: Bool) {
        let ink = Ink(palette: palette, hue: layout.hueRotation, outlineOnly: outlineOnly)
        let cellPx = s / CGFloat(max(1, style.repeatsPerTile))
        let theta = CGFloat(style.contactAngle) * .pi / 180

        ctx.saveGState()
        defer { ctx.restoreGState() }
        ctx.setFillColor(ink.ground)
        ctx.fill(CGRect(x: 0, y: 0, width: s, height: s))
        ctx.clip(to: CGRect(x: 0, y: 0, width: s, height: s))

        let polys = PatternGeometry.polygons(for: style, shift: layout.unitShift)
        let stars = polys.map { PatternGeometry.star(for: $0, contactAngle: theta, gap: CGFloat(style.gap)) }

        func closedPath(_ pts: [CGPoint]) -> CGPath {
            let path = CGMutablePath()
            path.addLines(between: pts.map { CGPoint(x: $0.x * s, y: $0.y * s) })
            path.closeSubpath()
            return path
        }
        let thin = max(outlineOnly ? 1.5 : 1, cellPx * (outlineOnly ? 0.009 : 0.006))

        // 1. Star fills.
        for st in stars {
            ctx.addPath(closedPath(st.outline))
            ctx.setFillColor(ink.fill(for: st.shapeClass))
            ctx.fillPath()
        }

        // 2. Small star inside each big star, with a centre dot.
        if style.innerStar {
            for st in stars where st.shapeClass == .primary && st.vertices.count >= 4 {
                let k: CGFloat = 0.52
                let inner = st.outline.map {
                    CGPoint(x: st.centre.x + ($0.x - st.centre.x) * k, y: st.centre.y + ($0.y - st.centre.y) * k)
                }
                let path = closedPath(inner)
                ctx.addPath(path); ctx.setFillColor(ink.inner); ctx.fillPath()
                ctx.addPath(path); ctx.setStrokeColor(ink.outline); ctx.setLineWidth(thin); ctx.setLineJoin(.miter); ctx.strokePath()
                let r = cellPx * 0.03
                ctx.setFillColor(ink.dot)
                ctx.fillEllipse(in: CGRect(x: st.centre.x * s - r, y: st.centre.y * s - r, width: r * 2, height: r * 2))
            }
        }

        // 3. In outline mode every shape edge is drawn so nothing is left open.
        if outlineOnly {
            ctx.setStrokeColor(ink.outline); ctx.setLineWidth(thin); ctx.setLineJoin(.miter)
            for st in stars { ctx.addPath(closedPath(st.outline)) }
            ctx.strokePath()
        }

        // 4. The woven lines: dark edge, light band, optional centre line.
        if style.lineWidth > 0 {
            let bw = CGFloat(style.lineWidth) * cellPx
            let ow = max(outlineOnly ? 1.5 : 1, cellPx * (outlineOnly ? 0.009 : 0.007))
            let strands = CGMutablePath()
            for st in stars {
                for sg in st.strands {
                    strands.move(to: CGPoint(x: sg[0].x * s, y: sg[0].y * s))
                    strands.addLine(to: CGPoint(x: sg[1].x * s, y: sg[1].y * s))
                    strands.addLine(to: CGPoint(x: sg[2].x * s, y: sg[2].y * s))
                }
            }
            ctx.setLineCap(.butt); ctx.setLineJoin(.miter); ctx.setMiterLimit(12)
            ctx.addPath(strands); ctx.setLineWidth(bw + ow * 2); ctx.setStrokeColor(ink.outline); ctx.strokePath()
            ctx.addPath(strands); ctx.setLineWidth(bw); ctx.setStrokeColor(ink.band); ctx.strokePath()
            if style.doubleLines && bw > ow * 2 {
                ctx.addPath(strands); ctx.setLineWidth(max(1, bw * 0.22)); ctx.setStrokeColor(ink.outline); ctx.strokePath()
            }
        } else if !outlineOnly {
            ctx.setStrokeColor(ink.outline); ctx.setLineWidth(thin)
            for st in stars { ctx.addPath(closedPath(st.outline)) }
            ctx.strokePath()
        }

        // 5. Dots where shapes meet.
        if style.dots {
            var seen = Set<String>()
            let r = cellPx * 0.035
            ctx.setLineWidth(thin)
            for st in stars {
                for v in st.vertices {
                    let key = "\(Int((v.x * 1e4).rounded())),\(Int((v.y * 1e4).rounded()))"
                    guard seen.insert(key).inserted else { continue }
                    let rect = CGRect(x: v.x * s - r, y: v.y * s - r, width: r * 2, height: r * 2)
                    ctx.setFillColor(ink.dot); ctx.fillEllipse(in: rect)
                    ctx.setStrokeColor(ink.outline); ctx.strokeEllipse(in: rect)
                }
            }
        }
    }
}
