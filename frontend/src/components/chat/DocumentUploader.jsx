import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { uploadDocument, getDocuments } from '../../services/api';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ACCEPTED = '.pdf,.txt,.md';

/* ── StatusBadge ─────────────────────────────────────────────────────────── */
function StatusBadge({ status, chunks }) {
  const cfg = {
    uploading: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: 'Uploading…' },
    success:   { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', label: `${chunks} chunks` },
    error:     { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Failed' },
  }[status] ?? null;

  if (!cfg) return null;

  return (
    <span style={{
      fontSize: 10, padding: '1px 6px', borderRadius: 10,
      background: cfg.bg, color: cfg.color, marginLeft: 4, flexShrink: 0,
    }}>
      {cfg.label}
    </span>
  );
}

/* ── DocumentUploader ────────────────────────────────────────────────────── */
export function DocumentUploader() {
  const [expanded, setExpanded] = useState(false);
  const [docs, setDocs] = useState([]);       // { name, chunks } from server
  const [uploads, setUploads] = useState([]); // in-flight uploads
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  /* Fetch indexed documents list */
  const refreshDocs = useCallback(async () => {
    try {
      const list = await getDocuments();
      setDocs(list);
    } catch {
      // silently ignore — backend may not have any docs yet
    }
  }, []);

  useEffect(() => {
    if (expanded) refreshDocs();
  }, [expanded, refreshDocs]);

  /* Handle file(s) chosen */
  const handleFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList).filter((f) => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ['pdf', 'txt', 'md'].includes(ext);
    });

    if (!files.length) return;
    setExpanded(true);

    for (const file of files) {
      const id = `${file.name}-${Date.now()}`;
      setUploads((prev) => [...prev, { id, name: file.name, size: file.size, status: 'uploading', progress: 0 }]);

      try {
        const result = await uploadDocument(file, (pct) => {
          setUploads((prev) =>
            prev.map((u) => (u.id === id ? { ...u, progress: pct } : u))
          );
        });
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: 'success', chunks: result.chunks_added } : u))
        );
        await refreshDocs();
      } catch (err) {
        const msg = err?.response?.data?.detail ?? err.message ?? 'Upload failed';
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: 'error', error: msg } : u))
        );
      }
    }
  }, [refreshDocs]);

  /* Drag & drop */
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = (e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };

  const recentUploads = uploads.slice(-5); // show last 5 to keep sidebar tidy

  return (
    <div style={{ borderTop: '0.5px solid #232323', paddingTop: 10 }}>
      {/* Section header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '2px 4px', color: '#8a8a8a', fontSize: 12, marginBottom: expanded ? 8 : 0,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <FileText size={13} />
          Documents
          {docs.length > 0 && (
            <span style={{
              background: 'rgba(212,255,79,0.15)', color: '#d4ff4f',
              fontSize: 10, padding: '0 5px', borderRadius: 8,
            }}>
              {docs.length}
            </span>
          )}
        </span>
        {expanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
      </button>

      {expanded && (
        <div>
          {/* Drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `1px dashed ${dragging ? '#d4ff4f' : '#333'}`,
              borderRadius: 8,
              padding: '10px 8px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: 10,
              background: dragging ? 'rgba(212,255,79,0.04)' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            <Upload size={14} style={{ color: dragging ? '#d4ff4f' : '#555', margin: '0 auto 4px' }} />
            <p style={{ fontSize: 11, color: '#8a8a8a', lineHeight: 1.4 }}>
              Drop PDF / TXT / MD<br />
              <span style={{ color: '#555' }}>or click to browse</span>
            </p>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED}
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* In-flight / recent uploads */}
          {recentUploads.map((u) => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 6px', borderRadius: 6, marginBottom: 3,
              background: '#0d0d0d', fontSize: 11,
            }}>
              {u.status === 'uploading' ? (
                <Loader size={11} style={{ color: '#60a5fa', flexShrink: 0, animation: 'spin 1s linear infinite' }} />
              ) : u.status === 'success' ? (
                <CheckCircle size={11} style={{ color: '#4ade80', flexShrink: 0 }} />
              ) : (
                <AlertCircle size={11} style={{ color: '#f87171', flexShrink: 0 }} />
              )}
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#d4d4d4' }}>
                {u.name}
              </span>
              <StatusBadge status={u.status} chunks={u.chunks} />
              {/* Upload progress bar */}
              {u.status === 'uploading' && (
                <div style={{ position: 'absolute', bottom: 0, left: 6, right: 6, height: 1, background: '#222' }}>
                  <div style={{ width: `${u.progress}%`, height: '100%', background: '#60a5fa', transition: 'width 0.2s' }} />
                </div>
              )}
            </div>
          ))}

          {/* Indexed documents list */}
          {docs.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 10, color: '#555', padding: '0 4px', marginBottom: 4 }}>INDEXED</p>
              {docs.map((doc) => (
                <div key={doc.name} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 6px', borderRadius: 5, marginBottom: 2,
                  fontSize: 11, color: '#7a7a7a',
                }}>
                  <FileText size={10} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.name}
                  </span>
                  <span style={{ color: '#4ade80', fontSize: 10 }}>{doc.chunks}c</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
