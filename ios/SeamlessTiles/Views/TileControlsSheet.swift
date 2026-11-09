import SwiftUI

/// Pattern controls, shown in a native bottom sheet at .medium / .large.
struct TileControlsSheet: View {
    @Bindable var model: TileEditorViewModel

    private let denseGrid = [GridItem(.adaptive(minimum: 72), spacing: DS.Space.xs)]
    private let repeatGrid = Array(repeating: GridItem(.flexible(), spacing: DS.Space.xs), count: 4)

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.l) {
                    repeatSection
                    sizeSection
                    shiftSection
                    patternSection
                    starSection
                    colourSection
                }
                .padding(.horizontal, DS.Space.m)
                .padding(.bottom, DS.Space.xl)
            }
            .background(DS.Colour.sheetBackground)
            .navigationTitle("Tile settings")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    // MARK: Repeat

    private var repeatSection: some View {
        SheetSection("Repeat") {
            LazyVGrid(columns: repeatGrid, spacing: DS.Space.xs) {
                ForEach(RepeatType.allCases) { type in
                    let selected = model.layout.repeatType == type
                    Button {
                        model.layout.repeatType = type
                    } label: {
                        VStack(spacing: DS.Space.xxs) {
                            Image(systemName: type.systemImage)
                                .font(.title3)
                                .frame(height: 26)
                            Text(type.title)
                                .font(.caption.weight(.medium))
                                .lineLimit(1)
                                .minimumScaleFactor(0.8)
                        }
                        .frame(maxWidth: .infinity, minHeight: 60)
                        .foregroundStyle(selected ? DS.Colour.accent : DS.Colour.textPrimary)
                        .background(RoundedRectangle(cornerRadius: DS.Radius.card).fill(DS.Colour.surface))
                        .overlay(RoundedRectangle(cornerRadius: DS.Radius.card)
                            .strokeBorder(selected ? DS.Colour.accent : .clear, lineWidth: 2))
                    }
                    .buttonStyle(.plain)
                    .accessibilityAddTraits(selected ? .isSelected : [])
                }
            }
        }
    }

    // MARK: Size

    private var sizeSection: some View {
        SheetSection("Tile size") {
            VStack(spacing: DS.Space.s) {
                PrecisionSlider(title: "Size", systemImage: "aspectratio",
                                value: $model.layout.tileSize, range: TileLayout.sizeRange,
                                step: 1, snapPoints: TileLayout.sizeSnaps,
                                format: { "\(Int($0)) × \(Int($0)) px" })
                HStack(spacing: DS.Space.xs) {
                    ForEach([256.0, 512.0, 1024.0, 2048.0], id: \.self) { size in
                        let selected = model.layout.tileSize == size
                        Button("\(Int(size))") {
                            model.layout.tileSize = size
                            Haptics.shared.snap()
                        }
                        .font(.footnote.monospacedDigit().weight(.semibold))
                        .frame(maxWidth: .infinity, minHeight: 32)
                        .foregroundStyle(selected ? Color.white : DS.Colour.textPrimary)
                        .background(Capsule().fill(selected ? DS.Colour.accent : DS.Colour.track))
                        .buttonStyle(.plain)
                        .accessibilityLabel("\(Int(size)) pixels")
                    }
                }
            }
            .cardStyle()
        }
    }

    // MARK: Shift

    private var shiftSection: some View {
        SheetSection("Shift") {
            VStack(spacing: DS.Space.s) {
                PrecisionSlider(title: "Across", systemImage: "arrow.left.and.right",
                                value: $model.layout.shiftX, range: model.layout.shiftRange,
                                step: 1, snapPoints: model.layout.shiftSnaps,
                                format: { "\(Int($0)) px" })
                Divider()
                PrecisionSlider(title: "Down", systemImage: "arrow.up.and.down",
                                value: $model.layout.shiftY, range: model.layout.shiftRange,
                                step: 1, snapPoints: model.layout.shiftSnaps,
                                format: { "\(Int($0)) px" })
                Divider()
                PrecisionSlider(title: "Hue", systemImage: "paintpalette",
                                value: $model.layout.hueRotation, range: TileLayout.hueRange,
                                step: 1, snapPoints: [0],
                                format: { "\(Int($0))°" })
            }
            .cardStyle()
        }
    }

    // MARK: Pattern (dense asset grid)

    private var patternSection: some View {
        SheetSection("Pattern") {
            LazyVGrid(columns: denseGrid, spacing: DS.Space.xs) {
                ForEach(TilingKind.allCases) { kind in
                    PatternAssetCard(kind: kind, image: model.thumbnails[kind],
                                     isSelected: model.style.tiling == kind) {
                        model.style.tiling = kind
                    }
                }
            }
        }
    }

    // MARK: Star

    private var starSection: some View {
        SheetSection("Star") {
            VStack(spacing: DS.Space.s) {
                PrecisionSlider(title: "Star points", systemImage: "star",
                                value: $model.style.contactAngle, range: StarStyle.angleRange,
                                step: 0.5, snapPoints: [45, 60, 67.5],
                                format: { String(format: "%.1f°", $0) })
                Divider()
                PrecisionSlider(title: "Gap", systemImage: "circle.dashed",
                                value: percent($model.style.gap), range: 0...60,
                                step: 1, snapPoints: [0],
                                format: { "\(Int($0)) %" })
                Divider()
                PrecisionSlider(title: "Line width", systemImage: "lineweight",
                                value: tenths($model.style.lineWidth), range: 0...80,
                                step: 1, snapPoints: [0],
                                format: { String(format: "%.1f", $0 / 10) })
                Divider()
                PrecisionSlider(title: "Repeats per tile", systemImage: "square.grid.2x2",
                                value: repeats, range: 1...4, step: 1,
                                format: { "\(Int($0)) × \(Int($0))" })
                Divider()
                Toggle(isOn: $model.style.innerStar) { Label("Inner star", systemImage: "star.circle") }
                Toggle(isOn: $model.style.doubleLines) { Label("Double lines", systemImage: "equal") }
                Toggle(isOn: $model.style.dots) { Label("Dots where shapes meet", systemImage: "circle.grid.2x2") }
                Toggle(isOn: $model.style.cornerCentred) { Label("Star on tile corners", systemImage: "viewfinder") }
            }
            .tint(DS.Colour.accent)
            .font(.subheadline)
            .cardStyle()
        }
    }

    // MARK: Colours

    private var colourSection: some View {
        SheetSection("Colours") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: DS.Space.xs)], spacing: DS.Space.xs) {
                ForEach(TilePalette.all) { palette in
                    let selected = model.palette == palette
                    Button {
                        model.palette = palette
                    } label: {
                        HStack(spacing: DS.Space.xs) {
                            HStack(spacing: 0) {
                                ForEach(Array(palette.previewSwatches.enumerated()), id: \.offset) { _, swatch in
                                    Rectangle().fill(swatch.color).frame(width: 9, height: 22)
                                }
                            }
                            .clipShape(RoundedRectangle(cornerRadius: 4))
                            Text(palette.name)
                                .font(.footnote.weight(.medium))
                                .lineLimit(1)
                            Spacer(minLength: 0)
                        }
                        .padding(.horizontal, DS.Space.s)
                        .frame(minHeight: DS.Size.hitTarget)
                        .foregroundStyle(DS.Colour.textPrimary)
                        .background(RoundedRectangle(cornerRadius: DS.Radius.card).fill(DS.Colour.surface))
                        .overlay(RoundedRectangle(cornerRadius: DS.Radius.card)
                            .strokeBorder(selected ? DS.Colour.accent : .clear, lineWidth: 2))
                    }
                    .buttonStyle(.plain)
                    .accessibilityAddTraits(selected ? .isSelected : [])
                }
            }
        }
    }

    // MARK: Unit bindings (store fractions, show friendly numbers)

    private func percent(_ b: Binding<Double>) -> Binding<Double> {
        Binding(get: { (b.wrappedValue * 100).rounded() }, set: { b.wrappedValue = $0 / 100 })
    }

    private func tenths(_ b: Binding<Double>) -> Binding<Double> {
        Binding(get: { (b.wrappedValue * 1000).rounded() }, set: { b.wrappedValue = $0 / 1000 })
    }

    private var repeats: Binding<Double> {
        Binding(get: { Double(model.style.repeatsPerTile) }, set: { model.style.repeatsPerTile = Int($0.rounded()) })
    }
}

