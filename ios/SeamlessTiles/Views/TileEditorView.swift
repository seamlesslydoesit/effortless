import SwiftUI

/// The main editing screen: the endless canvas, a small status read-out and a
/// toolbar. Pattern controls live in the bottom sheet so the canvas stays in view.
struct TileEditorView: View {
    @State private var model = TileEditorViewModel()

    var body: some View {
        NavigationStack {
            InfiniteTileCanvas(model: model)
                .ignoresSafeArea(edges: .bottom)
                .overlay(alignment: .topLeading) { statusReadout.padding(DS.Space.s) }
                .navigationTitle("Seamless Tiles")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar { toolbarContent }
                .sheet(isPresented: $model.isControlsPresented) {
                    TileControlsSheet(model: model)
                        .presentationDetents([.medium, .large])
                        .presentationDragIndicator(.visible)
                        .presentationBackgroundInteraction(.enabled(upThrough: .medium))
                        .presentationContentInteraction(.scrolls)
                }
        }
        .tint(DS.Colour.accent)
    }

    // MARK: Status read-out (size, zoom, repeat)

    private var statusReadout: some View {
        HStack(spacing: DS.Space.xs) {
            Label("\(Int(model.layout.tileSize)) px", systemImage: "aspectratio")
            Divider().frame(height: 14)
            Label("\(Int((model.zoom * 100).rounded())) %", systemImage: "plus.magnifyingglass")
            Divider().frame(height: 14)
            Label(model.layout.repeatType.title, systemImage: model.layout.repeatType.systemImage)
        }
        .labelStyle(.titleAndIcon)
        .font(.caption.monospacedDigit().weight(.medium))
        .foregroundStyle(DS.Colour.textPrimary)
        .padding(.horizontal, DS.Space.s)
        .padding(.vertical, DS.Space.xs)
        .background(.regularMaterial, in: Capsule())
        .accessibilityElement(children: .combine)
    }

    // MARK: Toolbar

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItemGroup(placement: .topBarTrailing) {
            Button {
                model.showSeamGuide.toggle()
            } label: {
                Image(systemName: model.showSeamGuide ? "square.dashed.inset.filled" : "square.dashed")
            }
            .accessibilityLabel(model.showSeamGuide ? "Hide core tile outline" : "Show core tile outline")

            Button {
                model.resetViewport()
            } label: {
                Image(systemName: "scope")
            }
            .accessibilityLabel("Centre at 100 percent")

            Button {
                model.isControlsPresented = true
            } label: {
                Image(systemName: "slider.horizontal.3")
            }
            .accessibilityLabel("Tile settings")
        }
    }
}

#Preview {
    TileEditorView()
}
