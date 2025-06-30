import { Module, Logger } from '@nestjs/common';
import { IpfsService } from './ipfs-pinata.service';
import { IpfsPinataController } from './ipfs-pinata.controller';
import { SchemasModule } from '../schemas/schemas.module';

@Module({
  imports: [SchemasModule],
  controllers: [IpfsPinataController],
  providers: [IpfsService],
  exports: [IpfsService],
})
export class IpfsPinataModule {
  //Define the microservice to connect
  constructor() {
    return;
  }
  /**
   * Defines the on moudule init function to subscribe to reply topics
   * @function
   */
  async onModuleInit() {
    return Logger.log('Uploads Module initialized');
  }

  /**
   * Defines the on moudule destroy function to close connection
   * @function
   */
  async onModuleDestroy() {
    return Logger.log('Uploads Module destroyed');
  }
}
