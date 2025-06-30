import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { StreamChat } from 'stream-chat';

const PUBLIC_KEY_GETSTREAM = process.env.PUBLIC_KEY_GETSTREAM;
const PRIVATE_KEY_GETSTREAM = process.env.PRIVATE_KEY_GETSTREAM;

@Injectable()
export class getStreamGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const client = StreamChat.getInstance(
        PUBLIC_KEY_GETSTREAM,
        PRIVATE_KEY_GETSTREAM,
      );

      return client.verifyWebhook(req.body, req.headers['x-signature']);
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
