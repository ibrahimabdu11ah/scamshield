import { Layers, FileText, Info, CircleCheck, ArrowRight, ShieldAlert } from './Icons.js';
import RiskBand from './RiskBand.jsx';
import CopyButton from './CopyButton.jsx';
import OfficialResources from './OfficialResources.jsx';
import EvidenceText from './EvidenceText.jsx';
import { buildSummary } from '../utils/analyzer.js';
import { SOURCE_LABELS } from '../utils/format.js';
import { navigate } from '../utils/useHashRoute.js';

export default function ResultSummary({ result }) {
  const strongSignals = result.signals.filter((s) => s.severity >= 2);

  return (
    <section className="results" aria-labelledby="results-title">
      <div className="results__header">
        <p className="eyebrow">Exhibit 1 · Assessment</p>
        <h2 id="results-title" className="section-title">
          What the rules found
        </h2>
      </div>

      <div className="results__grid">
        <div className="results__main">
          <div className="panel assessment">
            <div className="assessment__top">
              <RiskBand band={result.band} size="lg" />
              <dl className="facts">
                <div>
                  <dt>Category</dt>
                  <dd>{result.category.label}</dd>
                </div>
                <div>
                  <dt>Matched checks</dt>
                  <dd>
                    {result.matchedChecks} across {result.tactics.length} tactic{result.tactics.length === 1 ? '' : 's'}
                  </dd>
                </div>
                <div>
                  <dt>Language</dt>
                  <dd>{result.language.label}</dd>
                </div>
                <div>
                  <dt>Input</dt>
                  <dd>{SOURCE_LABELS[result.source] || 'Pasted text'}</dd>
                </div>
              </dl>
            </div>

            <div className="assessment__message">
              <p className="mini-label">Your message, with evidence highlighted</p>
              <EvidenceText
                text={result.text}
                signals={result.signals}
                onSelect={(id) => navigate('xray', id)}
              />
            </div>

            <div className="uncertainty">
              <Info size={16} aria-hidden="true" />
              <ul>
                {result.uncertainty.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="panel">
            <div className="panel__head">
              <h3 className="panel__title">Evidence found in your message</h3>
              <span className="panel__meta">{result.signals.length} verified phrase{result.signals.length === 1 ? '' : 's'}</span>
            </div>
            {result.signals.length === 0 ? (
              <p className="muted">
                No warning patterns matched. That does not mean the message is safe — the rules only recognise known
                patterns.
              </p>
            ) : (
              <table className="table evidence-table">
                <thead>
                  <tr>
                    <th scope="col">Exact phrase</th>
                    <th scope="col">Possible tactic</th>
                    <th scope="col" className="hide-sm">
                      Weight
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.signals.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <q className="quote">{s.quote}</q>
                      </td>
                      <td>{s.tacticLabel}</td>
                      <td className="hide-sm">
                        <span className={`weight weight--${s.severity}`}>
                          {s.severity === 3 ? 'Strong' : s.severity === 2 ? 'Moderate' : 'Weak'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="button-row">
              <button type="button" className="btn btn--primary" onClick={() => navigate('xray')}>
                <Layers size={16} aria-hidden="true" /> Inspect in Manipulation X-Ray
              </button>
              <CopyButton getText={() => buildSummary(result)} label="Copy summary" />
            </div>
          </div>
        </div>

        <aside className="results__side">
          <div className="panel panel--accent">
            <p className="eyebrow">Recommended next steps</p>
            <h3 className="panel__title panel__title--serif">{result.advice.headline}</h3>
            <ol className="steps">
              {result.advice.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {strongSignals.length > 0 && (
              <div className="callout callout--danger">
                <ShieldAlert size={18} aria-hidden="true" />
                <p>Do not reply, pay, or click links in this message until you have verified it independently.</p>
              </div>
            )}
            <p className="mini-label">Always</p>
            <ul className="checklist">
              {result.universalSteps.map((step) => (
                <li key={step}>
                  <CircleCheck size={15} aria-hidden="true" />
                  {step}
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn--secondary btn--block" onClick={() => navigate('act')}>
              <FileText size={16} aria-hidden="true" /> Draft an incident report <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>

          <div className="panel">
            <p className="eyebrow">Official reporting</p>
            <OfficialResources compact />
          </div>
        </aside>
      </div>
    </section>
  );
}
