import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import {
  LyricsDocument,
  ProjectDocument,
  TrackDocument,
  Track,
  Folder,
  Project,
  Lyrics,
} from '@/src/schemas/schemas';

export enum ResourceType {
  Tracks,
  Folders,
  Projects,
  Lyrics,
}

const ResourceOwnerName = {
  [ResourceType.Tracks]: 'user_id',
  [ResourceType.Folders]: 'user_id',
  [ResourceType.Projects]: 'user',
  [ResourceType.Lyrics]: 'user_id',
};

export const ResourceAuthGuard = (resourceType: ResourceType): Type<any> => {
  class ResourceAuthGuardMixin implements CanActivate {
    constructor(
      @InjectModel(Track.name)
      private tracksModel: Model<TrackDocument>,
      @InjectModel(Folder.name)
      private foldersModel: Model<TrackDocument>,
      @InjectModel(Project.name)
      private projectModel: Model<ProjectDocument>,
      @InjectModel(Lyrics.name)
      private lyricsModel: Model<LyricsDocument>,
    ) {}

    validateMethods = {
      [ResourceType.Tracks]: (owner: string, resourceId: string) =>
        this.validUser(this.tracksModel, owner, resourceId),

      [ResourceType.Folders]: (owner: string, resourceId: string) =>
        this.validUser(this.foldersModel, owner, resourceId),

      [ResourceType.Projects]: (owner: string, resourceId: string) =>
        this.validUser(this.projectModel, owner, resourceId),

      [ResourceType.Lyrics]: (owner: string, resourceId: string) =>
        this.validUser(this.lyricsModel, owner, resourceId),
    };

    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const owner = context.getArgs()[0]?.value?.owner;
      const id = context.getArgs()[0]?.value?.id;
      return this.validateMethods[resourceType](owner, id);
    }

    async validUser(
      model: Model<any>,
      owner: string,
      resourceId: string | string[],
    ): Promise<boolean> {
      if (!Array.isArray(resourceId)) {
        resourceId = [resourceId];
      }

      const resources = await model.find().where('_id').in(resourceId).exec();

      if (!resources?.length) {
        return true;
      }

      const ownerFieldName = ResourceOwnerName[resourceType];

      if (
        resources.some(
          (resource) => resource[ownerFieldName].toString() !== owner,
        )
      ) {
        return false;
      }

      return true;
    }
  }

  const guard = mixin(ResourceAuthGuardMixin);

  return guard;
};
