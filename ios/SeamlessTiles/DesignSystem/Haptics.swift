import UIKit

/// One place for all tactile feedback, so every snap, lock and toggle feels the same.
@MainActor
final class Haptics {
    static let shared = Haptics()

    private let snapGenerator = UIImpactFeedbackGenerator(style: .rigid)
    private let lockGenerator = UIImpactFeedbackGenerator(style: .medium)
    private let toggleGenerator = UIImpactFeedbackGenerator(style: .light)
    private let selectionGenerator = UISelectionFeedbackGenerator()

    private init() {
        snapGenerator.prepare()
        lockGenerator.prepare()
        toggleGenerator.prepare()
    }

    /// A slider value landed on a snap point (e.g. 512 px, half-tile shift, 100 % zoom).
    func snap() {
        snapGenerator.impactOccurred(intensity: 0.9)
        snapGenerator.prepare()
    }

    /// The tile locked into seamless alignment (zoom reset, offsets back to zero).
    func lock() {
        lockGenerator.impactOccurred()
        lockGenerator.prepare()
    }

    /// A switch or repeat type changed.
    func toggle() {
        toggleGenerator.impactOccurred(intensity: 0.7)
        toggleGenerator.prepare()
    }

    /// Fine steps from the − / + micro-steppers.
    func tick() {
        selectionGenerator.selectionChanged()
    }
}
