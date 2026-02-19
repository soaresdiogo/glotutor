/**
 * Client-side audio compression for reading evaluation.
 * Converts browser recording to 16kHz mono WAV before upload.
 * Reduces file size by ~80% and can eliminate server-side conversion when server skips convert for WAV.
 */

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.codePointAt(i) ?? 0);
  }
}

/**
 * Convert AudioBuffer to WAV Blob (16-bit PCM, mono, typically 16kHz).
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;
  const numberOfChannels = buffer.numberOfChannels;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;

  const dataSize = length * numberOfChannels * bytesPerSample;
  const bufferSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true);
  view.setUint16(32, numberOfChannels * bytesPerSample, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const channelData = buffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Compress recording blob to 16kHz mono WAV for evaluation upload.
 * Falls back to original blob on failure.
 */
export async function compressAudioForEvaluation(blob: Blob): Promise<Blob> {
  try {
    const start = performance.now?.() ?? Date.now();
    const audioContext = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const targetSampleRate = 16000;
    const duration = audioBuffer.duration;
    const offlineContext = new OfflineAudioContext(
      1,
      Math.ceil(duration * targetSampleRate),
      targetSampleRate,
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    const renderedBuffer = await offlineContext.startRendering();
    const wavBlob = audioBufferToWav(renderedBuffer);

    const elapsed = (performance.now?.() ?? Date.now()) - start;

    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV === 'development'
    ) {
      console.debug(
        `[Audio Compression] ${(blob.size / 1024).toFixed(0)}KB → ${(
          wavBlob.size / 1024
        ).toFixed(0)}KB in ${elapsed.toFixed(1)}ms`,
      );
    }

    return wavBlob;
  } catch (error) {
    console.warn('[Audio Compression] Failed, using original:', error);
    return blob;
  }
}
