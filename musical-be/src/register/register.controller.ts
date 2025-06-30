import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { createRegisterDto } from './dto/createRegister.dto';

// Services Imports
import { RegisterService } from './register.service';

@Controller('register')
@ApiTags('Register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post()
  @ApiOperation({
    summary: 'Register a new contact on database and Hubspot',
  })
  @ApiOkResponse({
    description: 'The contact was registered successfully',
  })
  @ApiBadRequestResponse({
    description: 'The contact was not registered due to invalid request data',
  })
  sendRegisterEmail(@Body() register: createRegisterDto) {
    return this.registerService.registerUser(register);
  }
}
