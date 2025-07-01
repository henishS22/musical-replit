import { ApiProperty } from '@nestjs/swagger';

export class ChannelResponse {
  @ApiProperty({
    description: 'The name of the channel (needs to be unique)',
  })
  channelName: string;

  @ApiProperty({
    description: 'The id of channel (needs to be unique)',
  })
  channelId: string;

  @ApiProperty({
    description: 'A *optional* image used to describe the channel',
  })
  image: string;

  @ApiProperty({
    description: 'The type of chat channel',
    enum: ['messaging', 'projects', 'collaborators'],
  })
  type: string;

  @ApiProperty({
    description: 'The list of participants (User ObjectIDs)',
    type: [String],
  })
  team: string[];
}
