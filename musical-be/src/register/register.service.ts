import { Injectable, Inject } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { createRegisterDto } from './dto/createRegister.dto';

@Injectable()
export class RegisterService {
  //Define the microservice to connect
  constructor(
    @Inject(UsersService) private readonly userService: UsersService,
  ) {}

  async registerUser(createRegisterDto: createRegisterDto) {
    return await this.userService.createSubscription(createRegisterDto);
  }
}
