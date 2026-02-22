import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

import type {
  ITTSGateway,
  TTSSynthesizeOptions,
} from '@/features/listening/domain/ports/tts-gateway.interface';
import {
  getAzureVoiceForLocale,
  toAzureLocale,
} from '@/shared/lib/tts-azure-locales';

/**
 * Azure Neural TTS for podcast/listening. Uses native voices per locale so audio
 * sounds like a native speaker with standard pronunciation (pt-BR, en-US, es-MX, fr-FR, de-DE, it-IT).
 * Requires languageCode in params; when not set, synthesis will use a default locale.
 */
export interface AzureListeningTTSGatewayParams {
  subscriptionKey: string;
  region: string;
}

/**
 * Maps OpenAI-style voice name to "use second voice" for two-speaker podcasts.
 * nova/alloy etc. are ignored for locale; we use them only to alternate between voice 1 and 2.
 */
function useSecondVoice(voice: string): boolean {
  const id = voice?.toLowerCase() ?? '';
  return (
    id === 'alloy' ||
    id === 'echo' ||
    id === 'onyx' ||
    id === 'fable' ||
    id === 'shimmer'
  );
}

export class AzureListeningTTSGateway implements ITTSGateway {
  constructor(private readonly params: AzureListeningTTSGatewayParams) {}

  async synthesize(params: TTSSynthesizeOptions): Promise<Uint8Array> {
    const locale = params.languageCode
      ? toAzureLocale(params.languageCode)
      : 'en-US';
    const second = useSecondVoice(params.voice);
    const voiceName = getAzureVoiceForLocale(locale, second);

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      this.params.subscriptionKey,
      this.params.region,
    );
    speechConfig.speechSynthesisLanguage = locale;
    speechConfig.speechSynthesisVoiceName = voiceName;
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;

    const rate =
      params.speed != null && params.speed !== 1
        ? `${((params.speed - 1) * 100).toFixed(0)}%`
        : '0%';
    const useSsml = rate !== '0%';
    const text = useSsml
      ? `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}"><voice name="${voiceName}"><prosody rate="${rate}">${escapeSsml(params.text)}</prosody></voice></speak>`
      : params.text;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, undefined);

    return new Promise((resolve, reject) => {
      const callback = (result: sdk.SpeechSynthesisResult) => {
        synthesizer.close();
        speechConfig.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(new Uint8Array(result.audioData));
        } else {
          reject(
            new Error(result.errorDetails || 'Azure TTS synthesis failed'),
          );
        }
      };
      if (useSsml) {
        synthesizer.speakSsmlAsync(text, callback, (err) => {
          synthesizer.close();
          speechConfig.close();
          reject(new Error(err ?? 'Speech synthesis error'));
        });
      } else {
        synthesizer.speakTextAsync(text, callback, (err) => {
          synthesizer.close();
          speechConfig.close();
          reject(new Error(err ?? 'Speech synthesis error'));
        });
      }
    });
  }
}

function escapeSsml(plain: string): string {
  return plain
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
