import { useMemo } from 'react';
import { ALL_SHAPES, AVATARS } from './data.js';
import { patternSvg } from './pattern.js';

export function avatarOf(id, photo) {
  if (id === 'photo' && photo) return { isPhoto: true, photo, bg: '#fff' };
  const a = AVATARS.find((x) => x[0] === id);
  if (!a) return { isShape: false, isPhoto: false, bg: '#fff' };
  const s = ALL_SHAPES.find((x) => x.name === a[0]);
  const k = a[3] || 0.62;
  return {
    isShape: true, bg: a[1], d: s.d, rule: s.rule,
    fill: s.mode === 'fill' ? a[2] : 'none', stroke: s.mode === 'stroke' ? a[2] : 'none',
    tf: `translate(20 20) scale(${k}) translate(-20 -20)`,
  };
}

export function Avatar({ av, alt = '' }) {
  if (av.isPhoto) return <img src={av.photo} alt={alt} className="pp-fill-img" />;
  if (!av.isShape) return null;
  return (
    <svg viewBox="0 0 40 40" className="pp-fill-svg" aria-hidden="true">
      <path d={av.d} fill={av.fill} stroke={av.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fillRule={av.rule} transform={av.tf} />
    </svg>
  );
}

export function PatternView({ cfg, tiles }) {
  const svg = useMemo(() => patternSvg(cfg, tiles), [cfg, tiles]);
  return <div className="pp-svg" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function Icon({ d, size = 20, sw = 2, color = '#000' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
