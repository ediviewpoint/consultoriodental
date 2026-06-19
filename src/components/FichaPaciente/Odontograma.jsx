import { useState, useEffect } from 'react';
import DC_DATA from '../data';
import { Icons } from '../icons';
import { Button } from '../ui';
import { getEstadoDental, upsertEstadoDental } from '../../lib/db';

// ── Paletas ───────────────────────────────────────────────────────────────────
const SURFACE_PAINTS = [
  { value: null,        label: 'Sana',     bg: '#ECFDF5', border: '#10B981', text: '#065F46' },
  { value: 'caries',   label: 'Caries',   bg: '#FEE2E2', border: '#DC2626', text: '#991B1B' },
  { value: 'resina',   label: 'Resina',   bg: '#DBEAFE', border: '#2563EB', text: '#1D4ED8' },
  { value: 'amalgama', label: 'Amalgama', bg: '#CBD5E1', border: '#475569', text: '#1E293B' },
  { value: 'sellante', label: 'Sellante', bg: '#EDE9FE', border: '#7C3AED', text: '#5B21B6' },
];

const GLOBAL_PAINTS = [
  { value: 'corona',     label: 'Corona',     bg: '#FEF3C7', border: '#D97706', text: '#92400E' },
  { value: 'extraccion', label: 'Extracción', bg: '#FEE2E2', border: '#B91C1C', text: '#7F1D1D' },
  { value: 'ausente',    label: 'Ausente',    bg: '#F1F5F9', border: '#94A3B8', text: '#475569' },
  { value: 'implante',   label: 'Implante',   bg: '#DCFCE7', border: '#059669', text: '#065F46' },
];

// Colores de relleno y borde por estado de superficie
const SC = {
  null:      { fill: '#F0FDF9', stroke: '#A7F3D0', sw: 1   },
  caries:    { fill: '#FEE2E2', stroke: '#DC2626', sw: 1   },
  resina:    { fill: '#DBEAFE', stroke: '#3B82F6', sw: 1   },
  amalgama:  { fill: '#CBD5E1', stroke: '#64748B', sw: 1   },
  sellante:  { fill: '#EDE9FE', stroke: '#8B5CF6', sw: 1   },
};

// Colores por estado global
const GC = {
  corona:     { fill: '#FEF3C7', stroke: '#D97706' },
  extraccion: { fill: '#FEE2E2', stroke: '#B91C1C' },
  ausente:    { fill: '#F1F5F9', stroke: '#94A3B8' },
  implante:   { fill: '#DCFCE7', stroke: '#059669' },
};

// Dientes anteriores (incisivos y caninos) usan "Incisal" en lugar de "Oclusal"
const ANTERIOR = new Set([11,12,13,21,22,23,31,32,33,41,42,43]);

const emptyTooth = () => ({ V: null, O: null, M: null, D: null, P: null, global: null });

// ── SVG de diente con 5 superficies ─────────────────────────────────────────
const W = 34, H = 38;
const x1 = 9, y1 = 11, x2 = 25, y2 = 27, mx = 17, my = 19;

