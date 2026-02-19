import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

import type { ITextToSpeechGateway } from '@/features/speaking/domain/ports/text-to-speech-gateway.interface';

const LOCALE_TO_VOICE: Record<string, string> = {
  'en-US': 'en-US-JennyNeural',
  'pt-BR': 'pt-BR-FranciscaNeural',
  'es-ES': 'es-ES-ElviraNeural',
  'fr-FR': 'fr-FR-DeniseNeural',
  'de-DE': 'de-DE-KatjaNeural',
  'it-IT': 'it-IT-ElsaNeural',
  'ja-JP': 'ja-JP-NanamiNeural',
  'zh-CN': 'zh-CN-XiaoxiaoNeural',
  'ko-KR': 'ko-KR-SunHiNeural',
};

function toAzureLocale(languageCode: string): string {
  const base = languageCode.split('-')[0].toLowerCase();
  const map: Record<string, string> = {
    en: 'en-US',
    pt: 'pt-BR',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    ja: 'ja-JP',
    zh: 'zh-CN',
    ko: 'ko-KR',
  };
  return map[base] ?? `${base}-${base.toUpperCase()}`;
}

function getVoice(languageCode: string, voice?: string): string {
  const locale = toAzureLocale(languageCode);
  if (voice) return voice;
  return LOCALE_TO_VOICE[locale] ?? `${locale}-JennyNeural`;
}

export interface AzureTextToSpeechGatewayParams {
  subscriptionKey: string;
  region: string;
}

/**
 * Azure Speech TTS for the speaking conversation pipeline.
 */
export class AzureTextToSpeechGateway implements ITextToSpeechGateway {
  constructor(private readonly params: AzureTextToSpeechGatewayParams) {}

  async synthesize(
    text: string,
    languageCode: string,
    options?: { voice?: string },
  ): Promise<Uint8Array> {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      this.params.subscriptionKey,
      this.params.region,
    );
    speechConfig.speechSynthesisLanguage = toAzureLocale(languageCode);
    speechConfig.speechSynthesisVoiceName = getVoice(
      languageCode,
      options?.voice,
    );
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, undefined);

    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        (result) => {
          synthesizer.close();
          speechConfig.close();
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const data = result.audioData;
            resolve(new Uint8Array(data));
          } else {
            reject(new Error(result.errorDetails || 'Speech synthesis failed'));
          }
        },
        (err) => {
          synthesizer.close();
          speechConfig.close();
          reject(new Error(err ?? 'Speech synthesis error'));
        },
      );
    });
  }
}
