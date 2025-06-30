import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { SchemasModule } from '../schemas/schemas.module';
import { ProjectsModule } from '../projects/projects.module';
import { ProjectGetterService } from '../projects/services/projectGetter.service';
import { KazmService } from '../kazm/kazm.service';

@Module({
  imports: [SchemasModule, UsersModule, ProjectsModule],
  controllers: [RegisterController],
  providers: [UsersService, RegisterService, ProjectGetterService, KazmService],
})
export class RegisterModule implements OnModuleInit, OnModuleDestroy {
  //Define the microservice to connect
  constructor() {
    return;
  }

  /**
   * Defines the on moudule init function to subscribe to reply topics
   * @function
   */
  async onModuleInit() {
    await Logger.log('Register Module Init');
  }

  /**
   * Defines the on moudule destroy function to close connection
   * @function
   */
  async onModuleDestroy() {
    await Logger.log('Register Module Destroyed');
  }
}
