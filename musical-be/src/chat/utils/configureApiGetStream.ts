import { StreamChat } from 'stream-chat';
import { ConfigService } from '@nestjs/config';

export default async function configureApiGetStream() {
  const configService = new ConfigService();

  const client = StreamChat.getInstance(
    configService.get<string>('PUBLIC_KEY_GETSTREAM'),
    configService.get<string>('PRIVATE_KEY_GETSTREAM'),
  );

  await client.updateAppSettings({
    webhook_url: configService.get<string>('PUBLIC_API_ADDRESS'),
  });

  client
    .createChannelType({
      name: 'collaborations',
    })
    .catch(() => null);

  client
    .createChannelType({
      name: 'projects',
    })
    .catch(() => null);
}
