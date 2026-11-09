import SwiftUI

@main
struct StarTileStudioApp: App {
    init() {
        BrandFont.registerAll()
    }

    var body: some Scene {
        WindowGroup {
            TileEditorView()
        }
    }
}
