export type UpdateUserAccessLogInput = {
  userId: string;
  email: string;
  ipAddress: string;
  userAgent: string;
};

export interface IUpdateUserAccessLogUseCase {
  execute(input: UpdateUserAccessLogInput): Promise<void>;
}

export interface IAccessLogRepository {
  create(input: {
    userId: string;
    email: string;
    ipAddress: string | null;
    deviceInfo: string | null;
    status: string;
  }): Promise<void>;
}

export class UpdateUserAccessLogUseCase implements IUpdateUserAccessLogUseCase {
  constructor(private readonly accessLogRepo: IAccessLogRepository) {}

  async execute(input: UpdateUserAccessLogInput): Promise<void> {
    await this.accessLogRepo.create({
      userId: input.userId,
      email: input.email,
      ipAddress: input.ipAddress || null,
      deviceInfo: input.userAgent?.slice(0, 500) || null,
      status: 'success',
    });
  }
}
