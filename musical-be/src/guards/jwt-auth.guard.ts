import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/schemas';

const secret_key = process.env.SECRET_KEY;

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization as string;
    const method = context.getHandler().name;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const auth = verify(token.split(' ')[1], secret_key) as any;
      if (
        process.env.INVITE_ACCOUNT === 'true' &&
        auth.invited === 'false' &&
        method !== 'validateInvite'
      ) {
        return false;
      }

      // Fetch user from database
      const user = await this.userModel.findById(auth.sub).exec();

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.isBanned) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      req.params.owner = auth.sub;
      // Attach userId to req.user
      req.user = { id: auth.sub };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}











// import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
// import { verify } from 'jsonwebtoken';
// import { Observable } from 'rxjs';

// const secret_key = process.env.SECRET_KEY;

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const req = context.switchToHttp().getRequest();
//     const token = req.headers.authorization as string;
//     const method = context.getHandler().name;

//     if (!token) {
//       throw new UnauthorizedException('No token provided');
//     }

//     try {
//       const auth = verify(token.split(' ')[1], secret_key) as any;
//       if (
//         process.env.INVITE_ACCOUNT === 'true' &&
//         auth.invited === 'false' &&
//         method !== 'validateInvite'
//       ) {
//         return false;
//       }

//       if (auth.sub) {
//         req.params.owner = auth.sub;
//         return true;
//       } else {
//         throw new UnauthorizedException('Invalid token payload');
//       }
//     } catch (error) {
//       throw new UnauthorizedException('Invalid or expired token');
//     }
//   }
// }


