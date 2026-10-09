// Built-in content for Pattern Parrot: shapes, palettes, layouts and page text.
// Every shape is drawn on a 40 × 40 grid centred on (20, 20).

export const DEFAULT_PAL = ['252561', '158ACF', '8FC21F', 'FFF001', 'FF1493'];

export const PALS = [
  ['Cinco de Mayo', ['28C3A8', 'EEE15F', 'EE0000', 'B01191', 'A2CC2C']],
  ['Modern Vibes', ['FCFCFA', 'CEFD0F', 'FC28B0', '4731CD', '102068']],
  ['Tropical Fruit', ['102068', 'FC28B0', 'E4DC20', 'F87808', '80144C']],
  ['Floral Bouquet', ['84C4AC', 'F80058', 'F8C800', 'EAA705', '764D71']],
  ['Coastal Maine', ['D6D6CE', 'E4300B', '16869B', '284C64', '393955']],
  ['Beach House', ['2898A8', 'F8D858', '101818', 'F0F8F8', 'E83838']],
  ['Flamingo Garden', ['FF0457', 'FE6BA1', 'FEB9F0', 'C7EFEF', '005D39']],
  ['Retro Beach', ['027965', '009778', 'FB8F2D', 'FEC722', 'F5E58E']],
  ['Navy Rules', ['202D50', '4731CD', '28B4E6', 'FBFCFF', 'F2E9C8']],
  ['Sweet Succulent', ['B6C5CA', 'FB8169', 'FF203F', 'F4583B', '27252A']],
  ['Botanicals', ['F05691', 'ED022B', 'F27512', '1B3758', '13C3B5']],
  ['Icecream Sundae', ['BBF3E6', 'F9C8DC', 'FFFDE4', '703A82', '5C3A21']],
  ['Bluebell Sunset', ['73B9D2', 'D9262E', 'F6CFBF', 'F1EFD0', '1B3B4F']],
  ['Ocean Slime', ['4932D3', 'E5FA33', 'A4B647', '126F8E', 'EDEDF7']],
  ['Candy Store', ['190922', 'B26BF5', 'F788D2', '51B1FB', 'FFE747']],
  ['Bright Trail', ['252561', '158ACF', '8FC21F', 'FFF001', 'FF1493']],
  ['Smooth Vintage', ['63254E', '931E30', 'ED3E13', 'FF7012', 'FECA1F']],
  ['Fresh Moves', ['D7EFFF', 'AEB8A0', '351E28', 'E9F056', 'FF5C34']],
  ['Rainbow', ['46019A', '017EFE', '02BA00', 'FEF600', 'DC0000']],
  ['Reggae', ['101010', 'CE0000', '4E7A27', 'FFFF00', '1300A0']],
  ['Scandinavian Folk', ['FF8B70', '1D4ED8', 'FDE047', '86EFAC', '3B0764']],
];

export const INTROS = {
  'Ocean Slime': ['Oh my gooey, you got'],
  'Sweet Succulent': ['Juicy one… you landed on'],
  'Botanicals': ['Super pretty with your'],
  'Icecream Sundae': ['Sticky but yum…it’s'],
  'Coastal Maine': ['Legend has it you got'],
  'Bluebell Sunset': ['Sundowners anyone? You got'],
  'Rainbow': ['Color me happy, you got'],
  'Tropical Fruit': ['9 out of 10 health nuts pick'],
  'Scandinavian Folk': ['Hej! Looks like you found'],
  'Floral Bouquet': ['Must be your birthday. You got'],
  'Flamingo Garden': ['Sleek and stylish designs get a'],
  'Reggae': ['Every little color’s gonna be alright with'],
  'Navy Rules': ['What a boss with that'],
  'Candy Store': ['I won’t tell the dentist you chose'],
  'Beach House': ['Ooooh nice, you got', 'Can I visit?'],
  'Smooth Vintage': ['Your design’s looking sharp with the'],
  'Fresh Moves': ['I see you glamming it up with the'],
  'Bright Trail': ['It’s all good in the world with'],
  'Retro Beach': ['The ocean must be calling. You got'],
  'Modern Vibes': ['Classic choice. You got'],
  'Cinco de Mayo': ['It’s a celebration… you got'],
};