// MARK: - Building blocks

/// Dense asset card: thumbnail plus two lines of metadata.
private struct PatternAssetCard: View {
    let kind: TilingKind
    let image: CGImage?
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 3) {
                Group {
                    if let image {
                        Image(decorative: image, scale: 1).resizable().interpolation(.high)
                    } else {
                        DS.Colour.track
                    }
                }
                .aspectRatio(1, contentMode: .fit)
                .clipShape(RoundedRectangle(cornerRadius: DS.Radius.thumbnail))

                Text(kind.title)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(DS.Colour.textPrimary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                Text(kind.detail)
                    .font(.caption2)
                    .foregroundStyle(DS.Colour.textSecondary)
                    .lineLimit(1)
            }
            .padding(6)
            .background(RoundedRectangle(cornerRadius: DS.Radius.card).fill(DS.Colour.surface))
            .overlay(RoundedRectangle(cornerRadius: DS.Radius.card)
                .strokeBorder(isSelected ? DS.Colour.accent : .clear, lineWidth: 2))
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(kind.title), \(kind.detail)")
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }
}

private struct SheetSection<Content: View>: View {
    let title: String
    let content: Content

    init(_ title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            Text(title)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(DS.Colour.textSecondary)
                .textCase(.uppercase)
                .accessibilityAddTraits(.isHeader)
            content
        }
    }
}

private extension View {
    func cardStyle() -> some View {
        padding(DS.Space.s)
            .background(RoundedRectangle(cornerRadius: DS.Radius.card).fill(DS.Colour.surface))
    }
}
