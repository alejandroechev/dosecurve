import { useState, useCallback, useRef } from 'react';
import {
  parseData,
  summarize,
  fit4PL,
  computeCI,
  computeGoodnessOfFit,
  generateCurvePoints,
  buildResults,
  exportResultsCSV,
  type DataSummary,
  type AnalysisResults,
  type CurvePoint,
  type GoodnessOfFit,
  type FitParams,
} from '@dosecurve/engine';
import DataEntry from './components/DataEntry.tsx';
import DoseResponseChart from './components/DoseResponseChart.tsx';
import ResultsPanel from './components/ResultsPanel.tsx';
import Toolbar from './components/Toolbar.tsx';
import { SAMPLES } from './samples/index.ts';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [rawData, setRawData] = useState(SAMPLES[0].data);
  const [summary, setSummary] = useState<DataSummary[] | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [curvePoints, setCurvePoints] = useState<CurvePoint[] | null>(null);
  const [fitParams, setFitParams] = useState<FitParams | null>(null);
  const [gof, setGof] = useState<GoodnessOfFit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const runFit = useCallback(() => {
    try {
      setError(null);
      const points = parseData(rawData);
      const summaryData = summarize(points);
      setSummary(summaryData);

      const concentrations = summaryData.map((s) => s.concentration);
      const responses = summaryData.map((s) => s.mean);

      const fitResult = fit4PL(concentrations, responses);
      const ci = computeCI(concentrations, fitResult.params, fitResult.ssRes);
      const goodnessOfFit = computeGoodnessOfFit(concentrations, responses, fitResult);
      const analysisResults = buildResults(fitResult, ci);

      const xMin = Math.min(...concentrations) / 3;
      const xMax = Math.max(...concentrations) * 3;
      const curve = generateCurvePoints(fitResult.params, xMin, xMax, 200);

      setFitParams(fitResult.params);
      setResults(analysisResults);
      setCurvePoints(curve);
      setGof(goodnessOfFit);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setResults(null);
      setCurvePoints(null);
    }
  }, [rawData]);

  const handleExportCSV = useCallback(() => {
    if (!results || !summary || !curvePoints) return;
    const csv = exportResultsCSV(results, summary, curvePoints);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dosecurve-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [results, summary, curvePoints]);

  const loadSample = useCallback((index: number) => {
    setRawData(SAMPLES[index].data);
    setSummary(null);
    setResults(null);
    setCurvePoints(null);
    setFitParams(null);
    setGof(null);
    setError(null);
  }, []);

  const handleExportChart = useCallback((format: 'png' | 'svg') => {
    if (!chartRef.current) return;
    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;

    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dosecurve-chart.svg';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // PNG export
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dosecurve-chart.png';
        a.click();
        URL.revokeObjectURL(url);
      });
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, []);

  return (
    <div className="app" data-theme={theme}>
      <Toolbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onFitCurve={runFit}
        onExportCSV={handleExportCSV}
        onExportPNG={() => handleExportChart('png')}
        onExportSVG={() => handleExportChart('svg')}
        hasResults={!!results}
        samples={SAMPLES}
        onLoadSample={loadSample}
      />

      {error && (
        <div style={{ color: 'var(--error)', padding: '0.5rem', fontSize: '0.85rem' }}>
          ⚠ {error}
        </div>
      )}

      <div className="main-grid">
        <div>
          <DataEntry value={rawData} onChange={setRawData} />
          {results && <ResultsPanel results={results} gof={gof} />}
        </div>
        <div className="right-col">
          <div className="panel" ref={chartRef}>
            <h2>Dose-Response Curve</h2>
            {summary && curvePoints && fitParams ? (
              <DoseResponseChart
                summary={summary}
                curvePoints={curvePoints}
                ic50={fitParams.ic50}
                params={fitParams}
              />
            ) : (
              <div className="status-msg">
                Paste data and click <strong>Fit Curve</strong> to begin
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
