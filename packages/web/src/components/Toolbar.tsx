interface ToolbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onFitCurve: () => void;
  onExportCSV: () => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  hasResults: boolean;
}

export default function Toolbar({
  theme,
  onToggleTheme,
  onFitCurve,
  onExportCSV,
  onExportPNG,
  onExportSVG,
  hasResults,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <h1>
        <span>Dose</span>Curve
      </h1>
      <button className="btn btn-primary" onClick={onFitCurve}>
        ▶ Fit Curve
      </button>
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
      <button className="btn" onClick={onToggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
}
