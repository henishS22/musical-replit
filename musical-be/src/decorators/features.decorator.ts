import { SetMetadata } from '@nestjs/common';

export const Features = (features: { featureKey: string; requestedUsage?: number }[]) =>
  SetMetadata('features', features);