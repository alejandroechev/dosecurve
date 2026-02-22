# DoseCurve — Business Plan & Commercialization Roadmap

## 1. Executive Summary

GraphPad Prism charges $300–$1,200/yr for a general-purpose statistics and graphing suite, yet over half of its academic and pharma users primarily need one workflow: fitting a 4-Parameter Logistic curve to dose-response data and reporting an IC50. DoseCurve delivers exactly that — a free, browser-based tool that produces publication-quality IC50 results in seconds with no download, no license key, and no learning curve. The market opportunity is a wedge into Prism's estimated 500K+ user base by owning the dose-response niche, converting free users to premium tiers for batch analysis, reporting, and regulatory features that labs actually pay for.

## 2. Current Product Assessment

### What Works Today (Free Tier)
- **4PL curve fitting** via Levenberg-Marquardt nonlinear least-squares
- **IC50 determination** with 95% confidence intervals (Jacobian-based covariance)
- **Hill slope characterization** with confidence intervals
- **Top/Bottom plateau estimation** with CIs
- **R² and residual analysis** (goodness-of-fit)
- **Publication-quality chart** — log₁₀ dose x-axis, SEM error bars, fitted curve overlay, IC50 annotation
- **Data entry** — paste or CSV upload with replicate support (mean ± SEM auto-computed)
- **Export** — PNG/SVG chart download, CSV results
- **Light/dark theme**

### Confidence Metrics

| Metric | Score | Notes |
|--------|-------|-------|
| Pro Use (would a pro trust it?) | 70% | Core math is solid; needs more published dataset validation |
| Scales (handles real-world data?) | 50% | Single dataset per session is a real limitation |
| Useful (solves a real problem?) | 80% | Nails the core IC50 workflow |
| Incremental Premium viability | 60% | Clear features to gate (batch, reports, persistence) |
| Major Premium viability | 75% | Competes on price at 1/3 of Prism with focused features |

### Test Coverage
- **56 total tests**: 46 unit tests (engine) + 10 E2E tests (web)
- Engine coverage: parser, 4PL fit, confidence intervals, goodness-of-fit, export
- IC50 calculation matches GraphPad Prism output on test datasets
- E2E tests cover paste → fit → results → export workflow

### Known Limitations
- **Single dataset per session** — no multi-curve overlay or comparison
- **No biphasic/multiphasic models** — only standard 4PL sigmoid
- **No batch fitting** — can't process a plate of compounds at once
- **No report export** — no PDF or Word output for regulatory/notebook use
- **No data persistence** — refresh = data gone
- **No constrained fitting** — can't fix Top/Bottom or constrain Hill slope
- **No weighting options** — assumes equal weights (no 1/Y² weighting)

## 3. Competitive Landscape

| Feature | DoseCurve (Free) | GraphPad Prism ($300–$1,200/yr) | OriginPro ($1,000+/yr) | R/drc package (Free) |
|---------|------------------|----------------------------------|------------------------|----------------------|
| **Price** | Free | $300 (academic) – $1,200 (commercial) | ~$1,000–$1,500/yr | Free |
| **Platform** | Browser (any OS) | Windows + Mac desktop | Windows (Mac limited) | R console |
| **Learning curve** | Minutes | Hours–days | Days–weeks | Weeks (requires R) |
| **4PL fitting** | ✅ | ✅ | ✅ | ✅ |
| **IC50 + 95% CI** | ✅ | ✅ | ✅ | ✅ (manual) |
| **Hill slope** | ✅ | ✅ | ✅ | ✅ |
| **Publication chart** | ✅ | ✅ | ✅ | ✅ (ggplot2) |
| **Biphasic models** | ❌ | ✅ | ✅ | ✅ |
| **Batch fitting** | ❌ | ✅ | ✅ | ✅ (scripted) |
| **Custom models** | ❌ | ✅ | ✅ | ✅ |
| **Report generation** | ❌ (CSV only) | ✅ (PDF/PPT) | ✅ | ❌ |
| **Data persistence** | ❌ | ✅ (project files) | ✅ | ✅ (scripts) |
| **Collaboration** | ❌ | ❌ | ❌ | ❌ (Git) |
| **API access** | ❌ | ❌ | ❌ | ✅ (R) |
| **No install required** | ✅ | ❌ | ❌ | ❌ |
| **IT/license approval** | Not needed | Required | Required | Not needed |

