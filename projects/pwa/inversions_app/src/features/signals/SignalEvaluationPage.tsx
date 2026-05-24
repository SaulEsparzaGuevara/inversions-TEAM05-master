import { useMemo, useState } from "react";
import { SignalEvidencePanel } from "./SignalEvidencePanel";
import { evaluateSignal, type EvaluateSignalResponse, type SourceVerdict } from "../../services/signals/signalApi";

const defaultVerdicts: SourceVerdict[] = [
  {
    sourceId: "technical-rsi",
    verdict: "BUY",
    confidence: 0.72,
    rationale: "Ruptura alcista con volumen"
  },
  {
    sourceId: "fundamental-earnings",
    verdict: "HOLD",
    confidence: 0.58,
    rationale: "Crecimiento estable sin sorpresa"
  },
  {
    sourceId: "news-sentiment",
    verdict: "SELL",
    confidence: 0.42,
    rationale: "Aumento de volatilidad por noticias"
  }
];

export function SignalEvaluationPage() {
  const [instrument, setInstrument] = useState("AAPL");
  const [result, setResult] = useState<EvaluateSignalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verdicts = useMemo(() => defaultVerdicts, []);

  async function onEvaluate() {
    setLoading(true);
    setError(null);

    try {
      const evaluated = await evaluateSignal({ instrument, verdicts });
      setResult(evaluated);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Evaluacion de Senales</h1>
      <label htmlFor="instrument">Instrumento</label>
      <input id="instrument" value={instrument} onChange={(event) => setInstrument(event.target.value.toUpperCase())} />
      <button type="button" onClick={onEvaluate} disabled={loading}>
        {loading ? "Evaluando..." : "Evaluar"}
      </button>

      {error ? <p>{error}</p> : null}

      {result ? (
        <section>
          <h2>Resultado</h2>
          <p>Signal: {result.signal}</p>
          <p>Confluencia: {result.confluenceScore}</p>
          <p>Confianza: {Math.round(result.confidence * 100)}%</p>
          <p>{result.explainability.summary}</p>
          <SignalEvidencePanel evidence={result.explainability.evidence} />
        </section>
      ) : null}
    </main>
  );
}
