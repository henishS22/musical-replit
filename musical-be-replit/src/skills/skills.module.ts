import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CollabRoleController, SkillsController, StylesController } from './skills.controller';
import { SkillsService } from './skills.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  SkillTypeSchema,
  // Style,
  StyleSchema,
  SkillLevelSchema,
  CollabRoleSchema,
  CollabRole
} from './schemas';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGODB_URI'),
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      // { name: Style.name, schema: StyleSchema },
      { name: 'styles', schema: StyleSchema },
      { name: 'skill_types', schema: SkillTypeSchema },
      { name: 'skill_levels', schema: SkillLevelSchema },
      { name: 'collabRoles', schema: CollabRoleSchema },
    ]),
  ],
  controllers: [SkillsController, StylesController, CollabRoleController],
  providers: [SkillsService],
})
export class SkillsModule implements OnModuleInit, OnModuleDestroy {
  /**
   * Defines the on moudule init function to subscribe to reply topics
   * @function
   */
  async onModuleInit() {
    return;
  }

  /**
   * Defines the on moudule destroy function to close connection
   * @function
   */
  async onModuleDestroy() {
    return;
  }
}
