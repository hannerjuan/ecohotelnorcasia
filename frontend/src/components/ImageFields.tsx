import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { errorMessage, uploadImages } from '../lib/api';

function useUpload(onDone: (urls: string[]) => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError('');
    try {
      onDone(await uploadImages(files));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, upload };
}

export function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const { busy, error, upload } = useUpload((urls) => onChange(urls[0]));
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <input className="input" placeholder="URL de la imagen o súbela" value={value} onChange={(e) => onChange(e.target.value)} />
        <button type="button" onClick={() => input.current?.click()} className="btn-outline shrink-0 px-4" disabled={busy}>
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
        </button>
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files)} />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {value && <img src={value} alt="" className="mt-3 h-32 w-full rounded-xl object-cover" />}
    </div>
  );
}

export function GalleryField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const { busy, error, upload } = useUpload((urls) => onChange([...value, ...urls]));
  return (
    <div>
      <label className="label">Galería</label>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {value.map((src, i) => (
          <div key={src + i} className="group relative h-20 overflow-hidden rounded-xl">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Quitar imagen"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="flex h-20 items-center justify-center rounded-xl border-2 border-dashed border-olive/30 text-olive hover:bg-cream"
        >
          {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        </button>
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
      <div className="mt-2 flex gap-2">
        <input className="input py-2 text-sm" placeholder="O pega una URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button
          type="button"
          className="btn-outline px-4 py-2 text-sm"
          onClick={() => {
            if (url.trim()) onChange([...value, url.trim()]);
            setUrl('');
          }}
        >
          Agregar
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export const splitList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
