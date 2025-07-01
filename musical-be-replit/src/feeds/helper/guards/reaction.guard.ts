import { ReactionsTypes } from '../utils/enums';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  mixin,
  Type,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { GetStreamService } from '../services/getStream.service';

export const ReactionGuard = (reactionType?: ReactionsTypes): Type<any> => {
  class ReactionGuardMixin implements CanActivate {
    constructor(
      @Inject(GetStreamService)
      private readonly getStreamService: GetStreamService,
    ) {}

    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const { owner, reactionId } = context.getArgs()[0]?.value;

      return this.userOwnsReaction(reactionId, owner);
    }

    private async userOwnsReaction(
      reactionId: string,
      userId: string,
    ): Promise<boolean> {
      const reaction = await this.getStreamService.getReaction(reactionId);

      if (!reaction || (reactionType && reaction.kind !== reactionType)) {
        return false;
      }

      return reaction.user_id === userId;
    }
  }

  const guard = mixin(ReactionGuardMixin);

  return guard;
};
