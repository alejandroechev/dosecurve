import { useState, useRef, useEffect } from 'react';
import type { SampleDataset } from '../samples/index.ts';

interface ToolbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onFitCurve: () => void;
  onExportCSV: () => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  hasResults: boolean;
  samples: SampleDataset[];
  onLoadSample: (index: number) => void;
}

export default function Toolbar({
  theme,
  onToggleTheme,
  onFitCurve,
  onExportCSV,
  onExportPNG,
  onExportSVG,
  hasResults,
  samples,
  onLoadSample,
}: ToolbarProps) {
  const [samplesOpen, setSamplesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      <button className="btn btn-primary" onClick={onFitCurve}>
        ▶ Fit Curve
      </button>
      <div className="dropdown" ref={dropdownRef}>
        <button className="btn" onClick={() => setSamplesOpen(!samplesOpen)}>
          📂 Samples ▾
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
      {hasResults && (
        <>
          <button className="btn" onClick={onExportCSV}>
            📄 CSV
          </button>
          <button className="btn" onClick={onExportPNG}>
            🖼 PNG
          </button>
          <button className="btn" onClick={onExportSVG}>
            📐 SVG
          </button>
        </>
      )}
      <button className="btn" onClick={() => window.open('/intro.html', '_blank')}>
        📖 Guide
      </button>
      <button className="btn" onClick={() => window.open('https://github.com/alejandroechev/dosecurve/issues/new', '_blank')} title="Feedback">
        💬 Feedback
      </button>
      <button className="btn" onClick={onToggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
}
