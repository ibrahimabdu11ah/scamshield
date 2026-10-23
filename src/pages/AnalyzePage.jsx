import { useRef, useState } from 'react';
import { ScanSearch, Image as ImageIcon, TriangleAlert, Info, ArrowRight } from '../components/Icons.js';
import PageHeader from '../components/PageHeader.jsx';
import ScreenshotOcr from '../components/ScreenshotOcr.jsx';
import ResultSummary from '../components/ResultSummary.jsx';
import { SAMPLE_MESSAGES } from '../data/sampleMessages.js';
import { MAX_INPUT_LENGTH } from '../utils/analyzer.js';

export default function AnalyzePage({ draft, setDraft, analysis, onAnalyze, onClear }) {
  const [tab, setTab] = useState('text');
  const [error, setError] = useState('');
  const [sampleId, setSampleId] = useState('');
  const resultsRef = useRef(null);
  const textRef = useRef(null);

  const handleAnalyze = () => {
    if (!draft.text.trim()) {
      setError('The message box is empty. Paste a message, choose a sample, or extract text from a screenshot.');
      textRef.current?.focus();
      return;
    }
    try {
      onAnalyze(draft.text, draft.source);
      setError('');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSample = (id) => {
    setSampleId(id);
    const sample = SAMPLE_MESSAGES.find((m) => m.id === id);
    if (sample) {
      setDraft({ text: sample.text, source: 'sample', ocrConfidence: null });
      setError('');
    }
  };

  const handleClear = () => {
    setSampleId('');
    setError('');
    onClear();
    textRef.current?.focus();
  };

  const handleExtracted = (text, confidence) => {
    setDraft({ text: String(text).slice(0, MAX_INPUT_LENGTH), source: 'screenshot', ocrConfidence: confidence });
    setTab('text');
    setError('');
    setTimeout(() => textRef.current?.focus(), 50);
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Message Analysis"
        title="Inspect a suspicious message"
        lede="Paste an SMS, WhatsApp message or email, or extract text from a screenshot. The rules run in your browser and the same text always gives the same result."
      />

      <section className="panel analyze-input">
        <div className="tabs" role="tablist" aria-label="Input method">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'text'}
            className={`tab ${tab === 'text' ? 'is-active' : ''}`}
            onClick={() => setTab('text')}
          >
            <ScanSearch size={16} aria-hidden="true" /> Paste text
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'image'}
            className={`tab ${tab === 'image' ? 'is-active' : ''}`}
            onClick={() => setTab('image')}
          >
            <ImageIcon size={16} aria-hidden="true" /> Screenshot (OCR)
          </button>
        </div>

        {tab === 'text' ? (
          <div className="analyze-input__body" role="tabpanel">
            <div className="analyze-input__toolbar">
              <label className="field field--inline">
                <span className="field__label">Load a sample</span>
                <select className="select" value={sampleId} onChange={(e) => handleSample(e.target.value)}>
                  <option value="">Choose a sample message…</option>
                  {SAMPLE_MESSAGES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              <span className="fine-print">All samples are fictional.</span>
            </div>

            {draft.source === 'screenshot' && draft.text && (
              <div className="callout callout--info">
                <Info size={18} aria-hidden="true" />
                <p>
                  <strong>Text extracted from your screenshot.</strong> OCR can misread words and numbers
                  {typeof draft.ocrConfidence === 'number' ? ` (engine confidence ${draft.ocrConfidence}/100)` : ''}.
                  Review and correct it below before analysing.
                </p>
              </div>
            )}

            <label htmlFor="message-input" className="visually-hidden">
              Message to analyse
            </label>
            <textarea
              id="message-input"
              ref={textRef}
              className="textarea textarea--lg"
              rows={9}
              maxLength={MAX_INPUT_LENGTH}
              value={draft.text}
              placeholder="Paste the full message here, including any links. English and Hindi are supported."
              onChange={(e) => {
                setDraft({ ...draft, text: e.target.value });
                if (error) setError('');
              }}
              aria-invalid={!!error}
              aria-describedby="message-help"
            />
            <div className="input-meta" id="message-help">
              {error ? (
                <span className="field-error" role="alert">
                  <TriangleAlert size={14} aria-hidden="true" /> {error}
                </span>
              ) : (
                <span className="fine-print">Never paste an OTP, PIN, password or CVV. Your message never leaves your browser.</span>
              )}
              <span className={`counter ${draft.text.length > MAX_INPUT_LENGTH * 0.9 ? 'counter--warn' : ''}`}>
                {draft.text.length.toLocaleString('en-IN')} / {MAX_INPUT_LENGTH.toLocaleString('en-IN')} characters
              </span>
            </div>
            <div className="button-row">
              <button type="button" className="btn btn--primary" onClick={handleAnalyze}>
                Analyze <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button type="button" className="btn btn--secondary" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="analyze-input__body" role="tabpanel">
            <ScreenshotOcr
              onExtracted={handleExtracted}
              onUseTranscript={(text) => handleExtracted(text, null)}
            />
          </div>
        )}
      </section>

      <div ref={resultsRef} className="scroll-anchor">
        {analysis ? (
          <ResultSummary result={analysis} />
        ) : (
          <div className="placeholder-results">
            <p className="eyebrow">Results</p>
            <p className="muted">
              Your assessment, the exact evidence from your message, and recommended next steps will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
