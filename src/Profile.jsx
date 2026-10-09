import { useState } from 'react';
import { AVATARS } from './data.js';
import { Avatar, Icon, PatternView, avatarOf } from './parts.jsx';

const EYE_OPEN = 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 1 0 6a3 3 0 1 1 0-6z';
const EYE_SHUT = EYE_OPEN + 'M4 4l16 16';
const FOLDER = 'M2 6a3 3 0 0 1 3-3h10l4 4h16a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z';

function PasswordInput({ id, value, onChange, auto, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pp-pw">
      <input id={id} type={show ? 'text' : 'password'} autoComplete={auto} value={value} onChange={onChange} placeholder={placeholder} className="pp-input pp-input-pw" />
      <button type="button" className="pp-eye" aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} onClick={() => setShow(!show)}>
        <Icon d={show ? EYE_SHUT : EYE_OPEN} size={22} />
      </button>
    </div>
  );
}

function PicturePicker({ s, set, onPhoto }) {
  const ids = (s.photo ? ['photo'] : []).concat(AVATARS.map((a) => a[0]));
  const big = avatarOf(s.avatar, s.photo);
  return (
    <section aria-label="Profile picture" className="pp-sheet pp-picker">
      <div className="pp-big-avatar" style={{ background: big.bg }}>
        <Avatar av={big} alt="Your profile photo" />
      </div>
      <span className="pp-label">Pick a picture or add your own photo</span>
      <div className="pp-avatars">
        <label className="pp-photo-add">
          <input type="file" accept="image/*" onChange={onPhoto} aria-label="Upload a profile photo" />
          <Icon d="M4 8h3l2-3h6l2 3h3v11H4zM12 10.5a3 3 0 1 1 0 6a3 3 0 1 1 0-6z" size={22} />
          <span>Photo</span>
        </label>
        {ids.map((id) => {
          const av = avatarOf(id, s.photo);
          return (
            <button
              key={id}
              aria-label={id === 'photo' ? 'Use your photo' : `Use the ${id.toLowerCase()} picture`}
              aria-pressed={s.avatar === id}
              className="pp-avatar-btn"
              style={{ background: av.bg, border: s.avatar === id ? '3px solid #000' : '1px solid #000' }}
              onClick={() => set({ avatar: id })}
            >
              <Avatar av={av} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BackToProfile({ set }) {
  return <button className="pp-btn pp-back-small" onClick={() => set({ folder: '' })}>← My profile</button>;
}

function Details({ s, saveDetails }) {
  const [d, setD] = useState({ name: s.account.name, email: s.account.email, pw: '', pw2: '' });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const change = (k, max) => (e) => {
    setD({ ...d, [k]: e.target.value.slice(0, max) });
    setMsg('');
  };
  const save = async () => {
    const problem = await saveDetails(d);
    if (problem) {
      setErr(problem);
      setMsg('');
      return;
    }
    setErr('');
    setMsg(d.pw ? 'Saved — your details and password are updated.' : 'Saved — your details are updated.');
    setD({ ...d, pw: '', pw2: '' });
  };
  return (
    <section className="pp-sheet pp-form">
      <label htmlFor="pp-dname" className="pp-label">Your name</label>
      <input id="pp-dname" type="text" autoComplete="name" value={d.name} onChange={change('name', 40)} className="pp-input" />
      <label htmlFor="pp-demail" className="pp-label">Email</label>
      <input id="pp-demail" type="email" autoComplete="email" value={d.email} onChange={change('email', 80)} className="pp-input" />
      <span className="pp-label pp-mt6">Change password</span>
      <span className="pp-small pp-mt-8">Leave these empty to keep your current password.</span>
      <label htmlFor="pp-dpw" className="pp-label-light">New password</label>
      <PasswordInput id="pp-dpw" auto="new-password" value={d.pw} onChange={change('pw', 64)} placeholder="At least 8 characters" />
      <label htmlFor="pp-dpw2" className="pp-label-light">Type it again</label>
      <PasswordInput id="pp-dpw2" auto="new-password" value={d.pw2} onChange={change('pw2', 64)} />
      {err && <p role="alert" className="pp-error">{err}</p>}
      {msg && <p role="status" className="pp-ok">{msg}</p>}
      <button className="pp-btn pp-cta52" onClick={save}>Save changes</button>
    </section>
  );
}

export function Profile({ s, set, profile, submitForm, saveDetails, onPhoto, usePal }) {
  const mode = s.overlay;
  const isCreate = mode === 'create';
  const inAccount = mode === 'account' && profile;
  const folder = inAccount ? s.folder : '';
  const title = isCreate ? 'Create profile' : mode === 'signin' ? 'Welcome back' : `Hi, ${profile ? profile.name.toUpperCase() : ''}!`;
  const sub = isCreate
    ? 'Make a profile to save your patterns and swatches.'
    : mode === 'signin'
      ? 'Sign in to pick up where you left off.'
      : 'Your patterns, palettes and account, all in one place!';
  const close = () => set({ overlay: '', formErr: '', folder: '', pending: null });

  const renamePattern = (id, v) => set({ patterns: s.patterns.map((q) => (q.id === id ? { ...q, name: v } : q)) });
  const finishPattern = (id) =>
    set({ renaming: null, patterns: s.patterns.map((q) => (q.id === id ? { ...q, name: (q.name || '').trim() || 'My pattern' } : q)) });
  const renameSwatch = (i, v) => set({ saved: s.saved.map((x, j) => (j === i ? { ...x, name: v } : x)) });
  const finishSwatch = (i) =>
    set({ renamingSw: null, saved: s.saved.map((x, j) => (j === i ? { ...x, name: (x.name || '').trim() || 'My palette' } : x)) });

  return (
    <div role="dialog" aria-label={title} className="pp-overlay">
      <div className="pp-between pp-none">
        <button className="pp-btn pp-back" onClick={close}>
          <Icon d="M19 12H5M11 6l-6 6 6 6" size={16} sw={2.2} />
          Back to Studio
        </button>
        <span className="pp-logo pp-logo-sm">PATTERN<br />PARROT</span>
      </div>

      {!folder && (
        <div className="pp-col6 pp-none">
          <h1 className="pp-h1" style={{ textTransform: inAccount ? 'none' : 'uppercase' }}>{title}</h1>
          <p className="pp-body">{sub}</p>
        </div>
      )}

      {folder === 'details' && (
        <div className="pp-col10 pp-none">
          <BackToProfile set={set} />
          <h1 className="pp-h1 pp-h1-big">Account details</h1>
        </div>
      )}

      {(isCreate || folder === 'details') && <PicturePicker s={s} set={set} onPhoto={onPhoto} />}

      {!inAccount && (
        <section className="pp-sheet pp-form">
          {isCreate && (
            <>
              <label htmlFor="pp-name" className="pp-label">Your name</label>
              <input id="pp-name" type="text" autoComplete="name" value={s.fName} onChange={(e) => set({ fName: e.target.value.slice(0, 40) })} placeholder="e.g. Catherine" className="pp-input" />
            </>
          )}
          <label htmlFor="pp-email" className="pp-label">Email</label>
          <input id="pp-email" type="email" autoComplete="email" value={s.fEmail} onChange={(e) => set({ fEmail: e.target.value.slice(0, 80) })} placeholder="you@example.com" className="pp-input" />
          <label htmlFor="pp-pw" className="pp-label">Password</label>
          <PasswordInput
            id="pp-pw"
            auto={isCreate ? 'new-password' : 'current-password'}
            value={s.fPw}
            onChange={(e) => set({ fPw: e.target.value.slice(0, 64) })}
            placeholder="At least 8 characters"
          />
          {s.formErr && <p role="alert" className="pp-error">{s.formErr}</p>}
          <button className="pp-btn pp-cta52" onClick={submitForm}>{isCreate ? 'Create profile' : 'Sign in'}</button>
          <button className="pp-link" onClick={() => set({ overlay: isCreate ? 'signin' : 'create', formErr: '' })}>
            {isCreate ? 'Already have a profile? Sign in' : 'New here? Make a profile'}
          </button>
          <p className="pp-small pp-center">Your profile is kept on this device and browser.</p>
        </section>
      )}

      {inAccount && !folder && (
        <>
          <div className="pp-home-grid pp-none">
            <button className="pp-btn pp-folder" style={{ background: '#FFF001' }} onClick={() => set({ folder: 'patterns' })}>
              <svg width="40" height="34" viewBox="0 0 40 34" aria-hidden="true"><path d={FOLDER} fill="#fff" stroke="#000" strokeWidth="1.5" /><path d="M10 14h5v5h-5zM18 14h5v5h-5zM26 14h5v5h-5zM10 22h5v5h-5zM18 22h5v5h-5zM26 22h5v5h-5z" fill="#FF1493" /></svg>
              <span className="pp-folder-text">
                <span className="pp-folder-title">My patterns</span>
                <span>{s.patterns.length} {s.patterns.length === 1 ? 'pattern' : 'patterns'}</span>
              </span>
            </button>
            <button className="pp-btn pp-folder" style={{ background: '#FF1493', color: '#fff' }} onClick={() => set({ folder: 'swatches' })}>
              <svg width="40" height="34" viewBox="0 0 40 34" aria-hidden="true"><path d={FOLDER} fill="#fff" stroke="#000" strokeWidth="1.5" /><path d="M9 14h5v13H9z" fill="#252561" /><path d="M15 14h5v13h-5z" fill="#158ACF" /><path d="M21 14h5v13h-5z" fill="#8FC21F" /><path d="M27 14h5v13h-5z" fill="#FFF001" /></svg>
              <span className="pp-folder-text">
                <span className="pp-folder-title">My swatches</span>
                <span>{s.saved.length} {s.saved.length === 1 ? 'palette' : 'palettes'}</span>
              </span>
            </button>
            <button className="pp-btn pp-folder pp-folder-wide" style={{ background: '#158ACF' }} onClick={() => set({ folder: 'mockups' })}>
              <svg width="40" height="34" viewBox="0 0 40 34" aria-hidden="true"><path d={FOLDER} fill="#fff" stroke="#000" strokeWidth="1.5" /><path d="M13 13h14v14H13z" fill="none" stroke="#252561" strokeWidth="2" /><path d="M16 16h8v8h-8z" fill="#FFF001" /></svg>
              <span className="pp-folder-text">
                <span className="pp-folder-title">Mock ups</span>
                <span>0 mock ups</span>
              </span>
            </button>
          </div>
          <button className="pp-btn pp-account-row" onClick={() => set({ folder: 'details' })}>
            <span className="pp-account-pic" style={{ background: avatarOf(s.avatar, s.photo).bg }}>
              <Avatar av={avatarOf(s.avatar, s.photo)} />
            </span>
            <span className="pp-account-text">
              <span className="pp-account-title">Account details</span>
              <span className="pp-small">Picture, name, email and password</span>
            </span>
            <Icon d="M9 6l6 6-6 6" size={18} sw={2.2} />
          </button>
          <button className="pp-btn pp-cta52 pp-none" onClick={close}>Start making patterns</button>
          <button className="pp-btn pp-cta48 pp-none" onClick={() => set({ signedIn: false, overlay: 'signin', fPw: '', fEmail: s.account ? s.account.email : '', formErr: '', folder: '' })}>
            Sign out
          </button>
        </>
      )}

      {folder === 'patterns' && (
        <>
          <div className="pp-col10 pp-none">
            <BackToProfile set={set} />
            <h1 className="pp-h1 pp-h1-big">My patterns</h1>
            <p className="pp-body pp-14">Tap a pattern to open it in the studio.</p>
          </div>
          {s.patterns.length === 0 && (
            <div className="pp-empty">
              <p className="pp-bold">No patterns yet!</p>
              <div className="pp-wrap6 pp-center-items">
                <span>Tap</span>
                <span className="pp-fake-btn">SAVE</span>
                <span>in the studio, then</span>
                <span className="pp-fake-btn pp-fake-dark">Save to MY PATTERNS</span>
              </div>
            </div>
          )}
          <div className="pp-grid3 pp-gap8 pp-none">
            {s.patterns.map((p, i) => (
              <div key={p.id} className="pp-thumb-card">
                <button
                  aria-label={'Open ' + p.name}
                  className="pp-thumb"
                  style={{ background: p.cfg.bg }}
                  onClick={() => {
                    const c = JSON.parse(JSON.stringify(p.cfg));
                    set({ ...c, drafts: c.pal.slice(), overlay: '', folder: '', mode: 'Default', note: '', tool: 'layout' });
                  }}
                >
                  <PatternView cfg={p.cfg} tiles={1} />
                </button>
                {s.renaming === p.id ? (
                  <div className="pp-col4">
                    <label htmlFor={'pn-' + i} className="pp-sr">Pattern name</label>
                    <input id={'pn-' + i} type="text" value={p.name} maxLength={30} onChange={(e) => renamePattern(p.id, e.target.value.slice(0, 30))} className="pp-input-sm" />
                    <button className="pp-btn pp-done-sm" onClick={() => finishPattern(p.id)}>Done</button>
                  </div>
                ) : (
                  <>
                    <span className="pp-thumb-name">{p.name}</span>
                    <div className="pp-between">
                      <button className="pp-btn pp-icon30" aria-label={'Rename ' + p.name} onClick={() => set({ renaming: p.id })}>
                        <Icon d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" size={14} sw={2.2} />
                      </button>
                      <button className="pp-btn pp-icon30" aria-label={'Remove ' + p.name} onClick={() => set({ confirm: { kind: 'pattern', id: p.id } })}>
                        <Icon d="M6 6l12 12M18 6L6 18" size={14} sw={2.4} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {folder === 'swatches' && (
        <>
          <div className="pp-col10 pp-none">
            <BackToProfile set={set} />
            <h1 className="pp-h1 pp-h1-big">My swatches</h1>
            <p className="pp-body pp-14">Palettes you’ve saved. Tap <strong>Use</strong> to color your pattern with one, or <strong>×</strong> to delete.</p>
          </div>
          {s.saved.length === 0 && (
            <p className="pp-empty">
              No palettes yet. In the studio, open <strong>Colors</strong>, tap <strong>My Palettes</strong>, name your colors and tap <strong>Save palette</strong>.
            </p>
          )}
          <div className="pp-col8 pp-none">
            {s.saved.map((sw, i) => (
              <div key={i} className="pp-card">
                {s.renamingSw === i ? (
                  <div className="pp-row6 pp-center-items">
                    <label htmlFor={'sw-' + i} className="pp-sr">Palette name</label>
                    <input id={'sw-' + i} type="text" value={sw.name} maxLength={32} onChange={(e) => renameSwatch(i, e.target.value.slice(0, 32))} className="pp-input pp-input-36" />
                    <button className="pp-btn pp-done" onClick={() => finishSwatch(i)}>Done</button>
                  </div>
                ) : (
                  <div className="pp-between pp-center-items">
                    <span className="pp-sw-name">{sw.name}</span>
                    <div className="pp-row6">
                      <button className="pp-btn pp-icon36" aria-label={'Rename ' + sw.name} onClick={() => set({ renamingSw: i })}>
                        <Icon d="M4 20h4L19 9l-4-4L4 16z" size={14} sw={2.2} />
                      </button>
                      <button
                        className="pp-btn pp-use"
                        aria-label={'Use ' + sw.name}
                        onClick={() => usePal(sw.pal, { overlay: '', folder: '', tool: 'colours', mode: 'My Palettes', pname: sw.name, page: '' })}
                      >
                        Use
                      </button>
                      <button className="pp-btn pp-icon36" aria-label={'Remove ' + sw.name} onClick={() => set({ confirm: { kind: 'swatch', idx: i } })}>
                        <Icon d="M6 6l12 12M18 6L6 18" size={14} sw={2.4} />
                      </button>
                    </div>
                  </div>
                )}
                <div className="pp-chips">
                  {sw.pal.map((c, j) => <span key={j} style={{ background: '#' + c }} />)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {folder === 'mockups' && (
        <>
          <div className="pp-col10 pp-none">
            <BackToProfile set={set} />
            <h1 className="pp-h1 pp-h1-big">Mock ups</h1>
          </div>
          <p className="pp-empty">No mock ups yet. [How mock ups are made and saved here — to follow]</p>
        </>
      )}

      {folder === 'details' && <Details s={s} saveDetails={saveDetails} />}
    </div>
  );
}
