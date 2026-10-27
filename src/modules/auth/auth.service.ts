import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../../database/entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(body: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    if (!body.email || !body.password || !body.fullName) {
      throw new BadRequestException('Full name, email, and password are required');
    }

    const emailNormalized = body.email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({
      where: { email: emailNormalized },
    });

    if (existing) {
      throw new BadRequestException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await this.userRepo.save(
      this.userRepo.create({
        fullName: body.fullName.trim(),
        email: emailNormalized,
        passwordHash,
        phone: body.phone || '',
        role: 'CUSTOMER',
      }),
    );

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    };
  }

  async login(body: { email: string; password: string }) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }

    const emailNormalized = body.email.trim().toLowerCase();
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: emailNormalized })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        shippingAddress: user.shippingAddress,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
