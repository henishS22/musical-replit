import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { ProjectDocument, Project } from '@/src/schemas/schemas';
import { ObjectId } from 'mongodb';

export const ProjectsAuthGuard = (): Type<any> => {
  class ProjectsAuthGuardMixin implements CanActivate {
    constructor(
      @InjectModel(Project.name)
      private projectModel: Model<ProjectDocument>,
    ) {}

    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const owner = context.getArgs()[0]?.value?.owner;
      const id = context.getArgs()[0]?.value?.id;
      return this.validUser(owner, id);
    }

    async validUser(owner: string, projectId: string): Promise<boolean> {
      const projectFound = await this.projectModel.findById(
        new ObjectId(projectId?.toString()),
      );

      if (!projectFound || projectFound.isPublic) {
        return true;
      }

      const filterCollaborators =
        projectFound.collaborators
          ?.map((collaborator: any) => collaborator.user?.toString())
          .filter((collaborator: any) => !!collaborator) || [];

      const collaboratorIds = [
        projectFound.user.toString(),
        ...filterCollaborators,
      ];

      if (collaboratorIds.includes(owner)) {
        return true;
      } else {
        return false;
      }
    }
  }

  const guard = mixin(ProjectsAuthGuardMixin);

  return guard;
};
