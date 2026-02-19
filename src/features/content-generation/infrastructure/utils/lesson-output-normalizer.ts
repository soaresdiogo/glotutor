/**
 * Normalizes lesson pass LLM output:
 * - Maps alternative keys (high_frequency_chunks → chunks, module_speech_map → speech_map)
 * - Does NOT inject placeholder data — let validation catch missing content
 */
export function normalizeLessonOutput(parsed: unknown): unknown {
  const root = parsed as { content?: Record<string, unknown> };
  const content = root.content;
  if (!content || typeof content !== 'object') return parsed;

  const normalized = { ...root, content: { ...content } };

  // Normalize chunk key name
  const chunks =
    (normalized.content.chunks as unknown[] | undefined) ??
    (normalized.content.high_frequency_chunks as unknown[] | undefined);
  if (Array.isArray(chunks)) {
    normalized.content.chunks = chunks;
  }
  delete (normalized.content as Record<string, unknown>).high_frequency_chunks;

  // Normalize speech map key name
  const speechMap =
    (normalized.content.speech_map as Record<string, unknown> | undefined) ??
    (normalized.content.module_speech_map as
      | Record<string, unknown>
      | undefined);
  if (speechMap && typeof speechMap === 'object') {
    normalized.content.speech_map = { ...speechMap };
  }
  delete (normalized.content as Record<string, unknown>).module_speech_map;

  // Derive reductions from chunks ONLY if speech_map exists but reductions is empty
  // This is legitimate derivation, not placeholder injection
  const sm = normalized.content.speech_map as
    | Record<string, unknown>
    | undefined;
  if (sm) {
    const reductions = (sm.reductions as unknown[] | undefined) ?? [];
    if (reductions.length === 0 && Array.isArray(normalized.content.chunks)) {
      const derived = deriveReductionsFromChunks(
        normalized.content.chunks as Array<{
          connected_speech_features?: unknown[];
        }>,
      );
      if (derived.length > 0) {
        sm.reductions = derived;
      }
    }
  }

  // DO NOT inject placeholder adaptive_metadata — let validation catch it
  // DO NOT inject placeholder reductions — let validation catch it

  return normalized;
}

function deriveReductionsFromChunks(
  chunks: Array<{ connected_speech_features?: unknown[] }>,
): Array<{ formal?: string; spoken: string; audio_guide?: string }> {
  const seen = new Set<string>();
  const out: Array<{
    formal?: string;
    spoken: string;
    audio_guide?: string;
  }> = [];
  for (const c of chunks) {
    const features = c.connected_speech_features;
    if (!Array.isArray(features)) continue;
    for (const f of features) {
      const s = String(f);
      const m =
        /reduction:(\S+)/i.exec(s) ||
        /^(gonna|wanna|gotta|lemme|gimme|kinda)$/i.exec(s);
      const spoken = m ? (m[1] ?? s) : s;
      if (spoken && !seen.has(spoken.toLowerCase())) {
        seen.add(spoken.toLowerCase());
        out.push({ spoken, audio_guide: 'Derived from chunk' });
      }
    }
  }
  return out;
}
