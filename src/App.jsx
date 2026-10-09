import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BG_NAMES, DEFAULT_PAL, FIT, INTROS, LAYOUTS, LIB, PAGES, PALS, SETS, TOOLS, currentShape,
} from './data.js';
import { downloadPng, downloadSvg } from './pattern.js';
import { hashPassword, loadSaved, shrinkPhoto, storeSaved } from './storage.js';
import { Profile } from './Profile.jsx';
import { Avatar, Icon, PatternView, avatarOf } from './parts.jsx';

const DESIGN_KEYS = ['set', 'picks', 'sec', 'density', 'pal', 'size', 'spacing', 'rot', 'layout', 'seed', 'fill', 'bg'];
const START_DESIGN = {
  set: 'Basic', picks: { Basic: 'Circle', Advanced: 'Hexagon', Fun: 'Sun' }, layout: 'Half-drop', size: 115, spacing: 36,
  rot: 0, fill: 'Outlines mix', density: 'Large', sec: { Circle: { 'Small Circle': true } }, bg: '#F2F2F2', pal: DEFAULT_PAL.slice(), seed: 0,
};
const FILLERS = ['252561', '158ACF', '8FC21F', 'FFF001', 'FF1493', 'FCFCFA'];
const HEX6 = /^#[0-9a-fA-F]{6}$/;
const EMAIL = /^\S+@\S+\.\S+$/;