### Key Competitive Insight
GraphPad Prism's moat is trust (decades of citations) and breadth (t-tests, ANOVA, survival, etc.). DoseCurve's wedge is the 50%+ of Prism users who only use dose-response fitting — they're paying $300–$1,200/yr for one workflow. R/drc is free but requires programming skills, which eliminates 80%+ of bench scientists.

## 4. Free Tier (User Acquisition)

**Free forever — this is the hook:**

- Single dataset 4PL curve fitting (unlimited uses)
- IC50 with 95% confidence intervals
- Hill slope, Top, Bottom parameters with CIs
- R² and residual analysis
- Publication-quality dose-response chart
- Data entry via paste or CSV upload
- Replicate support with automatic mean ± SEM
- Chart export as PNG/SVG
- Results export as CSV
- Light and dark theme
- No account required, no data leaves the browser

**Why this works**: A bench scientist Googles "IC50 calculator", lands on DoseCurve, pastes data, gets results in 30 seconds. No download, no license, no IT ticket. They bookmark it. They tell their labmate. When they need batch fitting for a 384-well screen, they hit the paywall.

## 5. Premium Roadmap

### Phase 1: Validation & Polish (Target: 90% Pro Use confidence)

Goal: Earn trust by proving correctness against published references.

| Item | Description | Effort | Impact |
|------|-------------|--------|--------|
| GraphPad validation suite | Match Prism output on 10+ published datasets (IC50, CI, R²) | M | Critical |
| NIH/NCATS qHTS validation | Validate against NCATS public dose-response data | M | High |
| Constrained fitting | Allow fixing Top=100%, Bottom=0%, or constraining Hill slope | S | High |
| Weighting options | 1/Y, 1/Y² weighting for heteroscedastic data | S | Medium |
| Error handling polish | Graceful handling of non-convergence, bad data, edge cases | S | High |
| Residual diagnostics | Normality test, runs test for systematic error detection | S | Medium |
| AIC/BIC reporting | Model selection metrics for comparing fits | S | Medium |
| Mobile responsiveness | Responsive layout for tablet use (common in labs) | S | Medium |

**Phase 1 total effort: ~4–6 weeks**

### Phase 2: Incremental Premium ($99–$199/yr)

Low effort, high impact features that justify a subscription for regular users.

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Batch fitting** | Paste/upload multi-compound plate data, fit all curves at once, summary table | M | Critical |
| **PDF report export** | One-click formatted report: chart + parameters + stats + methods section | M | Critical |
| **Data persistence** | Save/load sessions to browser storage or cloud (account required) | M | High |
| **Multi-curve overlay** | Plot 2–6 curves on same axes for visual comparison | M | High |
| **Custom axis labels** | User-defined axis titles, units, concentration labels | S | Medium |
| **Watermark-free charts** | Free tier gets subtle "DoseCurve.app" watermark on exports | S | Medium |
| **EC50/EC80/ECany** | Calculate any effective concentration, not just IC50 | S | High |
| **3-parameter logistic** | Fix Top or Bottom for simplified models | S | Medium |
| **Data table formatting** | Publication-ready parameter table with configurable sig figs | S | Medium |

**Phase 2 total effort: ~6–8 weeks**
**Target price: $99/yr academic, $199/yr commercial**

### Phase 3: Major Premium ($299–$499/yr)

Compete directly with GraphPad Prism on dose-response features.

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Biphasic model** | 2-site dose-response fitting for complex pharmacology | L | High |
| **Bell-shaped model** | Hormesis / biphasic agonist responses | L | Medium |
| **API access** | REST API for programmatic fitting (LIMS integration) | M | High |
| **Collaboration** | Share datasets and results via link, team workspaces | XL | Medium |
| **GxP/regulatory mode** | Audit trail, 21 CFR Part 11 compliance hooks, version-locked calculations | L | High |
| **Plate map editor** | Visual 96/384-well plate layout with drag-assign | L | High |
| **Selectivity analysis** | Compare IC50 across targets, selectivity ratios | M | Medium |
| **Absolute vs relative IC50** | Proper handling of partial agonists and non-normalized data | M | High |
| **Curve family fitting** | Global fitting with shared parameters across datasets | L | High |
| **LIMS/ELN integration** | Export to Benchling, Dotmatics, or custom ELN via webhooks | L | Medium |

