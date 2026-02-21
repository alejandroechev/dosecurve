/** Parsed data point: one concentration with its response values */
export interface DataPoint {
  concentration: number;
  responses: number[];
}

/** Summary statistics for one concentration level */
export interface DataSummary {
  concentration: number;
  mean: number;
  sem: number;
  n: number;
}

/**
 * Parse tab/comma-separated concentration-response text.
 * Supports:
 *  - Two columns: concentration \t response (one per row, replicates share concentration)
 *  - Multi-column: concentration \t rep1 \t rep2 ...
 */
export function parseData(text: string): DataPoint[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) throw new Error('No data provided');

  // Detect if first row is a header (first cell is not a number)
  const firstCell = lines[0].split(/[\t,]/)[0].trim();
  const startIdx = isNaN(Number(firstCell)) ? 1 : 0;

  const map = new Map<number, number[]>();

  for (let i = startIdx; i < lines.length; i++) {
    const cells = lines[i].split(/[\t,]/).map((c) => c.trim());
    if (cells.length < 2) continue;
    const conc = Number(cells[0]);
    if (isNaN(conc) || conc <= 0) continue;

    for (let j = 1; j < cells.length; j++) {
      const val = Number(cells[j]);
      if (isNaN(val)) continue;
      if (!map.has(conc)) map.set(conc, []);
      map.get(conc)!.push(val);
    }
  }

  if (map.size === 0) throw new Error('No valid data points found');

  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([concentration, responses]) => ({ concentration, responses }));
}

/** Compute mean and SEM for each concentration */
export function summarize(points: DataPoint[]): DataSummary[] {
  return points.map(({ concentration, responses }) => {
    const n = responses.length;
    const mean = responses.reduce((a, b) => a + b, 0) / n;
    const variance =
      n > 1
        ? responses.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1)
        : 0;
    const sem = n > 1 ? Math.sqrt(variance / n) : 0;
    return { concentration, mean, sem, n };
  });
}