function shuffled(avoid) {
  const a = PALS.map((_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a[0] === avoid) [a[0], a[1]] = [a[1], a[0]];
  return a;
}
const clampSize = (v) => Math.max(50, Math.min(150, Math.round(v)));
const wrapRot = (v) => {
  let r = Math.round(v);
  while (r > 180) r -= 360;
  while (r < -180) r += 360;
  return r;
};
const pickDesign = (st) => JSON.parse(JSON.stringify(DESIGN_KEYS.reduce((o, k) => ((o[k] = st[k]), o), {})));
const fitLayout = (layout, s) => ((layout === 'Mirrored' && s.noMirror) || (layout === 'Honeycomb' && s.name !== 'Hexagon') ? 'Grid' : layout);
const sideFor = (i) => ((i % 4) < 2 ? 'right' : 'left');

function initialState() {
  const saved = loadSaved();
  const design = Object.assign({}, START_DESIGN, saved.design || {});
  return {
    ...design,
    tool: 'layout', drafts: design.pal.slice(), mode: 'Default', deck: shuffled(-1), pos: 0, dealt: false,
    saved: saved.saved || [], pname: '', palNote: '', quickNote: '', kind: 'tile', note: '', noteKind: '', dlFmt: 'png', dlTip: '',
    menu: false, page: '', tip: false, toolsEnd: false, bgHex: null,
    overlay: '', folder: '', pending: null, confirm: null, renaming: null, renamingSw: null,
    account: saved.account || null, signedIn: !!saved.signedIn && !!saved.account,
    avatar: saved.avatar || 'Heart', photo: saved.photo || '', patterns: saved.patterns || [],
    fName: '', fEmail: '', fPw: '', formErr: '', busy: false,
  };
}

const ICON = {
  user: 'M12 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8zM4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  minus: 'M5 12h14',
  plus: 'M5 12h14M12 5v14',
  turn: 'M18.9 16A8 8 0 1 1 17.7 6.3M20 4v5h-5',
  down: 'M12 4v11M7 10l5 5 5-5M5 20h14',
};

export default function App() {
  const [s, setS] = useState(initialState);
  const set = (patch) => setS((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  const ptrs = useRef({});
  const gest = useRef(null);
  const toolsRef = useRef(null);

  // Remember designs, palettes and the profile on this device.
  const cfg = useMemo(() => pickDesign(s), DESIGN_KEYS.map((k) => s[k])); // eslint-disable-line react-hooks/exhaustive-deps
  const [storeFailed, setStoreFailed] = useState(false);
  useEffect(() => {
    const ok = storeSaved({ design: cfg, saved: s.saved, patterns: s.patterns, account: s.account, signedIn: s.signedIn, avatar: s.avatar, photo: s.photo });
    setStoreFailed(!ok);
  }, [cfg, s.saved, s.patterns, s.account, s.signedIn, s.avatar, s.photo]);

  const list = LIB[s.set];
  const sh = currentShape(s);
  const secOn = s.sec[sh.name] || {};
  const profile = s.signedIn ? s.account : null;
  const onPage = !!s.page;
  const tool = onPage ? '' : s.tool;

  const usePal = (codes, extra) => set({ pal: codes.slice(), drafts: codes.slice(), ...(extra || {}) });
  const dealNext = (extra) => {
    let deck = s.deck;
    let pos = s.pos + 1;
    if (pos >= deck.length) {
      deck = shuffled(deck[s.pos]);
      pos = 0;
    }
    usePal(PALS[deck[pos]][1], { deck, pos, ...(extra || {}) });
  };
  const addPattern = (design, patterns) => {
    const name = currentShape(design).name + ' pattern ' + (patterns.length + 1);
    return patterns.concat([{ id: Date.now() + Math.random(), name, cfg: design }]);
  };

  // Two-finger pinch and twist on the preview.
  const gesture = () => {
    const ids = Object.keys(ptrs.current);
    if (ids.length < 2) return null;
    const a = ptrs.current[ids[0]];
    const b = ptrs.current[ids[1]];
    return { dist: Math.hypot(b.x - a.x, b.y - a.y), ang: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
  };
  const startGesture = () => {
    const g = gesture();
    gest.current = g ? { ...g, size: s.size, rot: s.rot } : null;
  };
  const pDown = (e) => {
    ptrs.current[e.pointerId] = { x: e.clientX, y: e.clientY };
    startGesture();
  };
  const pMove = (e) => {
    if (!ptrs.current[e.pointerId]) return;
    ptrs.current[e.pointerId] = { x: e.clientX, y: e.clientY };
    const g = gesture();
    const g0 = gest.current;
    if (g && g0 && g0.dist > 0) set({ size: clampSize((g0.size * g.dist) / g0.dist), rot: wrapRot(g0.rot + g.ang - g0.ang) });
  };
  const pUp = (e) => {
    delete ptrs.current[e.pointerId];
    startGesture();
  };

  const caps = 'pp-caps';
  const pill = (on, extra = '') => `pp-pill ${on ? 'is-on' : ''} ${caps} ${extra}`;
  const tiles = tool === 'download' && s.kind === 'tile' ? 1 : 3;

  // ---- Colors ----
  const pn = PALS[s.deck[s.pos]][0];
  const pnKey = s.pal.join(',').toUpperCase();
  const pnSaved = s.saved.some((x) => x.name.toLowerCase() === pn.toLowerCase() || x.pal.join(',').toUpperCase() === pnKey);
  const intro = INTROS[pn] || [];
  const savePal = () => {
    const name = s.pname.trim();
    if (!name) return set({ palNote: 'Give your palette a name first.' });
    if (s.saved.some((x) => x.name.toLowerCase() === name.toLowerCase())) return set({ palNote: 'You already have a palette with that name.' });
    if (s.saved.length >= 12) return set({ palNote: 'You can keep up to 12 palettes.' });
    set({ saved: s.saved.concat([{ name, pal: s.pal.slice() }]), palNote: `Saved “${name}”.` });
  };
  const quickSave = () => {
    if (pnSaved) return set({ quickNote: 'Already in My Swatches.' });
    if (s.saved.length >= 12) return set({ quickNote: 'You can keep up to 12 palettes.' });
    set({ saved: s.saved.concat([{ name: pn, pal: s.pal.slice() }]), quickNote: 'Saved to My Swatches. Tap Profile to see it.' });
  };
  const pickMode = (label) => {
    if (label === 'Default') usePal(DEFAULT_PAL, { mode: label });
    else if (label === 'Surprise Me!') {
      if (s.dealt) dealNext({ mode: label, quickNote: '' });
      else usePal(PALS[s.deck[s.pos]][1], { mode: label, dealt: true, quickNote: '' });
    } else set({ mode: label, palNote: '', quickNote: '' });
  };
  const bgDraft = s.bgHex != null ? s.bgHex : HEX6.test(s.bg) ? s.bg.slice(1).toUpperCase() : '';
  const bgInput = HEX6.test(s.bg) ? s.bg.toLowerCase() : '#dadad8';
  const onBgHex = (e) => {
    const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).toUpperCase();
    set(v.length === 6 ? { bg: '#' + v, bgHex: null } : { bgHex: v });
  };

  // ---- Save & download ----
  const savePattern = () => {
    if (!profile) return set({ overlay: 'create', pending: pickDesign(s), formErr: '', menu: false });
    set({ patterns: addPattern(pickDesign(s), s.patterns), note: 'Saved to My Patterns. Tap Profile to see it.', noteKind: 'save' });
  };
  const fileName = `pattern-parrot-${sh.name.toLowerCase().replace(/\s+/g, '-')}-${s.kind === 'tile' ? 'tile' : 'repeat'}`;
  const dlTiles = s.kind === 'tile' ? 1 : 3;
  const savePng = async () => {
    set({ dlFmt: 'png', note: 'Making your picture…', noteKind: 'dl' });
    try {
      await downloadPng(cfg, dlTiles, fileName);
      set({ note: `Your 2400 × 2400 ${s.kind === 'tile' ? 'single tile' : '3 × 3 repeat'} picture is downloading. Look in Photos, Files or Downloads.` });
    } catch {
      set({ note: 'Sorry, the picture couldn’t be made on this browser. Try the SVG file instead.' });
    }
  };
  const saveSvg = () => {
    downloadSvg(cfg, dlTiles, fileName);
    set({ dlFmt: 'svg', note: 'Your SVG file is downloading. Look in Files or Downloads.', noteKind: 'dl' });
  };

  // ---- Profile ----
  const submitForm = async () => {
    const email = s.fEmail.trim();
    if (s.overlay === 'create' && !s.fName.trim()) return set({ formErr: 'Please add your name.' });
    if (!EMAIL.test(email)) return set({ formErr: 'Please check your email address.' });
    if (s.fPw.length < 8) return set({ formErr: 'Your password needs at least 8 characters.' });
    const pwHash = await hashPassword(s.fPw);
    let account = s.account;
    if (s.overlay === 'create') {
      account = { name: s.fName.trim(), email, pwHash };
    } else {
      if (!account || account.email.toLowerCase() !== email.toLowerCase()) {
        return set({ formErr: 'There’s no profile with that email on this device. Make a profile instead?' });
      }
      if (account.pwHash !== pwHash) return set({ formErr: 'That password doesn’t match. Please try again.' });
    }
    set((prev) => ({
      account, signedIn: true, overlay: 'account', formErr: '', fPw: '',
      ...(prev.pending ? { patterns: addPattern(prev.pending, prev.patterns), pending: null, folder: 'patterns' } : { folder: '' }),
    }));
  };
  const saveDetails = async (d) => {
    const nm = d.name.trim();
    const em = d.email.trim();
    if (!nm) return 'Please add your name.';
    if (!EMAIL.test(em)) return 'Please check your email address.';
    let pwHash = s.account.pwHash;
    if (d.pw || d.pw2) {
      if (d.pw.length < 8) return 'Your new password needs at least 8 characters.';
      if (d.pw !== d.pw2) return 'The two new passwords don’t match.';
      pwHash = await hashPassword(d.pw);
    }
    set({ account: { name: nm, email: em, pwHash } });
    return '';
  };
  const onPhoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const photo = await shrinkPhoto(file);
      set({ photo, avatar: 'photo' });
    } catch {
      /* not a picture we can read */
    }
  };

  const scrollTools = () => {
    const nav = toolsRef.current;
    if (!nav) return;
    if (s.toolsEnd) nav.scrollTo({ left: 0, behavior: 'smooth' });
    else nav.scrollBy({ left: 220, behavior: 'smooth' });
  };
  const onToolScroll = (e) => {
    const t = e.currentTarget;
    const end = t.scrollLeft + t.clientWidth >= t.scrollWidth - 12;
    if (end !== s.toolsEnd) set({ toolsEnd: end });
  };

  const plainPanel = ['layout', 'details', 'shape', 'save', 'download'].includes(tool);
  const presets = Object.keys(BG_NAMES);
  const customBg = presets.indexOf(s.bg.toUpperCase()) < 0;
  const vbOf = (nm) => {
    const f = FIT[nm] || [32, 20, 20];
    const z = f[0] * ({ 'Half Circle': 0.8, Fish: 0.86 }[nm] || 1.06);
    return `${(f[1] - z / 2).toFixed(2)} ${(f[2] - z / 2).toFixed(2)} ${z.toFixed(2)} ${z.toFixed(2)}`;
  };
  const pickSecondary = (x) => {
    const o = sh.multi ? { ...secOn, [x.name]: !secOn[x.name] } : secOn[x.name] ? {} : { [x.name]: true };
    set({ sec: { ...s.sec, [sh.name]: o } });
  };
  const snap = (v, at, w) => (Math.abs(v - at) <= w ? at : v);

  return (
    <div className="pp-app">
      <header className="pp-header">
        <span className="pp-logo">PATTERN<br />PARROT</span>
        <div className="pp-row6">
          <button className="pp-btn pp-shuffle" onClick={() => set({ seed: (s.seed + 1) % 997 })}>SHUFFLE!</button>
          <button
            className="pp-btn pp-square"
            aria-label="Your profile"
            style={{ background: profile ? avatarOf(s.avatar, s.photo).bg : '#fff', overflow: 'hidden' }}
            onClick={() => set({ overlay: profile ? 'account' : s.account ? 'signin' : 'create', menu: false, formErr: '' })}
          >
            {profile ? <Avatar av={avatarOf(s.avatar, s.photo)} /> : <Icon d={ICON.user} />}
          </button>
          <button
            className="pp-btn pp-square"
            aria-expanded={s.menu}
            aria-label="Menu: About, FAQ, Terms, Privacy, Help"
            style={{ background: s.menu ? '#FFF001' : '#fff' }}
            onClick={() => set({ menu: !s.menu })}
          >
            <Icon d={s.menu ? ICON.close : ICON.menu} />
          </button>
        </div>
      </header>

      {s.menu && (
        <nav aria-label="Menu" className="pp-menu">
          {Object.keys(PAGES).map((label) => (
            <button key={label} className={`pp-menu-item ${caps} ${s.page === label ? 'is-on' : ''}`} onClick={() => set({ page: label, menu: false })}>
              {label}
            </button>
          ))}
        </nav>
      )}

      {!onPage && (
        <section
          className="pp-preview"
          aria-label="Pattern preview. Pinch to resize, twist to rotate."
          style={{ background: s.bg }}
          onPointerDown={pDown}
          onPointerMove={pMove}
          onPointerUp={pUp}
          onPointerCancel={pUp}
          onPointerLeave={pUp}
        >
          <PatternView cfg={cfg} tiles={tiles} />
          <span className="pp-readout">{sh.name} · {s.size}% · {s.rot}°</span>
          <button className="pp-btn pp-tip-btn" aria-label="Show tip" aria-expanded={s.tip} style={{ background: s.tip ? '#FFF001' : '#fff' }} onClick={() => set({ tip: !s.tip })}>
            <Icon d={ICON.bulb} />
          </button>
          {s.tip && (
            <div role="status" className="pp-tip">Use two fingers to change the size and direction of the design.</div>
          )}
          <div className="pp-zoom">
            <button className="pp-btn pp-zoom-btn" aria-label="Make motifs smaller" onClick={() => set({ size: clampSize(s.size - 10) })}><Icon d={ICON.minus} size={18} sw={2.4} /></button>
            <button className="pp-btn pp-zoom-btn" aria-label="Make motifs bigger" onClick={() => set({ size: clampSize(s.size + 10) })}><Icon d={ICON.plus} size={18} sw={2.4} /></button>
            <button className="pp-btn pp-zoom-btn" aria-label="Rotate motifs 15 degrees" onClick={() => set({ rot: wrapRot(s.rot + 15) })}><Icon d={ICON.turn} size={18} sw={2.2} /></button>
            <button className="pp-btn pp-zoom-btn pp-reset" aria-label="Reset size and rotation" onClick={() => set({ size: 115, rot: 0 })}>Reset</button>
          </div>
        </section>
      )}

      <div className="pp-tools-wrap">
        <nav className="pp-tools" aria-label="Tools" ref={toolsRef} onScroll={onToolScroll}>
          {TOOLS.map(([id, label, icon]) => (
            <button
              key={id}
              aria-pressed={tool === id}
              className={`pp-btn pp-tool ${tool === id ? 'is-on' : ''}`}
              onClick={() => set({ tool: id, page: '', menu: false, note: '', dlTip: '' })}
            >
              <Icon d={icon} />
              <span className={caps}>{label}</span>
            </button>
          ))}
          <span aria-hidden="true" className="pp-tools-spacer" />
        </nav>
        <div aria-hidden="true" className="pp-tools-fade" />
        <button className="pp-btn pp-more" aria-label={s.toolsEnd ? 'Back to the first tools' : 'Show more tools'} onClick={scrollTools}>
          <Icon d={s.toolsEnd ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} size={18} sw={2.8} />
        </button>
      </div>

      <section className={`pp-panel ${plainPanel ? 'is-plain' : 'is-boxed'} ${tool === 'adjust' ? 'is-short' : ''}`}>
        {onPage && (
          <>
            <h2 className="pp-h-big">{s.page}</h2>
            {PAGES[s.page][1] && <span className="pp-draft">Draft — not final</span>}
            <p className="pp-body">{PAGES[s.page][0]}</p>
            <button className="pp-btn pp-cta" onClick={() => set({ page: '' })}>Back to Studio</button>
          </>
        )}

        {tool === 'layout' && (
          <>
            <div className="pp-card">
              <h2 className="pp-h">Tile layout</h2>
              <div className="pp-layouts">
                {LAYOUTS.filter((l) => !(l[0] === 'Mirrored' && sh.noMirror) && !(l[0] === 'Honeycomb' && sh.name !== 'Hexagon')).map(([name]) => (
                  <button key={name} aria-pressed={s.layout === name} className={pill(s.layout === name, 'pp-layout-btn')} onClick={() => set({ layout: name })}>
                    {name}
                  </button>
                ))}
              </div>
              <p className="pp-help">
                {(LAYOUTS.find((l) => l[0] === s.layout) || LAYOUTS[0])[1]}
                {sh.noMirror ? ` Mirrored isn’t offered for ${sh.name}.` : ''}
              </p>
            </div>
            <div className="pp-card">
              <h2 className="pp-h">Background color</h2>
              <div className="pp-bgs">
                {presets.map((h) => (
                  <button
                    key={h}
                    aria-label={'Background ' + BG_NAMES[h]}
                    aria-pressed={s.bg.toUpperCase() === h}
                    className="pp-bg-chip"
                    style={{ background: h, border: s.bg.toUpperCase() === h ? '3px solid #000' : '1px solid #000' }}
                    onClick={() => set({ bg: h, bgHex: null })}
                  />
                ))}
                <label className="pp-bg-chip pp-bg-picker" style={{ background: customBg ? s.bg : '#fff', border: customBg ? '3px dashed #000' : '2px dashed #000' }}>
                  <input type="color" value={bgInput} onChange={(e) => set({ bg: e.target.value.toUpperCase(), bgHex: null })} aria-label="Pick any background color" />
                  <span aria-hidden="true" className="pp-plus-dot"><Icon d={ICON.plus} size={12} sw={3} /></span>
                </label>
              </div>
              <p className="pp-small">The background is separate from your motif colors.</p>
            </div>
          </>
        )}

        {tool === 'shape' && (
          <>
            <div className="pp-grid3">
              {SETS.map((l) => (
                <button
                  key={l}
                  aria-pressed={s.set === l}
                  className={pill(s.set === l, 'pp-nopad')}
                  onClick={() => {
                    const L = LIB[l];
                    const s2 = L.find((x) => x.name === s.picks[l]) || L[0];
                    set({ set: l, layout: fitLayout(s.layout, s2), sec: s2.name === sh.name ? s.sec : {} });
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="pp-grid4">
              {list.map((x) => (
                <button
                  key={x.name}
                  aria-pressed={x.name === sh.name}
                  className={`pp-btn pp-shape ${x.name === sh.name ? 'is-on' : ''}`}
                  onClick={() => set({ picks: { ...s.picks, [s.set]: x.name }, layout: fitLayout(s.layout, x), sec: x.name === sh.name ? s.sec : {} })}
                >
                  <svg width="38" height="38" viewBox={vbOf(x.name)} aria-hidden="true" style={{ overflow: 'visible' }}>
                    <path d={x.d} fill={x.mode === 'fill' ? '#000' : 'none'} fillRule={x.rule} stroke={x.mode === 'stroke' ? '#000' : 'none'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{x.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {tool === 'details' && (
          <>
            <div className="pp-card">
              <h2 className="pp-h">Secondary shape</h2>
              {sh.sec.length === 0 && <p className="pp-help pp-black">Nothing to add to {sh.name}. Pick another shape to add design details.</p>}
              <div className="pp-grid2">
                {sh.sec.map((x, i) => (
                  <button
                    key={x.name}
                    aria-pressed={!!secOn[x.name]}
                    className={pill(!!secOn[x.name], 'pp-big-pill pp-ellipsis')}
                    style={sh.sec.length % 2 === 1 && i === sh.sec.length - 1 ? { gridColumn: 'span 2' } : undefined}
                    onClick={() => pickSecondary(x)}
                  >
                    {x.name}
                  </button>
                ))}
              </div>
              {sh.multi && <p className="pp-small">Tick either or both.</p>}
            </div>
            <div className="pp-card">
              <h2 className="pp-h">Shape fill</h2>
              {sh.mode === 'fill' ? (
                <div className="pp-row6">
                  {['Filled', 'Outlines only', 'Outlines mix'].map((name) => (
                    <button key={name} aria-pressed={s.fill === name} className={pill(s.fill === name, 'pp-big-pill pp-flex1')} onClick={() => set({ fill: name })}>
                      {name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="pp-help pp-black">{sh.name} is always shown as an outline.</p>
              )}
            </div>
            <div className="pp-card">
              <h2 className="pp-h">Pattern details</h2>
              <div className="pp-row6">
                {['Small', 'Medium', 'Large'].map((name) => (
                  <button key={name} aria-pressed={s.density === name} className={pill(s.density === name, 'pp-big-pill pp-flex1')} onClick={() => set({ density: name })}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {tool === 'adjust' && (
          <>
            {[
              { id: 'size', label: 'Shape size', min: 50, max: 150, value: s.size, shown: s.size + '%', change: (v) => set({ size: snap(v, 100, 4) }) },
              { id: 'spacing', label: 'Spacing', min: 0, max: 100, value: s.spacing, shown: String(s.spacing), change: (v) => set({ spacing: snap(v, 0, 3) }) },
              { id: 'rot', label: 'Rotation', min: -180, max: 180, value: s.rot, shown: s.rot + '°', change: (v) => set({ rot: snap(v, 0, 8) }) },
            ].map((sl) => (
              <div key={sl.id} className="pp-slider">
                <div className="pp-between">
                  <label htmlFor={sl.id} className="pp-slider-label">{sl.label}</label>
                  <span className="pp-num">{sl.shown}</span>
                </div>
                <input id={sl.id} type="range" min={sl.min} max={sl.max} value={sl.value} onChange={(e) => sl.change(+e.target.value)} />
              </div>
            ))}
          </>
        )}

        {tool === 'colours' && (
          <>
            <div className="pp-row6">
              {['Default', 'Surprise Me!', 'My Palettes'].map((label) => (
                <button key={label} aria-pressed={s.mode === label} className={pill(s.mode === label, 'pp-flex1 pp-mode')} onClick={() => pickMode(label)}>
                  {label}
                </button>
              ))}
            </div>

            {s.mode === 'Surprise Me!' && (
              <>
                <div className="pp-surprise">
                  <span className="pp-surprise-text">
                    <span className="pp-surprise-intro">{intro[0] || 'Yummy, you got'}</span>
                    <span className="pp-surprise-name">{pn} palette!</span>
                    {intro[1] && <span className="pp-surprise-intro">{intro[1]}</span>}
                  </span>
                  <div className="pp-col6">
                    <button className="pp-btn pp-mini" onClick={() => dealNext({ quickNote: '' })}>Again!</button>
                    <button
                      className="pp-btn pp-mini"
                      aria-label={pnSaved ? `${pn} is saved to My Swatches` : `Save ${pn} to My Swatches`}
                      style={{ background: pnSaved ? '#FFF001' : '#fff' }}
                      onClick={quickSave}
                    >
                      {pnSaved ? 'SAVED' : 'SAVE'}
                    </button>
                  </div>
                </div>
                {s.quickNote && <p role="status" className="pp-pink-note">{s.quickNote}</p>}
              </>
            )}

            {s.mode === 'My Palettes' && (
              <div className="pp-mine">
                <span className="pp-label">How many colors?</span>
                <div className="pp-grid6">
                  {[1, 2, 3, 4, 5, 6].map((m) => (
                    <button
                      key={m}
                      aria-pressed={s.pal.length === m}
                      className={`pp-btn pp-count ${s.pal.length === m ? 'is-on' : ''}`}
                      onClick={() => {
                        const pal = s.pal.slice(0, m);
                        while (pal.length < m) pal.push(FILLERS[pal.length]);
                        usePal(pal);
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <label htmlFor="pname" className="pp-label">Palette name</label>
                <input id="pname" type="text" maxLength={32} value={s.pname} onChange={(e) => set({ pname: e.target.value.slice(0, 32) })} placeholder="e.g. Seaside Sorbet" className="pp-input" />
                <div className="pp-row6">
                  <button className="pp-btn pp-half is-on" onClick={savePal}>Save palette</button>
                  <button className="pp-btn pp-half" onClick={() => usePal(DEFAULT_PAL, { pname: '', palNote: '' })}>New palette</button>
                </div>
                {s.palNote && <span className="pp-label">{s.palNote}</span>}
                <div className="pp-wrap6">
                  {s.saved.map((x) => (
                    <button key={x.name} className="pp-btn pp-chip" onClick={() => usePal(x.pal, { pname: x.name, palNote: '' })}>{x.name}</button>
                  ))}
                </div>
                <span className="pp-small pp-black">Up to 12 palettes, kept on this device and browser.</span>
              </div>
            )}

            <div className="pp-swatches">
              {s.pal.map((c, i) => (
                <div key={i} className="pp-swatch">
                  <input
                    type="color"
                    value={'#' + c.toLowerCase()}
                    aria-label={'Pick color ' + (i + 1)}
                    onChange={(e) => {
                      const v = e.target.value.replace('#', '').toUpperCase();
                      const pal = s.pal.slice();
                      const dr = s.drafts.slice();
                      pal[i] = v;
                      dr[i] = v;
                      set({ pal, drafts: dr });
                    }}
                  />
                  <label htmlFor={'hex' + i} className="pp-swatch-name">Color {i + 1}</label>
                  <div className="pp-hex">
                    <span>#</span>
                    <input
                      id={'hex' + i}
                      maxLength={6}
                      value={s.drafts[i] ?? c}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).toUpperCase();
                        const dr = s.drafts.slice();
                        dr[i] = v;
                        const pal = s.pal.slice();
                        if (v.length === 6) pal[i] = v;
                        set({ drafts: dr, pal });
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="pp-swatch pp-swatch-last">
                <input type="color" value={bgInput} onChange={(e) => set({ bg: e.target.value.toUpperCase(), bgHex: null })} aria-label="Pick background color" />
                <label htmlFor="hexbg" className="pp-swatch-name">Background</label>
                <div className="pp-hex">
                  <span>#</span>
                  <input id="hexbg" maxLength={6} value={bgDraft} onChange={onBgHex} />
                </div>
              </div>
            </div>
          </>
        )}

        {tool === 'save' && (
          <div className="pp-card pp-card-roomy">
            <button className="pp-btn pp-black-btn" onClick={savePattern}>
              <svg width="20" height="18" viewBox="0 0 40 34" aria-hidden="true"><path d="M2 6a3 3 0 0 1 3-3h10l4 4h16a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" fill="none" stroke="#fff" strokeWidth="3" /></svg>
              Save to MY PATTERNS
            </button>
            <p className="pp-small pp-center">Keep your design to edit later.</p>
            {s.note && s.noteKind === 'save' && <p role="status" className="pp-pink-note">{s.note}</p>}
          </div>
        )}

        {tool === 'download' && (
          <div className="pp-card pp-card-roomy">
            <h2 className="pp-h">Download</h2>
            <div className="pp-grid2 pp-gap8">
              {[['tile', 'Single tile', 'One block to repeat in another tool'], ['repeat', '3 × 3 repeat', 'Nine tiles in one square picture']].map(([id, label, help]) => (
                <button key={id} aria-pressed={s.kind === id} className={`pp-btn pp-kind ${s.kind === id ? 'is-dark' : ''}`} onClick={() => set({ kind: id, note: '' })}>
                  <span className="pp-kind-label">{label}</span>
                  <span className="pp-kind-help">{help}</span>
                </button>
              ))}
            </div>
            <div className="pp-dl-row">
              {[
                ['png', 'Download PNG picture', 'About PNG', 'Picture needed for many print on demand sites.', savePng],
                ['svg', 'Download SVG vector file', 'About SVG', 'Vector file that stays sharp at any size.', saveSvg],
              ].map(([fmt, label, tipLabel, tipText, action]) => (
                <div key={fmt} className="pp-dl-box">
                  <button className="pp-btn pp-dl" aria-label={label} style={{ background: s.dlFmt === fmt ? '#FFF001' : '#fff' }} onClick={action}>
                    <Icon d={ICON.down} size={30} sw={2.4} />
                    <span>{fmt.toUpperCase()}</span>
                  </button>
                  {s.dlTip === fmt && <div role="status" className="pp-dl-tip">{tipText}</div>}
                  <button
                    className="pp-btn pp-dl-tip-btn"
                    aria-label={tipLabel}
                    aria-expanded={s.dlTip === fmt}
                    style={{ background: s.dlTip === fmt ? '#FFF001' : '#fff' }}
                    onClick={() => set({ dlTip: s.dlTip === fmt ? '' : fmt })}
                  >
                    <Icon d={ICON.bulb} size={16} />
                  </button>
                </div>
              ))}
            </div>
            {s.note && s.noteKind === 'dl' && <p role="status" className="pp-small pp-center">{s.note}</p>}
          </div>
        )}
      </section>

      {storeFailed && <p role="status" className="pp-warn">This browser isn’t letting Pattern Parrot keep your work. Private browsing can cause this.</p>}

      {s.overlay && (
        <Profile
          s={s}
          set={set}
          profile={profile}
          submitForm={submitForm}
          saveDetails={saveDetails}
          onPhoto={onPhoto}
          usePal={usePal}
        />
      )}

      {s.confirm && (
        <div className="pp-confirm-back">
          <div role="alertdialog" aria-label="Delete check" className="pp-confirm">
            <p className="pp-h-big pp-confirm-q">Are you sure you want to delete this?</p>
            <div className="pp-row8">
              <button className="pp-btn pp-half48" onClick={() => set({ confirm: null })}>Cancel</button>
              <button
                className="pp-btn pp-half48 pp-pink"
                onClick={() => {
                  const cf = s.confirm;
                  if (cf.kind === 'pattern') set({ patterns: s.patterns.filter((q) => q.id !== cf.id), confirm: null });
                  else set({ saved: s.saved.filter((_, i) => i !== cf.idx), confirm: null });
                }}
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
