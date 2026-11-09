import CoreGraphics
import Foundation

/// Which colour slot a shape fills.
enum ShapeClass: Hashable { case primary, secondary, tertiary }

struct TilePolygon {
    var points: [CGPoint]
    var shapeClass: ShapeClass

    var centroid: CGPoint {
        let n = CGFloat(points.count)
        let sum = points.reduce(CGPoint.zero) { CGPoint(x: $0.x + $1.x, y: $0.y + $1.y) }
        return CGPoint(x: sum.x / n, y: sum.y / n)
    }
}

/// The base polygon tilings. Every one repeats on a 1 × 1 square, which is what makes
/// the finished tile seamless.
enum TilingKind: String, CaseIterable, Identifiable, Codable {
    case octagon, doubleOctagon, squareTriangle, square, diamond, cairo, triangleFan, diagonalFan

    var id: String { rawValue }

    var title: String {
        switch self {
        case .octagon: return "Octagon"
        case .doubleOctagon: return "Double octagon"
        case .squareTriangle: return "Square & triangle"
        case .square: return "Square"
        case .diamond: return "Diamond"
        case .cairo: return "Cairo"
        case .triangleFan: return "Triangle fan"
        case .diagonalFan: return "Diagonal fan"
        }
    }

    /// Short metadata line for the asset card.
    var detail: String {
        switch self {
        case .octagon, .doubleOctagon: return "8-point"
        case .squareTriangle: return "4 + 3-point"
        case .square, .diamond: return "4-point"
        case .cairo: return "5-point"
        case .triangleFan, .diagonalFan: return "3-point"
        }
    }
}

enum PatternGeometry {

    // MARK: Tiling cells (unit square, computed once)

    private static let cells: [TilingKind: [TilePolygon]] = {
        var out: [TilingKind: [TilePolygon]] = [:]
        out[.octagon] = octagonCell()
        out[.doubleOctagon] = doubleOctagonCell()
        out[.squareTriangle] = snubCell()
        out[.square] = [TilePolygon(points: regular(CGPoint(x: 0.5, y: 0.5), half2, 4, .pi / 4), shapeClass: .primary)]
        out[.diamond] = [
            TilePolygon(points: regular(.zero, 0.5, 4, 0), shapeClass: .primary),
            TilePolygon(points: regular(CGPoint(x: 0.5, y: 0.5), 0.5, 4, 0), shapeClass: .secondary)
        ]
        out[.cairo] = cairoCell()
        out[.triangleFan] = dual(of: out[.octagon]!)
        out[.diagonalFan] = dual(of: out[.doubleOctagon]!)
        return out
    }()

    static func cell(_ kind: TilingKind) -> [TilePolygon] { cells[kind] ?? [] }

    private static let half2 = CGFloat(0.5).squareRoot()   // √½

    static func regular(_ c: CGPoint, _ r: CGFloat, _ n: Int, _ a0: CGFloat) -> [CGPoint] {
        (0..<n).map { k in
            let a = a0 + CGFloat(k) * 2 * .pi / CGFloat(n)
            return CGPoint(x: c.x + r * cos(a), y: c.y + r * sin(a))
        }
    }

    private static func octagonCell() -> [TilePolygon] {
        [
            TilePolygon(points: regular(CGPoint(x: 0.5, y: 0.5), 0.5 / cos(.pi / 8), 8, .pi / 8), shapeClass: .primary),
            TilePolygon(points: regular(.zero, 1 - half2, 4, 0), shapeClass: .secondary)
        ]
    }

    private static func doubleOctagonCell() -> [TilePolygon] {
        let r = (half2 / 2) / cos(.pi / 8)
        let s = 1 - half2
        let sq = s / CGFloat(2).squareRoot()
        return [
            TilePolygon(points: regular(.zero, r, 8, .pi / 8), shapeClass: .primary),
            TilePolygon(points: regular(CGPoint(x: 0.5, y: 0.5), r, 8, .pi / 8), shapeClass: .primary),
            TilePolygon(points: regular(CGPoint(x: 0.5, y: 0), sq, 4, .pi / 4), shapeClass: .secondary),
            TilePolygon(points: regular(CGPoint(x: 0, y: 0.5), sq, 4, .pi / 4), shapeClass: .secondary)
        ]
    }

