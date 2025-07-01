import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import {
  LyricsDocument,
  ProjectDocument,
  Project,
  Lyrics,
} from '@/src/schemas/schemas';
import { ObjectId } from 'mongodb';

export const LyricsAuthGuard = (): Type<any> => {
  class LyricsAuthGuardMixin implements CanActivate {
    constructor(
      @InjectModel(Project.name)
      private projectModel: Model<ProjectDocument>,
      @InjectModel(Lyrics.name)
      private lyricsModel: Model<LyricsDocument>,
    ) { }

    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      // const owner = context.getArgs()[0]?.value?.owner;
      // const id = context.getArgs()[0]?.value?.id;
      const owner = context.getArgs()[0].params?.owner;
      const id = context.getArgs()[0].params?.lyrics_id;
      return this.validUser(owner, id);
    }

    async validUser(owner: string, lyricsId: string): Promise<boolean> {
      const lyrics = await this.lyricsModel.findById(
        new ObjectId(lyricsId?.toString()),
      );

      if (!lyrics) {
        return false;
      }

      const hasProjectId = lyrics?.project_id;

      if (hasProjectId) {
        const projectFound = await this.projectModel.findById(
          new ObjectId(lyrics?.project_id?.toString()),
        );

        const filterCollaborators =
          projectFound.collaborators
            ?.filter((collaborator: any) =>
              ['UPLOAD_DOWNLOAD', 'UPLOAD_ONLY', 'OWNER'].includes(collaborator.permission),
            )
            ?.map((collaborator: any) => collaborator.user?.toString())
            .filter((collaborator: any) => !!collaborator) || [];

        const collaboratorIds = [
          projectFound.user.toString(),
          ...filterCollaborators,
        ];

        return collaboratorIds.includes(owner);
      }

      return lyrics.user_id.toString() === owner;
    }
  }

  const guard = mixin(LyricsAuthGuardMixin);

  return guard;
};