**Phase 3 total effort: ~16–24 weeks**
**Target price: $299/yr academic, $499/yr commercial**

## 6. Validation Requirements

Correctness is everything in scientific software. The following validations are required before premium launch:

| # | Validation Case | Source | What to Match |
|---|----------------|--------|---------------|
| 1 | **Prism tutorial dataset** | GraphPad Prism 10 "Dose-response – Inhibition" example data | IC50, Hill slope, Top, Bottom, R², all 95% CIs within 0.1% |
| 2 | **NIH/NCATS qHTS controls** | PubChem AID 1996 (Luciferase inhibition, 11-point CRC) | IC50 and curve class match NCATS reported values |
| 3 | **Sebaugh & McCray (2003)** | "Defining the linear portion of a sigmoid-shaped curve" J Pharm Sci 92(4) | Reproduce published 4PL parameters from Table 1 |
| 4 | **NIST StRD nonlinear datasets** | NIST Statistical Reference Datasets (Thurber, MGH17) | Certified parameter values to 11+ significant digits |
| 5 | **R/drc cross-validation** | `drc::drm()` on Ryegrass dataset (built-in) | IC50 and parameters match R output within tolerance |
| 6 | **AAT Bioquest reference** | AAT Bioquest IC50 Calculator (free online tool) | Match IC50 on their example datasets |
| 7 | **Known-parameter synthetic data** | Generate data from known 4PL parameters with controlled noise | Recover parameters within 1 SEM of true values at N=3 replicates |
| 8 | **Edge cases** | Incomplete curves (no bottom), flat responses, very steep Hill slopes | Graceful handling: correct warnings, reasonable estimates or failure messages |

## 7. Revenue Projections

### Market Sizing

| Level | Estimate | Basis |
|-------|----------|-------|
| **TAM** (Total Addressable Market) | $2.5B/yr | Global scientific software market for life sciences |
| **SAM** (Serviceable Available Market) | $250M/yr | Dose-response / curve fitting segment (~10% of TAM) |
| **SOM** (Serviceable Obtainable Market) | $500K–$2M/yr | Realistic capture at scale (0.2–0.8% of SAM) |

### Conservative Revenue Model

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Free users (MAU) | 2,000 | 8,000 | 20,000 |
| Conversion rate | 2% | 3% | 4% |
| Paid subscribers | 40 | 240 | 800 |
| Avg revenue/subscriber | $149 | $199 | $249 |
| **Annual revenue** | **$6K** | **$48K** | **$199K** |
| Hosting costs | ~$0 | ~$200 | ~$1,200 |
| **Net revenue** | **$6K** | **$48K** | **$198K** |

### Key Assumptions
- SEO-driven acquisition: "IC50 calculator", "dose-response curve fitting" are high-intent searches
- No paid marketing budget — growth via SEO, word of mouth, citation in methods sections
- Price anchored against GraphPad at 1/3–1/6 the cost
- Zero marginal cost per user (browser-based, no server compute)

## 8. Recommended Priority

### Portfolio Ranking: **Tier 1 — High Priority**

**Why DoseCurve ranks high:**

1. **Clear willingness to pay** — Pharma and biotech labs already spend $300–$1,200/yr per seat on tools that do this. The budget line item exists.
2. **Narrow, winnable niche** — GraphPad Prism is a broad tool. DoseCurve can be the best dose-response tool in the world by doing one thing perfectly.
3. **Strong SEO opportunity** — "IC50 calculator" and "dose-response curve fitting" are underserved search terms with high commercial intent. Few quality free tools rank for them.
4. **Low incremental effort to premium** — The engine is proven (56 tests, matches GraphPad output). Batch fitting and PDF export are M-sized efforts that unlock $99–$199/yr pricing.
5. **Trust-building path is clear** — Validate against 8+ published references, add that validation page to the site, and the tool becomes citable.
6. **Zero infrastructure cost** — All computation is client-side. No GPU, no server, no scaling concerns. Pure margin.

**Recommended next step**: Complete Phase 1 validation (4–6 weeks), then ship batch fitting + PDF export as the first premium features. Target $99/yr academic pricing to undercut Prism by 3–12x.

**Risk**: The biggest risk is not technical — it's adoption. DoseCurve must appear in the first page of Google results for "IC50 calculator" and be cited in at least one published methods section to build trust. SEO and a validation/citation page are as important as features.
