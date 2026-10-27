import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard, AdminGuard } from './jwt-auth.guard';

@Global()
@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret:
        process.env.JWT_SECRET || 'super_secret_3d_electronics_jwt_key_2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, AdminGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, AdminGuard],
})
export class AuthModule {}