    /// Snub square tiling (squares and triangles), scaled so it repeats every 1 unit.
    private static func snubCell() -> [TilePolygon] {
        let p = (2 + CGFloat(3).squareRoot()).squareRoot()
        func sqA(_ o: CGPoint) -> [CGPoint] { regular(o, half2, 4, .pi / 4 + .pi / 12) }
        func sqB(_ o: CGPoint) -> [CGPoint] { regular(CGPoint(x: o.x + p / 2, y: o.y + p / 2), half2, 4, .pi / 4 - .pi / 12) }

        var verts: [CGPoint] = []
        var seen = Set<String>()
        for i in -1...1 {
            for j in -1...1 {
                let o = CGPoint(x: CGFloat(i) * p, y: CGFloat(j) * p)
                for v in sqA(o) + sqB(o) {
                    if seen.insert(key(v)).inserted { verts.append(v) }
                }
            }
        }
        func near(_ a: CGPoint, _ b: CGPoint) -> Bool { abs(hypot(a.x - b.x, a.y - b.y) - 1) < 1e-6 }

        var out = [TilePolygon(points: sqA(.zero), shapeClass: .primary),
                   TilePolygon(points: sqB(.zero), shapeClass: .primary)]
        for a in 0..<verts.count {
            for b in (a + 1)..<verts.count where near(verts[a], verts[b]) {
                for c in (b + 1)..<verts.count where near(verts[a], verts[c]) && near(verts[b], verts[c]) {
                    let cx = (verts[a].x + verts[b].x + verts[c].x) / 3
                    let cy = (verts[a].y + verts[b].y + verts[c].y) / 3
                    if cx >= 0, cx < p, cy >= 0, cy < p {
                        out.append(TilePolygon(points: [verts[a], verts[b], verts[c]], shapeClass: .tertiary))
                    }
                }
            }
        }
        return out.map { poly in
            TilePolygon(points: poly.points.map { CGPoint(x: $0.x / p, y: $0.y / p) }, shapeClass: poly.shapeClass)
        }
    }

    /// Classic Cairo tiling: equal-sided pentagons, short edges lined up with the tile.
    private static func cairoCell() -> [TilePolygon] {
        let s = (CGFloat(8).squareRoot() - 1) / 14
        let base: [CGPoint] = [CGPoint(x: 0, y: 0), CGPoint(x: s, y: 0.5 - s), CGPoint(x: 0.5, y: 0.5),
                               CGPoint(x: 0.5 + s, y: s), CGPoint(x: 0.5 - s, y: -s)]
        let rotations: [[CGPoint]] = (0..<4).map { k in
            base.map { p in
                var x = p.x, y = p.y
                for _ in 0..<k { (x, y) = (-y, x) }
                return CGPoint(x: x, y: y)
            }
        }
        var out: [TilePolygon] = []
        for i in -3...3 {
            for j in -3...3 {
                for (k, pg) in rotations.enumerated() {
                    // Turn 45° and halve the area so the repeat is exactly one tile.
                    let pts = pg.map { p -> CGPoint in
                        let x = p.x + CGFloat(i), y = p.y + CGFloat(j)
                        return CGPoint(x: (x - y) / 2, y: (x + y) / 2)
                    }
                    let c = TilePolygon(points: pts, shapeClass: .primary).centroid
                    if c.x >= 0, c.x < 1, c.y >= 0, c.y < 1 {
                        out.append(TilePolygon(points: pts, shapeClass: k % 2 == 1 ? .primary : .secondary))
                    }
                }
            }
        }
        return out
    }

    /// The dual tiling: one new shape around every corner point of the old one.
    private static func dual(of base: [TilePolygon]) -> [TilePolygon] {
        var map: [String: (vertex: CGPoint, centres: [CGPoint])] = [:]
        var order: [String] = []
        for i in -2...2 {
            for j in -2...2 {
                for poly in base {
                    let pts = poly.points.map { CGPoint(x: $0.x + CGFloat(i), y: $0.y + CGFloat(j)) }
                    let c = TilePolygon(points: pts, shapeClass: .primary).centroid
                    for v in pts {
                        let k = key(v)
                        if map[k] == nil { map[k] = (v, []); order.append(k) }
                        map[k]!.centres.append(c)
                    }
                }
            }
        }
        let eps: CGFloat = 1e-7
        return order.compactMap { k in
            guard let entry = map[k] else { return nil }
            let v = entry.vertex
            guard v.x >= -eps, v.x < 1 - eps, v.y >= -eps, v.y < 1 - eps, entry.centres.count >= 3 else { return nil }
            let sorted = entry.centres.sorted { atan2($0.y - v.y, $0.x - v.x) < atan2($1.y - v.y, $1.x - v.x) }
            return TilePolygon(points: sorted, shapeClass: .primary)
        }
    }

    private static func key(_ p: CGPoint) -> String {
        "\(Int((p.x * 1e5).rounded())),\(Int((p.y * 1e5).rounded()))"
    }

