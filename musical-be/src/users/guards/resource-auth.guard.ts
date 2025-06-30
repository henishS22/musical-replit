import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import {
  Collaboration,
  CollaborationDocument,
  Invite,
  InviteDocument,
} from '@/src/schemas/schemas';

export enum ResourceType {
  Collaborations,
  Invites,
}

const ResourceOwnerName = {
  [ResourceType.Collaborations]: 'userId',
  [ResourceType.Invites]: 'user',
};

export enum ResourceRoles {
  OWNERS,
  EDITORS,
  PRODUCERS,
  VIEWERS,
  ALL_MEMBERS,
}

export const ResourceAuthGuard = (
  resourceType: ResourceType,
  resourceRoles: ResourceRoles = ResourceRoles.VIEWERS,
): Type<any> => {
  class ResourceAuthGuardMixin implements CanActivate {
    constructor(
      @InjectModel(Collaboration.name)
      private collabModel: Model<CollaborationDocument>,
      @InjectModel(Invite.name)
      private inviteModel: Model<InviteDocument>,
    ) {}

    validateMethods = {
      [ResourceType.Collaborations]: (owner: string, resourceId: string) =>
        this.validUserCollaborations(owner, resourceId),
      [ResourceType.Invites]: (owner: string, resourceId: string) =>
        this.validUser(this.inviteModel, owner, resourceId),
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
      resourceId: string,
    ): Promise<boolean> {
      const resource = await model.findById(resourceId);

      if (!resource) {
        return true;
      }

      const ownerFieldName = ResourceOwnerName[resourceType];

      if (resource[ownerFieldName].toString() === owner) {
        return true;
      } else {
        return false;
      }
    }

    async validUserCollaborations(
      owner: string,
      resourceId: string,
    ): Promise<boolean> {
      const collab = await this.collabModel
        .findById(resourceId)
        .populate('projectId')
        .lean();

      if (!collab) {
        return true;
      }

      const ownerFieldName = ResourceOwnerName[resourceType];

      if (collab[ownerFieldName].toString() === owner) {
        return true;
      }

      const project: any = collab.projectId;

      if (!project) {
        return false;
      }

      const collaborator = project.collaborators?.find((collab: any) => {
        return collab.user.toString() === owner;
      });

      if (!collaborator) {
        return false;
      }

      if (resourceRoles === ResourceRoles.VIEWERS) {
        return true;
      }

      if (
        resourceRoles === ResourceRoles.OWNERS &&
        collaborator.permission === 'OWNER'
      ) {
        return true;
      }

      if (
        resourceRoles === ResourceRoles.PRODUCERS &&
        ['OWNER', 'EDITOR', 'PRODUCER'].includes(collaborator.permission)
      ) {
        return true;
      }

      return false;
    }
  }

  const guard = mixin(ResourceAuthGuardMixin);

  return guard;
};
