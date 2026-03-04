import { useState, useRef, useEffect } from 'react';
import type { SampleDataset } from '../samples/index.ts';

interface ToolbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onFitCurve: () => void;
  onFileUpload: (content: string) => void;
  samples: SampleDataset[];
  onLoadSample: (index: number) => void;
}

export default function Toolbar({
  theme,
  onToggleTheme,
  onFitCurve,
  onFileUpload,
  samples,
  onLoadSample,
}: ToolbarProps) {
  const [samplesOpen, setSamplesOpen] = useState(false);
  const dropdownRef= useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSamplesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="toolbar">
      <h1>
        <span>Dose</span>Curve
      </h1>
      <div className="toolbar-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.txt"
          className="file-input-hidden"
          data-testid="file-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => onFileUpload(reader.result as string);
            reader.readAsText(file);
            e.target.value = '';
          }}
        />
        <button className="btn" onClick={() => fileInputRef.current?.click()}>
          📂 Upload
        </button>
        <div className="dropdown" ref={dropdownRef}>
          <button className="btn" onClick={() => setSamplesOpen(!samplesOpen)}>
            🧪 Samples ▾
          </button>
          {samplesOpen && (
            <div className="dropdown-menu">
              {samples.map((s, i) => (
                <button
                  key={i}
                  className="dropdown-item"
                  onClick={() => { onLoadSample(i); setSamplesOpen(false); }}
                  title={s.description}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="btn btn-primary" onClick={onFitCurve}>
          ▶ Fit Curve
        </button>
      </div>
      <div className="toolbar-spacer" />
      <div className="toolbar-utils">
        <button className="btn" onClick={() => window.open('/intro.html', '_blank')}>
          📖 Guide
        </button>
        <a href="https://github.com/alejandroechev/dosecurve/issues" target="_blank" rel="noopener noreferrer" className="github-link">💬 Feedback</a>
        <a className="github-link" href="https://github.com/alejandroechev/dosecurve" target="_blank" rel="noopener noreferrer">GitHub</a>
        <button className="btn" onClick={onToggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  );
}