const ToothSVG = ({ num, jaw, tooth, selected, editMode, onClick }) => {
  const t   = tooth || emptyTooth();
  const sc  = (s) => SC[t[s]] || SC[null];
  const g   = t.global ? GC[t.global] : null;

  const onSurf = (e, surf) => {
    e.stopPropagation();
    onClick(surf);
  };

  return (
    <div
      className={`tooth-wrap ${jaw} ${selected ? 'tooth-selected' : ''}`}
      onClick={() => onClick(null)}
      title={`Pieza ${num}${t.global ? ` — ${t.global}` : ''}`}
    >
      {jaw === 'upper' && <span className="tooth-num">{num}</span>}
      <svg
        width={W} height={H} viewBox={`0 0 ${W} ${H}`}
        style={{ cursor: editMode ? 'crosshair' : 'pointer', display: 'block', overflow: 'visible' }}
      >
        {g ? (
          // Estado global — diente completo
          <>
            <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx="3"
              fill={g.fill} stroke={g.stroke} strokeWidth="1.5" />
            {t.global === 'extraccion' && <>
              <line x1={x1 + 2} y1={y1 + 2} x2={x2 - 2} y2={y2 - 2} stroke={g.stroke} strokeWidth="2.5" strokeLinecap="round" />
              <line x1={x2 - 2} y1={y1 + 2} x2={x1 + 2} y2={y2 - 2} stroke={g.stroke} strokeWidth="2.5" strokeLinecap="round" />
            </>}
            {t.global === 'implante' && (
              <circle cx={mx} cy={my} r={4} fill={g.stroke} opacity="0.85" />
            )}
            {t.global === 'corona' && (
              <rect x={x1 + 2} y={y1 + 2} width={x2 - x1 - 4} height={y2 - y1 - 4} rx="2"
                fill="none" stroke={g.stroke} strokeWidth="1" opacity="0.5" />
            )}
          </>
        ) : (
          // 5 superficies independientes
          <>
            {/* Vestibular (arriba) */}
            <polygon points={`${x1},${y1} ${x2},${y1} ${mx},2`}
              fill={sc('V').fill} stroke={sc('V').stroke} strokeWidth={sc('V').sw}
              style={{ cursor: editMode ? 'crosshair' : 'pointer' }}
              onClick={(e) => onSurf(e, 'V')} />
            {/* Palatino/Lingual (abajo) */}
            <polygon points={`${x1},${y2} ${x2},${y2} ${mx},${H - 2}`}
              fill={sc('P').fill} stroke={sc('P').stroke} strokeWidth={sc('P').sw}
              style={{ cursor: editMode ? 'crosshair' : 'pointer' }}
              onClick={(e) => onSurf(e, 'P')} />
            {/* Mesial (izquierda) */}
            <polygon points={`${x1},${y1} ${x1},${y2} 2,${my}`}
              fill={sc('M').fill} stroke={sc('M').stroke} strokeWidth={sc('M').sw}
              style={{ cursor: editMode ? 'crosshair' : 'pointer' }}
              onClick={(e) => onSurf(e, 'M')} />
            {/* Distal (derecha) */}
            <polygon points={`${x2},${y1} ${x2},${y2} ${W - 2},${my}`}
              fill={sc('D').fill} stroke={sc('D').stroke} strokeWidth={sc('D').sw}
              style={{ cursor: editMode ? 'crosshair' : 'pointer' }}
              onClick={(e) => onSurf(e, 'D')} />
            {/* Oclusal / Incisal (centro) */}
            <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1}
              fill={sc('O').fill} stroke={sc('O').stroke} strokeWidth={1.5}
              style={{ cursor: editMode ? 'crosshair' : 'pointer' }}
              onClick={(e) => onSurf(e, 'O')} />
          </>
        )}
        {/* Contorno de selección */}
        {selected && (
          <rect x={0} y={0} width={W} height={H}
            fill="none" stroke="var(--dc-primary)" strokeWidth="2" strokeDasharray="3,2" rx="3" />
        )}
      </svg>
      {jaw === 'lower' && <span className="tooth-num">{num}</span>}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const Odontograma = ({ patientId }) => {
  const [selected, setSelected]       = useState(null);
  const [editMode, setEditMode]       = useState(false);
  const [toothStates, setToothStates] = useState({});
  const [savedStates, setSavedStates] = useState({});
  const [paintType, setPaintType]     = useState('surface');   // 'surface' | 'global'
  const [surfPaint, setSurfPaint]     = useState('caries');    // valor de superficie
  const [globPaint, setGlobPaint]     = useState('corona');    // estado global
  const [saving, setSaving]           = useState(false);

  const upper = DC_DATA.TEETH_FDI.slice(0, 16);
  const lower = DC_DATA.TEETH_FDI.slice(16);

  // Mapeo de formato antiguo (string simple) al nuevo (objeto con superficies)
  const legacyMap = {
    caries:    { ...emptyTooth(), O: 'caries' },
    crown:     { ...emptyTooth(), global: 'corona' },
    treatment: { ...emptyTooth(), O: 'resina' },
    extracted: { ...emptyTooth(), global: 'extraccion' },
    missing:   { ...emptyTooth(), global: 'ausente' },
  };

  useEffect(() => {
    getEstadoDental(patientId).then(raw => {
      const parsed = {};
      Object.entries(raw).forEach(([pieza, estado]) => {
        try {
          const obj = JSON.parse(estado);
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            parsed[Number(pieza)] = { ...emptyTooth(), ...obj };
            return;
          }
        } catch {}
        if (legacyMap[estado]) parsed[Number(pieza)] = { ...legacyMap[estado] };
      });
      setToothStates(parsed);
      setSavedStates(parsed);
    }).catch(console.error);
  }, [patientId]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPaint = (pieza, surface) => {
    if (!editMode) {
      setSelected(n => n === pieza ? null : pieza);
      return;
    }

    setToothStates(prev => {
      const cur  = { ...emptyTooth(), ...(prev[pieza] || {}) };
      let   next;

      if (paintType === 'global') {
        // Alternar estado global al clicar cualquier superficie o el diente
        const newGlobal = cur.global === globPaint ? null : globPaint;
        next = { ...emptyTooth(), global: newGlobal };
      } else if (surface) {
        // Pintar superficie específica; si el diente tiene estado global, limpiarlo
        const newVal = cur[surface] === surfPaint ? null : surfPaint;
        next = { ...cur, global: null, [surface]: newVal };
      } else {
        // Click en el cuerpo sin superficie específica → solo seleccionar
        setSelected(pieza);
        return prev;
      }

      const isEmpty = !next.global && !next.V && !next.O && !next.M && !next.D && !next.P;
      if (isEmpty) {
        const s = { ...prev };
        delete s[pieza];
        return s;
      }
      return { ...prev, [pieza]: next };
    });
    setSelected(pieza);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const allPiezas = new Set([
        ...Object.keys(toothStates).map(Number),
        ...Object.keys(savedStates).map(Number),
      ]);
      await Promise.all(Array.from(allPiezas).map(pieza => {
        const state = toothStates[pieza];
        return upsertEstadoDental(patientId, pieza, state ? JSON.stringify(state) : undefined);
      }));
      setSavedStates({ ...toothStates });
      setEditMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const selTooth = selected ? (toothStates[selected] || emptyTooth()) : null;
  const SURF_LABELS = { V: 'Vestibular', O: ANTERIOR.has(selected) ? 'Incisal' : 'Oclusal', M: 'Mesial', D: 'Distal', P: 'Palatino/Lingual' };

  const PaintBtn = ({ p, active, onClick }) => (
    <button onClick={onClick} style={{
      padding: '5px 13px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600,
      border: `2px solid ${active ? '#0D9488' : p.border}`,
      background: p.bg, color: p.text,
      boxShadow: active ? '0 0 0 2px rgba(13,148,136,0.25)' : 'none',
      transition: 'box-shadow 120ms, border-color 120ms',
    }}>{p.label}</button>
  );

  return (
    <div style={{ padding: 24 }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Odontograma</h3>
          <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginTop: 4 }}>
            Nomenclatura FDI · 5 superficies por pieza
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {editMode ? (
            <>
              <Button variant="secondary" size="sm"
                onClick={() => { setToothStates({ ...savedStates }); setEditMode(false); }}>
                Cancelar
              </Button>
              <Button size="sm" icon={Icons.Check} onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" icon={Icons.Edit} onClick={() => setEditMode(true)}>
              Editar odontograma
            </Button>
          )}
        </div>
      </div>

      {/* Paleta de pintura (solo en modo edición) */}
      {editMode && (
        <div style={{ background: 'var(--dc-slate-50)', border: '1px solid var(--dc-border)', borderRadius: 12, padding: '14px 18px', marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 8 }}>
                Superficies
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {SURFACE_PAINTS.map(p => (
                  <PaintBtn key={String(p.value)} p={p}
                    active={paintType === 'surface' && surfPaint === p.value}
                    onClick={() => { setPaintType('surface'); setSurfPaint(p.value); }} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 8 }}>
                Pieza completa
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {GLOBAL_PAINTS.map(p => (
                  <PaintBtn key={p.value} p={p}
                    active={paintType === 'global' && globPaint === p.value}
                    onClick={() => { setPaintType('global'); setGlobPaint(p.value); }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--dc-fg-3)' }}>
            {paintType === 'surface'
              ? `Modo superficie → clic en la zona del diente para pintar de "${SURFACE_PAINTS.find(p => p.value === surfPaint)?.label || 'Sana'}" · Clic repetido para borrar`
              : `Modo pieza completa → clic en cualquier diente para aplicar "${GLOBAL_PAINTS.find(p => p.value === globPaint)?.label}"`
            }
          </div>
        </div>
      )}

      {/* Odontograma */}
      <div className={`odontogram${editMode ? ' odo-edit-mode' : ''}`}>
        <div className="odo-jaw-label">Maxilar superior</div>
        <div className="odontogram-row upper">
          {upper.slice(0, 8).map(n => (
            <ToothSVG key={n} num={n} jaw="upper" tooth={toothStates[n]}
              selected={selected === n} editMode={editMode}
              onClick={(surf) => applyPaint(n, surf)} />
          ))}
          <div className="odo-gap" />
          {upper.slice(8).map(n => (
            <ToothSVG key={n} num={n} jaw="upper" tooth={toothStates[n]}
              selected={selected === n} editMode={editMode}
              onClick={(surf) => applyPaint(n, surf)} />
          ))}
        </div>

        <div className="odo-midline">
          <span className="odo-midline-line" />
          <span className="odo-midline-label">Línea media</span>
          <span className="odo-midline-line" />
        </div>

        <div className="odontogram-row lower">
          {lower.slice(0, 8).map(n => (
            <ToothSVG key={n} num={n} jaw="lower" tooth={toothStates[n]}
              selected={selected === n} editMode={editMode}
              onClick={(surf) => applyPaint(n, surf)} />
          ))}
          <div className="odo-gap" />
          {lower.slice(8).map(n => (
            <ToothSVG key={n} num={n} jaw="lower" tooth={toothStates[n]}
              selected={selected === n} editMode={editMode}
              onClick={(surf) => applyPaint(n, surf)} />
          ))}
        </div>
        <div className="odo-jaw-label" style={{ marginTop: 4 }}>Maxilar inferior</div>

        {/* Panel de pieza seleccionada */}
        {selected && selTooth && (
          <div className="odo-info-panel" style={{ marginTop: 16, flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span className="odo-info-num">Pieza {selected}</span>
            {selTooth.global ? (
              <span className="odo-info-badge" style={{
                background: GC[selTooth.global]?.fill || '#F1F5F9',
                color: GLOBAL_PAINTS.find(p => p.value === selTooth.global)?.text || '#475569',
                border: `1px solid ${GC[selTooth.global]?.stroke || '#94A3B8'}`,
              }}>
                {GLOBAL_PAINTS.find(p => p.value === selTooth.global)?.label || selTooth.global}
              </span>
            ) : (
              ['V', 'O', 'M', 'D', 'P'].map(s => {
                const st = selTooth[s];
                const p  = SURFACE_PAINTS.find(px => px.value === st) || SURFACE_PAINTS[0];
                return (
                  <span key={s} style={{
                    fontSize: 11, padding: '3px 9px', borderRadius: 5, fontWeight: 600,
                    background: p.bg, border: `1px solid ${p.border}`, color: p.text,
                  }}>
                    {s === 'O' ? SURF_LABELS.O : SURF_LABELS[s]?.split('/')[0]}: {p.label}
                  </span>
                );
              })
            )}
          </div>
        )}

        {/* Leyenda */}
        <div className="odo-legend" style={{ marginTop: 14, flexWrap: 'wrap' }}>
          {SURFACE_PAINTS.map(p => (
            <div key={String(p.value)} className="l">
              <div className="d" style={{ background: p.bg, border: `2px solid ${p.border}` }} />
              {p.label}
            </div>
          ))}
          <div style={{ width: 1, background: 'var(--dc-border)', margin: '0 4px', alignSelf: 'stretch' }} />
          {GLOBAL_PAINTS.map(p => (
            <div key={p.value} className="l">
              <div className="d" style={{
                background: p.bg, border: `2px solid ${p.border}`,
                ...(p.value === 'extraccion' ? { backgroundImage: 'repeating-linear-gradient(45deg,transparent 0 2px,rgba(185,28,28,0.35) 2px 4px)' } : {}),
              }} />
              {p.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Odontograma;
