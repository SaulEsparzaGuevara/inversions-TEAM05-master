import { writeFileSync } from 'fs';
import { createHash } from 'crypto';

async function fetchJson(url: string, opts: any = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`fetch ${url} failed ${res.status}`);
  return res.json();
}

function hashObject(obj: any) {
  const s = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return createHash('sha256').update(s).digest('hex');
}

async function main() {
  const ctx = process.argv[2];
  if (!ctx) {
    console.error('Usage: node tools/reconstruct_explanation.js <context_id>');
    process.exit(2);
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  const bundle: any = { contextId: ctx, reconstructionStepsLog: [] };

  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      bundle.reconstructionStepsLog.push('SUPABASE not configured; falling back to local memstore (none)');
    } else {
      // fetch institutional_context
      const inst = await fetchJson(`${SUPABASE_URL}/rest/v1/institutional_context?context_id=eq.${ctx}`, {
        headers: { apikey: SUPABASE_KEY },
      });
      bundle.contextSnapshot = inst;
      bundle.reconstructionStepsLog.push('fetched institutional_context');

      const evidence = await fetchJson(`${SUPABASE_URL}/rest/v1/evidence_blobs?context_id=eq.${ctx}`, {
        headers: { apikey: SUPABASE_KEY },
      });
      bundle.evidenceBundle = evidence;
      bundle.reconstructionStepsLog.push('fetched evidence_blobs');

      const explanation = await fetchJson(`${SUPABASE_URL}/rest/v1/explanation_response?context_id=eq.${ctx}`, {
        headers: { apikey: SUPABASE_KEY },
      });
      bundle.explanationResponse = explanation;
      bundle.reconstructionStepsLog.push('fetched explanation_response');
    }

    // Reconstruct deterministic parts (stubbed)
    const deterministicInputs = {
      context: bundle.contextSnapshot ?? null,
      evidence: bundle.evidenceBundle ?? null,
    };
    bundle.reconstructionStepsLog.push('reconstructed deterministic inputs');

    // Recompute response hash
    const recalculated = hashObject(deterministicInputs);
    bundle.responseHash = recalculated;
    bundle.reconstructionStepsLog.push('recalculated response hash');

    // Compare with stored if exists
    if (bundle.explanationResponse && Array.isArray(bundle.explanationResponse) && bundle.explanationResponse[0]) {
      const storedHash = (bundle.explanationResponse[0] as any).response_hash;
      bundle.storedResponseHash = storedHash;
      bundle.reconstructionStepsLog.push(`found stored hash: ${storedHash}`);
      bundle.hashMatch = storedHash === recalculated;
    }

    bundle.strategyPolicyVersion = bundle.contextSnapshot?.[0]?.strategy_policy_version ?? null;
    bundle.modelVersion = bundle.explanationResponse?.[0]?.model_version ?? null;

    const outPath = `./tools/reconstruction_${ctx}.audit.json`;
    writeFileSync(outPath, JSON.stringify(bundle, null, 2), 'utf-8');
    console.log('Wrote audit bundle to', outPath);
  } catch (err: any) {
    console.error('Reconstruction failed:', err?.message ?? err);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
