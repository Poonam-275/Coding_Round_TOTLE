import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../shared/jwt.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('exchange')
  @Public()
  async exchange(@Body('idToken') idToken: string) {
    return this.auth.exchangeFirebaseToken(idToken);
  }
}
