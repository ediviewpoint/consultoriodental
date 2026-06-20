import { useState, useEffect, useRef } from 'react';
import { Icons } from '../icons';
import { Button, Badge } from '../ui';
import { getImagenes, createImagen, getConsentimientos, createConsentimiento, updateConsentimientoFirmado } from '../../lib/db';
import { uploadToCloudinary } from '../../lib/cloudinary';

const Archivos = ({ patientId }) => {
  const [images, setImages]         = useState([]);
  const [docs,   setDocs]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const imgRef = useRef(null);
  const docRef = useRef(null);

  useEffect(() => {
    Promise.all([getImagenes(patientId), getConsentimientos(patientId)])
      .then(([imgs, conss]) => { setImages(imgs); setDocs(conss); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';
    setUploading(true);
    for (const f of files) {
      try {
        const url = await uploadToCloudinary(f, `dental/${patientId}`);
        const saved = await createImagen(patientId, { descripcion: f.name.replace(/\.[^.]+$/, ''), tipo: 'clinica', url });
        if (saved) setImages(prev => [saved, ...prev]);
      } catch (err) { console.error(err); }
    }
    setUploading(false);
  };

  const handleDocUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';
    for (const f of files) {
      const doc = { documento: f.name.replace(/\.[^.]+$/, '') };
      try {
        await createConsentimiento(patientId, doc);
        setDocs(prev => [...prev, { documento: doc.documento, fecha: new Date().toLocaleDateString('es-BO'), firmado: false }]);
      } catch (err) { console.error(err); }
    }
  };

  const toggleFirmado = async (c, i) => {
    if (!c._id) return;
    try {
      await updateConsentimientoFirmado(c._id, !c.firmado);
      setDocs(prev => prev.map((d, idx) => idx === i ? { ...d, firmado: !d.firmado } : d));
    } catch (err) { console.error(err); }
  };

  const handleDownload = (doc) => {
    const blob = new Blob([`Documento: ${doc.documento}\nFecha: ${doc.fecha || '—'}\nEstado: ${doc.firmado ? 'Firmado' : 'Pendiente'}\n\nDentalCare Pro · Santa Cruz, Bolivia`], { type: 'text/plain' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${doc.documento}.txt` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Archivos del paciente</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input ref={imgRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
          <Button variant="secondary" size="sm" icon={Icons.Plus} onClick={() => imgRef.current.click()} disabled={uploading}>
            {uploading ? 'Subiendo…' : 'Subir imagen'}
          </Button>
          <input ref={docRef} type="file" accept=".pdf,.doc,.docx" multiple style={{ display: 'none' }} onChange={handleDocUpload} />
          <Button variant="secondary" size="sm" icon={Icons.Plus} onClick={() => docRef.current.click()}>Nuevo documento</Button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--dc-fg-3)', fontSize: 13 }}>Cargando archivos…</div>
      ) : (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', marginBottom: 12 }}>Imágenes clínicas</div>
          {images.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--dc-fg-3)', marginBottom: 20 }}>Sin imágenes registradas.</div>
          ) : (
            <div className="img-grid">
              {images.map((im, i) => (
                <div key={im._id || i} className="img-card">
                  <div className={`img-thumb ${im.tipo === 'rx' ? 'rx' : ''}`}>
                    {im.url ? <img src={im.url} alt={im.descripcion} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icons.Image size={36} />}
                  </div>
                  <div className="img-meta"><div className="img-desc">{im.descripcion}</div><div className="img-date">{im.fecha}</div></div>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dc-fg-3)', margin: '24px 0 12px' }}>Consentimientos firmados</div>
          {docs.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--dc-fg-3)' }}>Sin consentimientos registrados.</div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid var(--dc-border)', borderRadius: 12 }}>
              {docs.map((c, i) => (
                <div key={c._id || i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < docs.length - 1 ? '1px solid var(--dc-divider)' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--dc-teal-50)', color: 'var(--dc-teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.FileText size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.documento}</div>
                    <div style={{ fontSize: 12, color: 'var(--dc-fg-3)', marginTop: 2 }}>{c.firmado ? `Firmado el ${c.fecha}` : 'Pendiente de firma'}</div>
                  </div>
                  <button onClick={() => toggleFirmado(c, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {c.firmado ? <Badge status="paid">✓ FIRMADO</Badge> : <Badge status="pendiente" />}
                  </button>
                  <Button variant="ghost" size="sm" icon={Icons.Download} onClick={() => handleDownload(c)}>Descargar</Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Archivos;
