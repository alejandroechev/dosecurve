# DoseCurve — Dose-Response / IC50 Calculator

## Mission
Replace GraphPad Prism's dose-response workflow ($142–$1,040/yr) with a free web tool for IC50 analysis.

## Architecture
- `packages/engine/` — 4PL curve fitting (Levenberg-Marquardt), IC50, Hill slope, confidence intervals
- `packages/web/` — React + Vite, dose-response chart (log-x), data entry table
- `packages/cli/` — Node runner for batch fitting

## MVP Features (Free Tier)
1. Paste concentration-response data (up to one dataset, 8 concentrations)
2. Fit 4PL curve automatically
3. Display IC50, Hill slope, top/bottom plateau with 95% confidence intervals
4. Publication-quality dose-response curve (log scale x-axis)
5. Export chart as PNG/SVG + results as CSV

## Engine Tasks

### E1: Data Parser
- Parse concentration-response pairs from paste/CSV
- Support replicates (multiple y values per concentration)
- Compute mean ± SEM per concentration
- **Validation**: Known test datasets

### E2: 4-Parameter Logistic Fit
- Model: `y = Bottom + (Top - Bottom) / (1 + (x/IC50)^HillSlope)`
- Levenberg-Marquardt nonlinear least-squares
- Initial parameter estimation: Top=max(y), Bottom=min(y), IC50=median(x), Hill=1
- Output: Top, Bottom, IC50, HillSlope, R², residuals
- **Validation**: GraphPad Prism output on identical datasets

### E3: Confidence Intervals
- 95% CI for each parameter via Jacobian-based covariance matrix
- CI for IC50 specifically (most reported parameter)
- **Validation**: Compare to GraphPad CI output

### E4: Goodness of Fit
- R² (coefficient of determination)
- Sum of squared residuals
- Residual plot data
- **Validation**: Manual R² calculation

### E5: Export
- Results: IC50 ± CI, Hill slope ± CI, Top, Bottom, R²
- Fitted curve data points for plotting
- CSV of raw + fitted values

## Web UI Tasks

### W1: Data Entry
- Paste-friendly table: Concentration | Response (replicates in columns)
- CSV upload support
- Live preview of data points

### W2: Dose-Response Chart
- Recharts/D3: log10(concentration) x-axis, response y-axis
- Data points with error bars (mean ± SEM)
- Fitted 4PL curve overlay
- IC50 line annotation

### W3: Results Panel
- IC50 with 95% CI
- Hill slope, Top, Bottom
- R² and goodness-of-fit metrics
- Residual plot

### W4: Export
- Download chart as PNG/SVG
- Download results as CSV
- Publication-ready figure styling

### W5: Toolbar & Theme
- Paste Data, Fit Curve, Export buttons
- Light/dark theme

## Key Equations
- 4PL: `y = Bottom + (Top - Bottom) / (1 + (x/IC50)^n)`
- Levenberg-Marquardt: iterative `Δp = (JᵀJ + λI)⁻¹ Jᵀr`
- R²: `1 - SS_res / SS_tot`

## Validation Strategy
- Published dose-response datasets with known IC50 values
- Side-by-side comparison with GraphPad Prism
- NIH/NCATS qHTS reference data
