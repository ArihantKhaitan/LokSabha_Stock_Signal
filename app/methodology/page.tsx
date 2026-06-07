import { SECTOR_META } from "@/lib/sectors";

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-lss-text mb-2">Methodology & Limitations</h1>
        <p className="text-lss-secondary text-sm">
          Full explanation of every calculation, what data is real vs estimated,
          and why you should treat these results with healthy scepticism.
        </p>
      </div>

      {/* Data transparency box */}
      <div className="glass-accent rounded-2xl p-5 mb-8">
        <h2 className="text-lss-accent font-bold text-sm mb-3">Data Transparency Statement</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-[12px]">
          <div>
            <p className="text-lss-green font-bold mb-2">✅ REAL data</p>
            <ul className="space-y-1 text-lss-secondary">
              <li>• Stock OHLCV prices — Yahoo Finance via yahoo-finance2</li>
              <li>• Lok Sabha session date ranges — loksabha.nic.in</li>
              <li>• Bill names, passage dates — prsindia.org, loksabha.nic.in</li>
              <li>• Sector classifications — based on publicly stated bill targets</li>
            </ul>
          </div>
          <div>
            <p className="text-lss-orange font-bold mb-2">⚠ ESTIMATED data</p>
            <ul className="space-y-1 text-lss-secondary">
              <li>• Significance score (1–10) — transparent formula below</li>
              <li>• Sentiment label — derived from bill direction</li>
              <li>• No hours/MPs-participated fields (removed as unverifiable)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Signal calculation */}
      <section className="glass rounded-2xl p-6 mb-5">
        <h2 className="text-lss-text font-bold mb-4">Signal Calculation</h2>
        <div className="space-y-4 text-[13px] text-lss-secondary">
          <div>
            <p className="text-lss-text font-semibold mb-1">Step 1 — Sector Basket</p>
            <p>Each sector is represented by 2–3 NSE-listed stocks (equal weight). All prices are fetched live from Yahoo Finance.</p>
          </div>
          <div>
            <p className="text-lss-text font-semibold mb-1">Step 2 — Return Windows</p>
            <div className="font-mono text-[12px] rounded-xl p-4" style={{ background: "#1A0800", border: "1px solid rgba(224,88,24,0.2)", color: "#F5EDD8" }}>
              T−1: day before debate (pre-event baseline)<br/>
              T+1: first trading day after debate date<br/>
              T+2: two trading days after<br/>
              T+5: five trading days after (~1 week)
            </div>
          </div>
          <div>
            <p className="text-lss-text font-semibold mb-1">Step 3 — Excess Return & Signal</p>
            <div className="font-mono text-[12px] rounded-xl p-4" style={{ background: "#1A0800", border: "1px solid rgba(224,88,24,0.2)", color: "#F5EDD8" }}>
              excess_t1 = T+1_return − sector_historical_avg_daily_return<br/>
              signal    = excess_t1 × significance_score
            </div>
          </div>
          <div>
            <p className="text-lss-text font-semibold mb-1">Step 4 — Correlation</p>
            <div className="font-mono text-[12px] rounded-xl p-4" style={{ background: "#1A0800", border: "1px solid rgba(224,88,24,0.2)", color: "#F5EDD8" }}>
              r, p = pearsonR(significance_scores, t1_returns)<br/>
              p &lt; 0.05 → statistically significant at 95% confidence
            </div>
            <p className="mt-2 text-[11px] text-lss-tertiary">
              Pearson r implementation is pure TypeScript — no external stats library — using the standard formula with a
              Lentz continued-fraction regularised beta function for the p-value.
            </p>
          </div>
        </div>
      </section>

      {/* Significance scoring */}
      <section className="glass rounded-2xl p-6 mb-5">
        <h2 className="text-lss-text font-bold mb-4">Significance Score Formula (1–10)</h2>
        <p className="text-lss-secondary text-[13px] mb-4">
          To avoid labelling arbitrary numbers as &ldquo;hours debated&rdquo; (which we cannot verify),
          we use a transparent scoring formula:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-lss-tertiary text-left" style={{ borderBottom: "1px solid rgba(180,148,100,0.35)" }}>
                <th className="pb-2 font-semibold">Event Type</th>
                <th className="pb-2 font-semibold">Base Score</th>
                <th className="pb-2 font-semibold">Modifiers (+1 each, max 10)</th>
              </tr>
            </thead>
            <tbody className="text-lss-secondary">
              {[
                ["No-Confidence Motion", "9", "—"],
                ["Full Union Budget / Vote on Account", "8", "Record allocation (+1), Election year (+1)"],
                ["Bill passage (both Houses)", "6", "Landmark legislation (+1, +2), National security (+1)"],
                ["Bill introduction / supplementary demand", "4", "Major controversy (+2), Cross-party debate (+1)"],
                ["Calling Attention / discussion motion", "4", "Market-sensitive topic (+1, +2)"],
              ].map(([type, base, mod]) => (
                <tr key={type} style={{ borderBottom: "1px solid rgba(180,148,100,0.25)" }}>
                  <td className="py-2">{type}</td>
                  <td className="py-2 font-mono text-lss-accent">{base}</td>
                  <td className="py-2 text-lss-tertiary">{mod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-lss-tertiary mt-3">
          Each event in the dataset includes a <code>significance_basis</code> field explaining exactly
          how its score was computed. This is visible in the raw data returned by <code>/api/parliament</code>.
        </p>
      </section>

      {/* Sector baskets */}
      <section className="glass rounded-2xl p-6 mb-5">
        <h2 className="text-lss-text font-bold mb-4">Sector Baskets (Real NSE Stocks)</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[12px]">
          {Object.entries(SECTOR_META).map(([sector, meta]) => (
            <div key={sector} className="rounded-xl p-3"
              style={{ borderLeft: `3px solid ${meta.color}`, background: "rgba(245,237,216,0.5)" }}>
              <p className="font-semibold text-lss-text mb-1">{meta.label}</p>
              <p className="text-lss-tertiary">{meta.tickers.join(" · ")}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-lss-tertiary mt-3">
          ✅ All tickers are real NSE-listed stocks. Prices fetched from Yahoo Finance (.NS suffix).
          Equal-weighted daily returns within each basket.
        </p>
      </section>

      {/* Limitations */}
      <section className="glass rounded-2xl p-6 mb-5">
        <h2 className="text-lss-text font-bold mb-4">Honest Limitations</h2>
        <div className="space-y-3">
          {[
            ["Correlation ≠ Causation", "Even a statistically significant r does not mean Parliament caused the market movement. Both may be driven by a third factor (e.g. a ministry announcement that triggers the debate and the market simultaneously)."],
            ["Small sample size", "6–12 events per sector over 2 years. At n < 15, conventional p-value thresholds have elevated false-positive rates. A 'significant' result here may not replicate with a larger dataset."],
            ["Reverse causality", "Parliament often debates issues after the market has already moved. A sector sell-off can prompt MPs to raise concerns — the debate follows the event rather than predicting it."],
            ["Estimated significance scores", "We have no access to precise hours-debated or MP participation counts. Our 1–10 significance score is a transparent proxy, not a precise measurement."],
            ["Small baskets", "2–3 stocks per sector. A single stock's earnings call can dominate the basket return, masking or amplifying any parliament effect."],
            ["No controls", "Returns are not adjusted for Nifty 50 market-wide moves, VIX, FII flows, or global risk-off events. All these confound the measured signal."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl p-3"
              style={{ borderLeft: "3px solid rgba(180,148,100,0.5)", background: "rgba(245,237,216,0.5)" }}>
              <p className="text-lss-text text-[12px] font-semibold mb-1">⚠ {title}</p>
              <p className="text-lss-secondary text-[12px] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data sources */}
      <section className="glass rounded-2xl p-6 mb-5">
        <h2 className="text-lss-text font-bold mb-4">Data Sources</h2>
        <div className="space-y-2 text-[12px]">
          {[
            ["Lok Sabha Secretariat", "https://loksabha.nic.in", "Session schedules, bill lists, passage records"],
            ["PRS Legislative Research", "https://prsindia.org", "Bill summaries, committee reports"],
            ["Sansad TV / sansad.in", "https://sansad.in", "Session transcripts and proceedings"],
            ["Yahoo Finance (via yahoo-finance2)", "https://github.com/gadicc/node-yahoo-finance2", "Real OHLCV stock prices"],
            ["NSE India", "https://www.nseindia.com", "Ticker symbol reference"],
          ].map(([name, , usage]) => (
            <div key={name} className="flex items-start gap-3">
              <span className="text-lss-accent font-semibold shrink-0">{name}</span>
              <span className="text-lss-tertiary">{usage}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Academic context */}
      <section className="glass rounded-2xl p-6 mb-5">
        <h2 className="text-lss-text font-bold mb-3">Academic Context</h2>
        <div className="space-y-2 text-[12px] text-lss-secondary">
          <p><strong className="text-lss-text">Ziobrowski et al. (2004, 2011)</strong> &mdash; Found statistically significant alpha in US Congress members&apos; personal stock portfolios, suggesting legislative information has market value.</p>
          <p><strong className="text-lss-text">Eggers & Hainmueller (2013)</strong> — Follow-up questioning the magnitude of the US Congressional effect, highlighting small-sample concerns. Directly relevant caution for this project.</p>
          <p><strong className="text-lss-text">Jha & Laurence (2018)</strong> — Indian parliamentary questions and sectoral anomalies — the closest Indian analogue we are aware of.</p>
        </div>
      </section>

      {/* Future work */}
      <section className="glass rounded-2xl p-6">
        <h2 className="text-lss-text font-bold mb-3">Future Work</h2>
        <ul className="space-y-1 text-[12px] text-lss-secondary">
          <li>• Automated transcript scraping from loksabha.nic.in with NLP-based intensity scoring</li>
          <li>• Nifty sectoral index ETFs as wider basket ground truth</li>
          <li>• Factor-adjusted excess returns (market, size, value)</li>
          <li>• Intraday tick data for same-day debate reactions</li>
          <li>• Extension to Rajya Sabha debates</li>
          <li>• Rajya Sabha MP stock disclosure cross-reference (if mandated by SEBI)</li>
        </ul>
      </section>
    </div>
  );
}
