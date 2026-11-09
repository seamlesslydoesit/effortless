import SwiftUI

/// A high-fidelity slider with − / + micro-steppers, visible snap ticks and a
/// haptic "lock" when the value lands on a snap point (for example 512 px).
struct PrecisionSlider: View {
    let title: String
    let systemImage: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    var step: Double = 1
    /// Values the thumb locks onto while dragging.
    var snapPoints: [Double] = []
    /// How close (in points along the track) the thumb must come to lock.
    var snapDistance: CGFloat = 10
    var format: (Double) -> String = { String(Int($0.rounded())) }

    @State private var lockedSnap: Double?
    @State private var isDragging = false

    private var span: Double { range.upperBound - range.lowerBound }
    private var fraction: Double { span == 0 ? 0 : (value - range.lowerBound) / span }
    /// Shown as locked whenever the value sits exactly on a snap point.
    private var isLocked: Bool { snapPoints.contains(value) }

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.xxs) {
            HStack(spacing: DS.Space.xs) {
                Label(title, systemImage: systemImage)
                    .font(DS.TypeStyle.label)
                    .foregroundStyle(DS.Colour.textPrimary)
                Spacer(minLength: DS.Space.xs)
                if isLocked {
                    Image(systemName: "lock.fill")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(DS.Colour.accentText)
                        .transition(.scale.combined(with: .opacity))
                }
                Text(format(value))
                    .font(DS.TypeStyle.value)
                    .foregroundStyle(isLocked ? DS.Colour.accentText : DS.Colour.textSecondary)
                    .contentTransition(.numericText())
            }
            .animation(.snappy(duration: 0.15), value: isLocked)

            HStack(spacing: DS.Space.xxs) {
                stepButton(systemImage: "minus", delta: -step)
                track
                stepButton(systemImage: "plus", delta: step)
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(title)
        .accessibilityValue(format(value))
        .accessibilityAdjustableAction { direction in
            switch direction {
            case .increment: nudge(by: step)
            case .decrement: nudge(by: -step)
            @unknown default: break
            }
        }
    }

    // MARK: Track

    private var track: some View {
        GeometryReader { geo in
            let width = geo.size.width
            let usable = max(1, width - DS.Size.thumb)
            let x = DS.Size.thumb / 2 + usable * fraction

            ZStack(alignment: .leading) {
                Capsule()
                    .fill(DS.Colour.track)
                    .frame(height: DS.Size.track)
                Capsule()
                    .fill(DS.Colour.accent)
                    .frame(width: max(DS.Size.track, x), height: DS.Size.track)
                ForEach(snapPoints, id: \.self) { point in
                    let px = DS.Size.thumb / 2 + usable * ((point - range.lowerBound) / span)
                    Capsule()
                        .fill(point == value ? DS.Colour.accent : DS.Colour.separator)
                        .frame(width: 2, height: 12)
                        .offset(x: px - 1)
                }
                Circle()
                    .fill(DS.Colour.thumbFill)
                    .frame(width: DS.Size.thumb, height: DS.Size.thumb)
                    .shadow(color: .black.opacity(0.18), radius: 3, y: 1.5)
                    .overlay(Circle().strokeBorder(isDragging || isLocked ? DS.Colour.accent : DS.Colour.separator, lineWidth: isDragging || isLocked ? 2 : 1))
                    .scaleEffect(isDragging ? 1.12 : 1)
                    .offset(x: x - DS.Size.thumb / 2)
                    .animation(.snappy(duration: 0.12), value: isDragging)
            }
            .frame(maxHeight: .infinity)
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { g in
                        isDragging = true
                        let f = min(max((g.location.x - DS.Size.thumb / 2) / usable, 0), 1)
                        let raw = range.lowerBound + Double(f) * span
                        let tolerance = Double(snapDistance / usable) * span
                        apply(raw, snapTolerance: tolerance)
                    }
                    .onEnded { _ in isDragging = false }
            )
        }
        .frame(height: DS.Size.hitTarget)
    }

    // MARK: Steppers

    private func stepButton(systemImage: String, delta: Double) -> some View {
        Button {
            nudge(by: delta)
        } label: {
            Image(systemName: systemImage)
                .font(.footnote.weight(.bold))
                .foregroundStyle(DS.Colour.textPrimary)
                .frame(width: 30, height: 30)
                .background(Circle().fill(DS.Colour.track))
                .frame(width: DS.Size.hitTarget, height: DS.Size.hitTarget)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .buttonRepeatBehavior(.enabled)
        .accessibilityHidden(true)
    }

    // MARK: Value logic

    private func clamp(_ v: Double) -> Double { min(max(v, range.lowerBound), range.upperBound) }

    private func quantise(_ v: Double) -> Double {
        let q = ((v - range.lowerBound) / step).rounded() * step + range.lowerBound
        return clamp(q)
    }

    /// Dragging: lock onto the nearest snap point when close enough.
    private func apply(_ raw: Double, snapTolerance: Double) {
        if let nearest = snapPoints.min(by: { abs($0 - raw) < abs($1 - raw) }),
           abs(nearest - raw) <= snapTolerance {
            if lockedSnap != nearest {
                lockedSnap = nearest
                Haptics.shared.snap()
            }
            value = nearest
        } else {
            lockedSnap = nil
            value = quantise(raw)
        }
    }

    /// Steppers move exactly one step and never skip over a value.
    private func nudge(by delta: Double) {
        let next = quantise(value + delta)
        guard next != value else { return }
        value = next
        if snapPoints.contains(next) {
            lockedSnap = next
            Haptics.shared.snap()
        } else {
            lockedSnap = nil
            Haptics.shared.tick()
        }
    }
}
