/**
 * Shared WAV buffer splitting for chunked processing (e.g. Azure Speech ~30s limit).
 */

export const WAV_HEADER_SIZE = 44;

export function isWav(buffer: Buffer): boolean {
  return (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WAVE'
  );
}

export function getWavDurationSeconds(buffer: Buffer): number | null {
  if (!isWav(buffer) || buffer.length < WAV_HEADER_SIZE) return null;
  const sampleRate = buffer.readUInt32LE(24);
  const numChannels = buffer.readUInt16LE(22);
  const bitsPerSample = buffer.readUInt16LE(34) || 16;
  const bytesPerSample = (bitsPerSample / 8) * numChannels;
  const dataBytes = buffer.length - WAV_HEADER_SIZE;
  const numSamples = Math.floor(dataBytes / bytesPerSample);
  return numSamples / sampleRate;
}

/**
 * Split a WAV buffer into consecutive chunks of up to maxChunkDurationSec seconds.
 * Returns null if not WAV, or duration <= minDurationToSplitSec (no split needed).
 * Each chunk is a valid WAV with the same header and a slice of PCM data.
 */
export function splitWavIntoChunks(
  buffer: Buffer,
  maxChunkDurationSec: number,
  minDurationToSplitSec: number,
): Buffer[] | null {
  if (!isWav(buffer) || buffer.length <= WAV_HEADER_SIZE) return null;
  const sampleRate = buffer.readUInt32LE(24);
  const numChannels = buffer.readUInt16LE(22);
  const bitsPerSample = buffer.readUInt16LE(34) || 16;
  const bytesPerSample = (bitsPerSample / 8) * numChannels;
  const totalDataBytes = buffer.length - WAV_HEADER_SIZE;
  const totalSamples = Math.floor(totalDataBytes / bytesPerSample);
  const durationSec = totalSamples / sampleRate;
  if (durationSec <= minDurationToSplitSec) return null;

  const samplesPerChunk = Math.floor(sampleRate * maxChunkDurationSec);
  const bytesPerChunk = samplesPerChunk * bytesPerSample;
  const chunks: Buffer[] = [];
  let offset = WAV_HEADER_SIZE;
  while (offset < buffer.length) {
    const remaining = buffer.length - offset;
    const take = Math.min(remaining, bytesPerChunk);
    if (take < bytesPerSample) break;
    const chunkDataSize = take;
    const chunk = Buffer.alloc(WAV_HEADER_SIZE + chunkDataSize);
    buffer.copy(chunk, 0, 0, WAV_HEADER_SIZE);
    buffer.copy(chunk, WAV_HEADER_SIZE, offset, offset + chunkDataSize);
    chunk.writeUInt32LE(36 + chunkDataSize, 4);
    chunk.writeUInt32LE(chunkDataSize, 40);
    chunks.push(chunk);
    offset += chunkDataSize;
  }
  return chunks.length > 1 ? chunks : null;
}
