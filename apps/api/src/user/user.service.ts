import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    const userProfile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        credits: true,
        location: true,
        skills: { select: { id: true, name: true } },
        services: {
          select: { id: true, title: true, isActive: true },
          where: { isActive: true },
        },
      },
    });

    if (!userProfile) {
      throw new NotFoundException('User profile not found.');
    }

    return userProfile;
  }
}
