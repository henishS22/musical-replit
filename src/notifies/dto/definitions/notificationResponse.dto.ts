import { UserResponseDto } from '@/src/docs/dto/userResponse.dto';
import { ApiProperty } from '@nestjs/swagger';
import { NotifyTypeEnum } from '../../utils/enums';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'The notification ID',
  })
  _id: string;

  @ApiProperty({
    description: 'The notification origin',
    type: UserResponseDto,
  })
  from: UserResponseDto;

  @ApiProperty({
    description: 'The notification target',
    type: UserResponseDto,
  })
  to: UserResponseDto;

  @ApiProperty({
    description: 'The notification data. Depends on the type of notification',
  })
  data: Record<string, any>;

  @ApiProperty({
    description: 'The notification type',
    enum: NotifyTypeEnum,
  })
  type: NotifyTypeEnum;

  @ApiProperty({
    description:
      'The notification resource. Depends on the type of notification',
  })
  resource: any;

  @ApiProperty({
    description: 'Indicates if the notification was viewed',
  })
  viewed: boolean;
}