// How big each shape is drawn and where its visual centre sits: [size, cx, cy].
export const FIT = {
  'Square': [24, 20, 20], 'Circle': [26, 20, 20], 'Donut': [26, 20, 20], 'Triangle': [26, 20, 19],
  'Diamond': [30, 20, 20], 'Line': [23, 20, 20], 'Lines': [29, 20, 20], 'Teardrop': [30, 20, 21],
  'Petal': [24, 20, 20], 'Quarter Circle': [22, 20, 20], 'Half Circle': [26, 20, 20.5], 'Heart': [27, 20, 21],
  'Pentagon': [28.5, 20, 18.6], 'Hexagon': [30, 20, 20], 'Heptagon': [29.2, 20, 19.3], 'Octagon': [27.7, 20, 20],
  '8 Point Star': [32, 20, 20], '6 Point Star': [32, 20, 20], 'Scallop': [30.2, 20, 20], 'Spiral': [28.8, 21.1, 18.9],
  'Almond': [30, 20, 20], '3 Leaf Clover': [31.1, 20, 19], '4 Leaf Clover': [28, 20, 20], 'Trapezium': [26, 20, 20],
  'Parallelogram': [30, 20, 20], 'Fish': [31, 18.5, 20], 'Smiley Face': [31, 20, 20], 'Button': [28, 20, 20],
  'Spots': [29, 20.3, 20], 'Mini Triangles': [30.2, 20, 19.1], 'Tree': [30, 20, 19], 'Lollipop': [31, 20, 20.5],
  'Sun': [34, 20, 20], 'Moon': [28, 20.7, 19.8], 'Pinwheel': [28, 20, 20], 'Wedge': [28, 19.9, 20],
  'Ghost': [28, 20, 20], 'Cat': [29, 20, 19.5], 'Umbrella': [30, 20, 21],
};

