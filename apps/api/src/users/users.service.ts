import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../persistence/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  async findById(id: number) {
    return this.prisma.users.findUnique({
      where: { id },
    });
  }

  async create(
    email: string,
    password: string,
    username: string,
    firstName?: string,
    lastName?: string,
  ) {
    const hashedPassword = await hash(password, 10);

    return this.prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        username,
        first_name: firstName,
        last_name: lastName,
      },
    });
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return compare(plainPassword, hashedPassword);
  }
}
