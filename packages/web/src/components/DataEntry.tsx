interface DataEntryProps {
  value: string;
  onChange: (v: string) => void;
  onExportCSV: () => void;
}

export default function DataEntry({ value, onChange, onExportCSV }: DataEntryProps) {
  return (
    <div className="panel" style={{ marginBottom: '1rem' }}>
      <div className="panel-header">
        <h2>Data Entry</h2>
        <button className="btn btn-sm" onClick={onExportCSV} title="Export input data as CSV">📄 CSV</button>
      </div>
      <textarea
        className="data-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Paste tab or comma-separated data:\nConcentration\\tResponse1\\tResponse2\\t...\n0.1\\t100\\t98\n1\\t85\\t82\n10\\t50\\t48\n100\\t12\\t10`}
        spellCheck={false}
      />
      <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', marginTop: '0.4rem' }}>
        Tab or comma-separated. Header row optional. Multiple response columns = replicates.
      </div>
    </div>
  );
}