    // MARK: Placing the tiling inside one tile

    /// All polygons that touch the unit tile, already placed and shifted.
    /// `shift` is the content shift as a fraction of the tile; the artwork wraps.
    static func polygons(for style: StarStyle, shift: CGPoint) -> [TilePolygon] {
        let r = CGFloat(max(1, style.repeatsPerTile))
        let corner: CGFloat = style.cornerCentred ? 0.5 : 0
        func wrap(_ v: CGFloat) -> CGFloat { v - floor(v) }
        let sx = corner + wrap(shift.x * r)
        let sy = corner + wrap(shift.y * r)
        let base = cell(style.tiling)
        let lo = -2, hi = Int(r) + 1
        var out: [TilePolygon] = []
        out.reserveCapacity(base.count * (hi - lo + 1) * (hi - lo + 1))
        for i in lo...hi {
            for j in lo...hi {
                for poly in base {
                    let pts = poly.points.map {
                        CGPoint(x: ($0.x + CGFloat(i) + sx) / r, y: ($0.y + CGFloat(j) + sy) / r)
                    }
                    var minX = CGFloat.infinity, maxX = -CGFloat.infinity, minY = CGFloat.infinity, maxY = -CGFloat.infinity
                    for p in pts { minX = min(minX, p.x); maxX = max(maxX, p.x); minY = min(minY, p.y); maxY = max(maxY, p.y) }
                    if maxX < -0.05 || minX > 1.05 || maxY < -0.05 || minY > 1.05 { continue }
                    out.append(TilePolygon(points: pts, shapeClass: poly.shapeClass))
                }
            }
        }
        return out
    }

    // MARK: Star construction (polygons-in-contact method)

    struct StarFigure {
        var outline: [CGPoint]
        /// Each strand is three points: edge → crossing → next edge.
        var strands: [[CGPoint]]
        var centre: CGPoint
        var shapeClass: ShapeClass
        var vertices: [CGPoint]
    }

    static func star(for poly: TilePolygon, contactAngle theta: CGFloat, gap delta: CGFloat) -> StarFigure {
        let pts = poly.points
        let n = pts.count
        let c = poly.centroid

        struct Edge { var u: CGPoint; var normal: CGPoint; var qMinus: CGPoint; var qPlus: CGPoint }
        var edges: [Edge] = []
        edges.reserveCapacity(n)
        for i in 0..<n {
            let a = pts[i], b = pts[(i + 1) % n]
            let len = hypot(b.x - a.x, b.y - a.y)
            let u = CGPoint(x: (b.x - a.x) / len, y: (b.y - a.y) / len)
            var nrm = CGPoint(x: -u.y, y: u.x)
            let m = CGPoint(x: (a.x + b.x) / 2, y: (a.y + b.y) / 2)
            if (c.x - m.x) * nrm.x + (c.y - m.y) * nrm.y < 0 { nrm = CGPoint(x: -nrm.x, y: -nrm.y) }
            let d = delta * len / 2
            edges.append(Edge(u: u, normal: nrm,
                              qMinus: CGPoint(x: m.x - d * u.x, y: m.y - d * u.y),
                              qPlus: CGPoint(x: m.x + d * u.x, y: m.y + d * u.y)))
        }

        let cs = cos(theta), sn = sin(theta)
        var outline: [CGPoint] = []
        var strands: [[CGPoint]] = []
        outline.reserveCapacity(n * 3)
        strands.reserveCapacity(n)
        for k in 0..<n {
            let e = edges[k], f = edges[(k + 1) % n]
            let da = CGPoint(x: cs * e.u.x + sn * e.normal.x, y: cs * e.u.y + sn * e.normal.y)
            let db = CGPoint(x: -cs * f.u.x + sn * f.normal.x, y: -cs * f.u.y + sn * f.normal.y)
            let x = intersect(e.qPlus, da, f.qMinus, db) ?? pts[(k + 1) % n]
            outline.append(contentsOf: [e.qMinus, e.qPlus, x])
            strands.append([e.qPlus, x, f.qMinus])
        }
        return StarFigure(outline: outline, strands: strands, centre: c, shapeClass: poly.shapeClass, vertices: pts)
    }

    private static func intersect(_ p: CGPoint, _ a: CGPoint, _ q: CGPoint, _ b: CGPoint) -> CGPoint? {
        let den = a.x * b.y - a.y * b.x
        guard abs(den) > 1e-10 else { return nil }
        let t = ((q.x - p.x) * b.y - (q.y - p.y) * b.x) / den
        return CGPoint(x: p.x + t * a.x, y: p.y + t * a.y)
    }
}
