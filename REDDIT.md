# DoseCurve — Reddit Launch Posts

---

## Post 1: r/pharmacology

**Title:** I built a free browser-based IC50 / dose-response curve fitter — no GraphPad needed

**Body:**

Built a free web app called DoseCurve for dose-response analysis. It fits a 4-parameter logistic model, determines IC50 with 95% confidence intervals, characterizes Hill slope, and generates publication-quality log-dose vs response plots.

Uses Levenberg-Marquardt optimization under the hood. Just paste your concentration and response data, and it fits the curve and reports all parameters with goodness of fit.

No install, no login, no GraphPad license. Runs entirely in your browser — no data sent to any server.

🔗 **Live:** https://dosecurve.vercel.app
📂 **Source:** https://github.com/alejandroechev/dosecurve

Would love feedback from pharmacologists — what's missing to make this actually useful for your analysis?

---

## Post 2: r/labrats

**Title:** Free IC50 curve fitter that runs in your browser — 4PL dose-response analysis without expensive software

**Body:**

Tired of needing a GraphPad Prism license just to fit an IC50 curve? I built DoseCurve — a free browser-based tool that does 4-parameter logistic dose-response fitting with confidence intervals and R².

Paste your data, get your IC50, Hill slope, and a publication-ready plot. No install, no account needed.

🔗 https://dosecurve.vercel.app
📂 https://github.com/alejandroechev/dosecurve

What would make this worth using in your lab? Looking for feedback.

---

## Post 3: r/bioinformatics

**Title:** Free browser-based 4PL dose-response curve fitter — open source, no install

**Body:**

I built a free, open-source web tool for dose-response IC50 analysis. 4-parameter logistic regression with Levenberg-Marquardt fitting, confidence intervals via Jacobian-based covariance, and R² reporting.

Pure TypeScript engine, runs client-side, no dependencies on external servers. Open source if you want to integrate the fitting engine into your own pipelines.

🔗 https://dosecurve.vercel.app
📂 https://github.com/alejandroechev/dosecurve

Feedback welcome — especially on data import formats and batch analysis needs.
