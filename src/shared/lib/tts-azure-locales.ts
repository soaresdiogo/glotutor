/**
 * Shared Azure TTS locale and voice mapping for native, standard pronunciation.
 * Used by both speaking (conversation) and listening (podcast) TTS when using Azure.
 *
 * Criterion: a native speaker of the language should recognize the audio as natural.
 * - Portuguese: pt-BR (Brazilian)
 * - English: en-US or en-GB
 * - Spanish: es-MX (neutral Latin American); es-419 mapped to es-MX
 * - French: fr-FR (nasals, liaison, guttural r)
 * - German: de-DE (umlauts, guttural ch)
 * - Italian: it-IT (melody and rhythm)
 */

export const LOCALE_TO_VOICE: Record<string, string> = {
  'en-US': 'en-US-JennyNeural',
  'en-GB': 'en-GB-SoniaNeural',
  'en-AU': 'en-AU-NatashaNeural',
  'pt-BR': 'pt-BR-FranciscaNeural',
  'pt-PT': 'pt-PT-RaquelNeural',
  'es-ES': 'es-ES-ElviraNeural',
  'es-MX': 'es-MX-DaliaNeural',
  'es-AR': 'es-AR-ElenaNeural',
  'es-419': 'es-MX-DaliaNeural',
  'fr-FR': 'fr-FR-DeniseNeural',
  'fr-CA': 'fr-CA-SylvieNeural',
  'de-DE': 'de-DE-KatjaNeural',
  'de-AT': 'de-DE-KatjaNeural',
  'de-CH': 'de-CH-LeniNeural',
  'it-IT': 'it-IT-ElsaNeural',
  'ja-JP': 'ja-JP-NanamiNeural',
  'zh-CN': 'zh-CN-XiaoxiaoNeural',
  'ko-KR': 'ko-KR-SunHiNeural',
};

/** Second voice per locale for two-speaker podcasts (e.g. male/female). */
export const LOCALE_TO_VOICE_2: Record<string, string> = {
  'en-US': 'en-US-GuyNeural',
  'en-GB': 'en-GB-RyanNeural',
  'pt-BR': 'pt-BR-AntonioNeural',
  'pt-PT': 'pt-PT-DuarteNeural',
  'es-ES': 'es-ES-AlvaroNeural',
  'es-MX': 'es-MX-JorgeNeural',
  'es-AR': 'es-AR-TomasNeural',
  'es-419': 'es-MX-JorgeNeural',
  'fr-FR': 'fr-FR-HenriNeural',
  'de-DE': 'de-DE-ConradNeural',
  'it-IT': 'it-IT-DiegoNeural',
};

export const DEFAULT_LOCALE_BY_LANGUAGE: Record<string, string> = {
  en: 'en-US',
  pt: 'pt-BR',
  es: 'es-MX',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  ja: 'ja-JP',
  zh: 'zh-CN',
  ko: 'ko-KR',
};

export function toAzureLocale(languageCode: string): string {
  const parts = languageCode.split('-').map((p) => p.trim());
  const base = (parts[0] ?? '').toLowerCase();
  const region = parts[1]?.toUpperCase();
  const fullLocale = region ? `${base}-${region}` : null;
  if (fullLocale && fullLocale in LOCALE_TO_VOICE) return fullLocale;
  return (
    DEFAULT_LOCALE_BY_LANGUAGE[base] ??
    (region ? `${base}-${region}` : `${base}-${base.toUpperCase()}`)
  );
}

export function getAzureVoiceForLocale(
  locale: string,
  useSecondVoice = false,
): string {
  const voiceMap = useSecondVoice ? LOCALE_TO_VOICE_2 : LOCALE_TO_VOICE;
  return voiceMap[locale] ?? LOCALE_TO_VOICE[locale] ?? `${locale}-JennyNeural`;
}
