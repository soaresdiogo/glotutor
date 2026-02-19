import type { IStudentProfileProvider } from '@/features/listening/domain/ports/student-profile-provider.interface';
import type {
  IPodcastRepository,
  PodcastListItemEntity,
} from '@/features/listening/domain/repositories/podcast-repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

export interface IGetPodcastListUseCase {
  execute(userId: string): Promise<PodcastListItemEntity[]>;
}

export class GetPodcastListUseCase implements IGetPodcastListUseCase {
  constructor(
    private readonly podcastRepo: IPodcastRepository,
    private readonly profileProvider: IStudentProfileProvider,
  ) {}

  async execute(userId: string): Promise<PodcastListItemEntity[]> {
    const profile = await this.profileProvider.getProfile(userId);
    if (!profile) {
      throw new NotFoundError(
        'Student profile not found.',
        'listening.api.profileNotFound',
      );
    }
    let podcasts = await this.podcastRepo.findManyByLanguageAndLevel(
      profile.languageCode,
      profile.cefrLevel,
      userId,
    );
    if (podcasts.length === 0 && profile.languageCode !== 'en') {
      podcasts = await this.podcastRepo.findManyByLanguageAndLevel(
        'en',
        profile.cefrLevel,
        userId,
      );
    }
    return podcasts;
  }
}
