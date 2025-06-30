import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { RolesEnum } from '../utils/enums';
import { User, UserDocument } from '../schemas';
import { verify } from 'jsonwebtoken';

export const RoleAuthGuard = (validRoles: RolesEnum[]): Type<any> => {
  class RoleAuthGuardMixin implements CanActivate {
    constructor(
      @InjectModel(User.name)
      private usersModel: Model<UserDocument>,
    ) {}

    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const req = context.switchToHttp().getRequest();
      const token = req.headers.authorization as string;
      const auth = verify(token.split(' ')[1], process.env.SECRET_KEY) as any;
      return this.userHasValidRole(auth.sub);
    }

    async userHasValidRole(userIdId: string): Promise<boolean> {
      const user = await this.usersModel
        .findOne({
          _id: userIdId,
          roles: {
            $in: validRoles,
          },
        })
        .exec();
      return !!user;
    }
  }

  const guard = mixin(RoleAuthGuardMixin);

  return guard;
};
