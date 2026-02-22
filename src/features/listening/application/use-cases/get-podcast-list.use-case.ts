import type { IStudentProfileProvider } from '@/features/listening/domain/ports/student-profile-provider.interface';
import type {
  IPodcastRepository,
  PodcastListItemEntity,
} from '@/features/listening/domain/repositories/podcast-repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

export interface GetPodcastListParams {
  language?: string;
  level?: string;
}

export interface IGetPodcastListUseCase {
  execute(
    userId: string,
    params?: GetPodcastListParams,
  ): Promise<PodcastListItemEntity[]>;
}

export class GetPodcastListUseCase implements IGetPodcastListUseCase {
  constructor(
    private readonly podcastRepo: IPodcastRepository,
    private readonly profileProvider: IStudentProfileProvider,
  ) {}

  async execute(
    userId: string,
    params?: GetPodcastListParams,
  ): Promise<PodcastListItemEntity[]> {
    const profile = await this.profileProvider.getProfile(userId);
    if (!profile) {
      throw new NotFoundError(
        'Student profile not found.',
        'listening.api.profileNotFound',
      );
    }
    const languageCode = params?.language ?? profile.languageCode;
    const cefrLevel = params?.level ?? profile.cefrLevel;
    let podcasts = await this.podcastRepo.findManyByLanguageAndLevel(
      languageCode,
      cefrLevel,
      userId,
    );
    if (podcasts.length === 0 && languageCode !== 'en') {
      podcasts = await this.podcastRepo.findManyByLanguageAndLevel(
        'en',
        cefrLevel,
        userId,
      );
    }
    return podcasts;
  }
}
