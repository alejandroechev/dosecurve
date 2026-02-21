import { describe, it, expect } from 'vitest';
import { fourPL, fit4PL, FitParams } from '../fit.js';
import { computeCI } from '../confidence.js';
import { summarize } from '../parser.js';
import { generateCurvePoints, exportResultsCSV, buildResults } from '../export.js';

const knownParams: FitParams = { top: 100, bottom: 0, ic50: 10, hillSlope: 1 };
const concentrations = [0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000];

describe('generateCurvePoints', () => {
  it('generates correct number of points', () => {
    const pts = generateCurvePoints(knownParams, 0.1, 1000, 50);
    expect(pts).toHaveLength(50);
    expect(pts[0].x).toBeCloseTo(0.1, 1);
    expect(pts[49].x).toBeCloseTo(1000, 0);
  });

  it('curve is monotonically decreasing for positive hill slope', () => {
    const pts = generateCurvePoints(knownParams, 0.1, 1000, 100);
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].y).toBeLessThanOrEqual(pts[i - 1].y + 0.01);
    }
  });
});

describe('exportResultsCSV', () => {
  it('produces valid CSV with all sections', () => {
    const responses = concentrations.map(
      (x, i) => fourPL(x, knownParams) + (i % 2 === 0 ? 1 : -1),
    );
    const fit = fit4PL(concentrations, responses);
    const ci = computeCI(concentrations, fit.params, fit.ssRes);
    const results = buildResults(fit, ci);
    const summary = summarize(
      concentrations.map((c, i) => ({ concentration: c, responses: [responses[i]] })),
    );
    const curve = generateCurvePoints(fit.params, 0.1, 1000, 10);
    const csv = exportResultsCSV(results, summary, curve);

    expect(csv).toContain('IC50');
    expect(csv).toContain('Hill Slope');
    expect(csv).toContain('R²');
    expect(csv).toContain('Fitted X');
    expect(csv.split('\n').length).toBeGreaterThan(15);
  });
});

describe('buildResults', () => {
  it('assembles results correctly', () => {
    const responses = concentrations.map((x) => fourPL(x, knownParams));
    const fit = fit4PL(concentrations, responses);
    const ci = computeCI(concentrations, fit.params, fit.ssRes);
    const results = buildResults(fit, ci);

    expect(results.ic50).toBeCloseTo(10, 0);
    expect(results.rSquared).toBeCloseTo(1, 3);
    expect(results.converged).toBe(true);
    expect(results.hillSlope).toBeCloseTo(1, 1);
  });
});
