"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import styles from "./PhotoCapture.module.css";

/** Camera/file picker with thumbnails. Reports the selected files upward. */
export function PhotoCapture({
  title,
  hint,
  onChange,
}: {
  title: string;
  hint: string;
  onChange: (files: File[]) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const next = files.map((f) => URL.createObjectURL(f));
    setUrls(next);
    return () => next.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const update = (next: File[]) => {
    setFiles(next);
    onChange(next);
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className={styles.input}
        onChange={(e) => {
          update([...files, ...Array.from(e.target.files ?? [])]);
          e.target.value = "";
        }}
      />
      {urls.length > 0 && (
        <div className={styles.thumbs}>
          {urls.map((u, i) => (
            <div key={u} className={styles.thumb}>
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              <img src={u} alt={`Foto ${i + 1}`} />
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remover foto ${i + 1}`}
                onClick={() => update(files.filter((_, j) => j !== i))}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}
      <label htmlFor={inputId} className={"tap " + styles.drop}>
        <div className={styles.dropIcon}>
          <Camera size={20} strokeWidth={1.8} />
        </div>
        <div className={styles.dropTitle}>{files.length ? "Adicionar outra foto" : title}</div>
        <div className={styles.dropHint}>{files.length ? `${files.length} foto(s) anexada(s)` : hint}</div>
      </label>
    </div>
  );
}
