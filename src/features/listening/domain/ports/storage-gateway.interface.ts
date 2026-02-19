export interface IStorageGateway {
  /**
   * Upload audio buffer and return the public URL.
   * pathHint e.g. "podcasts/en/A1/abc-123.mp3"
   */
  uploadAudio(
    pathHint: string,
    body: Uint8Array,
    contentType: string,
  ): Promise<string | null>;
}