function buildShapes() {
  const f = (n) => Math.round(n * 100) / 100;
  const pt = (r, deg, cx, cy) => {
    const a = (deg * Math.PI) / 180;
    return f((cx == null ? 20 : cx) + r * Math.cos(a)) + ' ' + f((cy == null ? 20 : cy) + r * Math.sin(a));
  };
  const poly = (n, r, rot) => {
    let d = '';
    for (let i = 0; i < n; i++) d += (i ? 'L' : 'M') + pt(r, -90 + (rot || 0) + (i * 360) / n);
    return d + 'Z';
  };
  const star = (n, r1, r2, cx, cy) => {
    let d = '';
    for (let i = 0; i < n * 2; i++) d += (i ? 'L' : 'M') + pt(i % 2 ? r2 : r1, -90 + (i * 180) / n, cx, cy);
    return d + 'Z';
  };
  const circ = (cx, cy, r) =>
    'M' + f(cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + f(2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + f(-2 * r) + ' 0Z';
  const scallop = () => {
    const n = 14;
    let d = 'M' + pt(12.5, -90);
    for (let i = 0; i < n; i++) d += 'Q' + pt(18, -90 + ((i + 0.5) * 360) / n) + ' ' + pt(12.5, -90 + ((i + 1) * 360) / n);
    return d + 'Z';
  };
  const spiral = () => {
    let d = '';
    const T = 6 * Math.PI;
    for (let i = 0; i <= 90; i++) {
      const t = (T * i) / 90;
      d += (i ? 'L' : 'M') + pt(1 + (13 * t) / T, (t * 180) / Math.PI);
    }
    return d;
  };
  const rays = () => {
    let d = circ(20, 20, 11);
    for (let i = 0; i < 12; i++) {
      const a = i * 30;
      d += 'M' + pt(12.5, a - 4) + 'L' + pt(17, a - 3) + 'L' + pt(17, a + 3) + 'L' + pt(12.5, a + 4) + 'Z';
    }
    return d;
  };
  const about = (px, py, s) => 'translate(' + px + ' ' + py + ') scale(' + s + ') translate(' + -px + ' ' + -py + ')';
  const P = (d, mode, sw, tf) => ({ d, mode: mode || 'fill', sw: sw || 0, tf: tf || '' });
  const small = (d, s, px, py) => P(d, 'fill', 0, about(px == null ? 20 : px, py == null ? 20 : py, s));
  const dot = (cx, cy, r) => P(circ(cx, cy, r));
  const ring = (cx, cy, r) => P(circ(cx, cy, r), 'stroke', 2);
  const X = (name, part) => Object.assign({ name }, part);
  const F = (name, d, o) => Object.assign({ name, d, mode: 'fill', rule: 'nonzero', sec: [] }, o || {});
  const S = (name, d, o) => Object.assign({ name, d, mode: 'stroke', rule: 'nonzero', sec: [] }, o || {});

  const sq = 'M8 8h24v24H8z';
  const tr = 'M20 7L33 31H7z';
  const td = 'M20 6C26 14 31 21 31 25a11 11 0 0 1-22 0C9 21 14 14 20 6z';
  const pet = 'M8 32V20a12 12 0 1 1 12 12z';
  const qc = 'M9 9a22 22 0 0 1 22 22H9z';
  const hc = 'M7 27a13 13 0 0 1 26 0z';
  const hrt = 'M20 33L8 21a7 7 0 0 1 12-9a7 7 0 0 1 12 9z';
  const pen = poly(5, 15);
  const hep = poly(7, 15);
  const alm = 'M20 5C29 14 29 26 20 35C11 26 11 14 20 5Z';
  const trap = 'M13 10H27L33 30H7Z';
  const par = 'M28 14V35L12 26V5Z';
  const sparkles = star(4, 4, 1.4, 31, 9) + star(4, 3, 1.1, 35, 19) + star(4, 3, 1.1, 31, 30);
  const circSec = [X('Small Circle', dot(20, 20, 4.5)), X('Circle Outline', ring(20, 20, 4.5))];

  return {
    Basic: [
      F('Square', sq, { sec: [X('Small Square', small(sq, 0.4)), X('Small Circle', dot(20, 20, 5))] }),
      F('Circle', circ(20, 20, 13), { noMirror: true, sec: [X('Small Circle', dot(20, 20, 5)), X('Circle Outline', ring(20, 20, 5))] }),
      F('Donut', circ(20, 20, 13) + circ(20, 20, 5), { rule: 'evenodd', noMirror: true, sec: [] }),
      F('Triangle', tr, { sec: [X('Small Triangle', small(tr, 0.4, 20, 24)), X('Small Circle', dot(20, 24, 3.5))] }),
      S('Line', 'M10 30L30 10', { sec: [X('Two short lines', P('M12 18L18 12M22 28L28 22', 'stroke', 3))] }),
      F('Teardrop', td, { sec: [X('Small Teardrop', small(td, 0.4, 20, 25)), X('Small Circle', dot(20, 25, 4))] }),
      F('Petal', pet, { sec: [X('Small Circle', dot(20, 20, 5)), X('Circle Outline', ring(20, 20, 5))] }),
      F('Quarter Circle', qc, { sec: [X('Small Quarter Circle', small(qc, 0.4, 9, 31))] }),
      F('Half Circle', hc, { sec: [X('Small Half Circle', small(hc, 0.4, 20, 27))] }),
      F('Heart', hrt, { sec: [X('Small Heart', small(hrt, 0.38, 20, 33))] }),
      F('Parallelogram', par, { sec: [X('Small Parallelogram', small(par, 0.4))] }),
    ],
    Advanced: [
      F('Pentagon', pen, { sec: [X('Small Pentagon', small(pen, 0.4))] }),
      F('Hexagon', poly(6, 15, 30), { noMirror: true, sec: [X('Small Circle', dot(20, 20, 5)), X('Circle Outline', ring(20, 20, 5))] }),
      F('Heptagon', hep, { sec: circSec }),
      F('6 Point Star', star(6, 16, 8), { noMirror: true, sec: circSec }),
      F('8 Point Star', star(8, 16, 8), { noMirror: true, sec: circSec }),
      F('Scallop', scallop(), { sec: [X('Small Circle', dot(20, 20, 6)), X('Circle Outline', ring(20, 20, 6))] }),
      S('Spiral', spiral()),
      F('Almond', alm, { sec: [X('Small Almond', small(alm, 0.4))] }),
      F('Trapezium', trap, { sec: [X('Small Trapezium', small(trap, 0.4))] }),
    ],
    Fun: [
      F('Sun', rays(), { sec: [X('Small Circle', dot(20, 20, 3.5)), X('Circle Outline', ring(20, 20, 3.5))] }),
      F('Fish', 'M3 13L10.6 18C14.5 11.5 27.5 11 34 20C27.5 29 14.5 28.5 10.6 22L3 27L5.5 20Z', { sec: [X('Eye', dot(27, 18, 2))] }),
      S('Smiley Face', circ(20, 20, 14) + 'M13 23Q20 30 27 23M15 15h0.1M25 15h0.1'),
      F('Button', circ(20, 20, 14) + circ(16, 16, 2) + circ(24, 16, 2) + circ(16, 24, 2) + circ(24, 24, 2), { rule: 'evenodd', noMirror: true }),
      F('Lollipop', circ(20, 15, 10) + 'M18.5 24h3v12h-3z', { sec: [X('Small Circle', dot(20, 15, 4)), X('Circle Outline', ring(20, 15, 4))] }),
      F('Moon', 'M24 6A14 14 0 1 0 34 26A11 11 0 1 1 24 6Z', { sec: [X('Stars', P(sparkles))] }),
      F('Ghost', 'M8 34V18A12 12 0 0 1 32 18V34L28 31L24 34L20 31L16 34L12 31Z', { multi: true, sec: [X('Eyes', P(circ(15, 19, 2) + circ(25, 19, 2))), X('Mouth', P(circ(20, 26, 2)))] }),
      F('Cat', 'M7 23a13 11 0 1 0 26 0a13 11 0 1 0-26 0ZM8 19L18 13L9 5ZM32 19L31 5L22 13Z', { sec: [X('Face', P('M15 22h0.1M25 22h0.1M20 25v2.5M17.5 29q2.5 1.5 5 0', 'stroke', 2))] }),
      F('Umbrella', 'M5 21A15 15 0 0 1 35 21ZM18.5 21h3v10a5 5 0 0 1-10 0v-1h3v1a2 2 0 0 0 4 0z', { sec: [X('Small Semicircle', P('M12 21A8 8 0 0 1 28 21Z'))] }),
    ],
  };
}

export const LIB = buildShapes();
export const SETS = ['Basic', 'Advanced', 'Fun'];
export const ALL_SHAPES = LIB.Basic.concat(LIB.Advanced, LIB.Fun);

export function currentShape(cfg) {
  const list = LIB[cfg.set] || LIB.Basic;
  return list.find((s) => s.name === cfg.picks[cfg.set]) || list[0];
}

export const LAYOUTS = [
  ['Grid', 'Motifs line up in neat rows and columns.'],
  ['Half-drop', 'Every other column slides down half a step.'],
  ['Brick', 'Every other row slides sideways, like brickwork.'],
  ['Mirrored', 'Neighbouring motifs flip to make a reflected pattern.'],
  ['Tossed', 'Motifs are scattered at different spots and angles. Shuffle! scatters them again.'],
  ['Honeycomb', 'Hexagons nest together like a honeycomb, with no gaps.'],
];

// Profile pictures: [shape, background, shape color, optional scale].
export const AVATARS = [
  ['Heart', '#FF1493', '#FFF001'], ['Spiral', '#158ACF', '#FFF001'], ['Cat', '#FFF001', '#252561'],
  ['Fish', '#8FC21F', '#252561', 0.78], ['Sun', '#252561', '#FFF001'], ['Lollipop', '#8FC21F', '#FF1493'],
  ['Umbrella', '#FF1493', '#252561'], ['Button', '#158ACF', '#FFFFFF'], ['6 Point Star', '#FFF001', '#FF1493'],
];

export const BG_NAMES = {
  '#FFFFFF': 'white', '#F2F2F2': 'light grey', '#F6F0DC': 'light cream', '#252561': 'navy blue', '#000000': 'black',
};

// Menu pages. The text in [brackets] is still to be written. The flag marks a draft.
export const PAGES = {
  About: ['[About Pattern Parrot — text to follow]', false],
  FAQ: ['[Questions and answers — details to follow]', false],
  Terms: ['[Terms of use to follow. Name, contact, date and site details still to be added.]', true],
  Privacy: ['[Privacy notice to follow. Name, contact, date and site details still to be added.]', true],
  Help: ['[Help and how-to guides — details to follow]', false],
};

export const TOOLS = [
  ['layout', 'Start', 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'],
  ['shape', 'Shape', 'M12 4l8 14H4z'],
  ['details', 'Details', 'M12 4a8 8 0 1 1 0 16a8 8 0 1 1 0-16zM12 9.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5z'],
  ['colours', 'Colors', 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2 0-1.5 1-2 2.5-2H18a3 3 0 0 0 3-3 9 9 0 0 0-9-11zM7.5 11h0.1M10 7h0.1M15 7h0.1'],
  ['adjust', 'Adjust', 'M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4'],
  ['save', 'Save', 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],
  ['download', 'Download', 'M12 4v11M7 10l5 5 5-5M5 20h14'],
];
