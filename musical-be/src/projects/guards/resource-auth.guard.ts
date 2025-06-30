import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import {
  Project,
  ProjectDocument,
  Release,
  ReleaseDocument,
} from '@/src/schemas/schemas';
import { Collaborator } from '../utils/types';
import { ObjectId } from 'mongodb';

export enum ResourceType {
  Project,
  Release,
}

export enum ResourceRoles {
  OWNERS,
  EDITORS,
  PRODUCERS,
  VIEWERS,
  ALL_MEMBERS,
}

export const ResourceAuthGuard = (
  resourceType: ResourceType,
  resourceRole: ResourceRoles = ResourceRoles.VIEWERS,
): Type<any> => {
  class ResourceAuthGuardMixin implements CanActivate {
    private owner: string;
    private id: string;

    constructor(
      @InjectModel(Project.name)
      private projectModel: Model<ProjectDocument>,
      @InjectModel(Release.name)
      private releaseModel: Model<ReleaseDocument>,
    ) { }

    validateMethods = {
      [ResourceType.Project]: () => this.validUserProject(),
      [ResourceType.Release]: () => this.validUserRelease(),
    };

    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const req = context.switchToHttp().getRequest();
      const owner = req.params.owner;
      const id = req.params.id;

      this.owner = owner;
      this.id = id;

      return this.validateMethods[resourceType]();
    }

    async validUserProject(): Promise<boolean> {
      let project;

      if (this.id) {
        project = await this.projectModel.findById(
          new ObjectId(this.id?.toString()),
        );
      }

      if (!project && !!this.owner) {
        return true;
      }

      const { user, collaborators, isPublic } = project || {};

      // if user is OG owner, let them pass
      const isOriginalOwner = user?.toString() === this.owner;
      if (isOriginalOwner) {
        return true;
      }

      if (isPublic) {
        return true;
      }

      const collaborator = collaborators.find(
        (collab: Collaborator) => collab?.user?.toString() === this?.owner,
      );

      // if (!collaborator) {
      //   return false;
      // }

      // viewers and project is public?
      if (resourceRole === ResourceRoles.VIEWERS) {
        return true;
      }

      // this is for users that didn't create the project originally
      // but were added as owners later on.
      if (
        resourceRole === ResourceRoles.OWNERS &&
        collaborator.permission === 'OWNER'
      ) {
        return true;
      }

      if (
        resourceRole === ResourceRoles.EDITORS &&
        ['OWNER', 'EDITOR'].includes(collaborator.permission)
      ) {
        return true;
      }

      if (
        resourceRole === ResourceRoles.ALL_MEMBERS &&
        ['OWNER', 'EDITOR', 'PRODUCER', 'VIEW_ONLY'].includes(
          collaborator.permission,
        )
      ) {
        return true;
      }

      const result =
        resourceRole === ResourceRoles.PRODUCERS &&
        ['OWNER', 'EDITOR', 'PRODUCER'].includes(collaborator.permission);

      return result;
    }

    async validUserRelease(): Promise<boolean> {
      const release = await this.releaseModel.findById(
        new ObjectId(this.id?.toString()),
      );

      if (!release) {
        return true;
      }

      if (release.user.toString() === this.owner) {
        return true;
      }

      this.id = release.project.toString() as string;

      const validateUserProjectRes = await this.validUserProject();

      return validateUserProjectRes;
    }
  }

  const guard = mixin(ResourceAuthGuardMixin);

  return guard;
};
