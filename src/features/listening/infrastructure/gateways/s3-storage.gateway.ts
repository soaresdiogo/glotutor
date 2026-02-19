import type { IStorageGateway } from '@/features/listening/domain/ports/storage-gateway.interface';
import { uploadAudioBuffer } from '@/shared/lib/reading/s3-upload';

export class S3StorageGateway implements IStorageGateway {
  async uploadAudio(
    pathHint: string,
    body: Uint8Array,
    contentType: string,
  ): Promise<string | null> {
    return uploadAudioBuffer(pathHint, body, contentType);
  }
}
