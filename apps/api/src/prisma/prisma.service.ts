import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit {
  private prisma = new PrismaClient();

  async onModuleInit() {
    await this.prisma.$connect();
  }

  get user() {
    return this.prisma.user;
  }

  get service() {
    return this.prisma.service;
  }

  get exchange() {
    return this.prisma.exchange;
  }

  get location() {
    return this.prisma.location;
  }

  get skill() {
    return this.prisma.skill;
  }

  get notification() {
    return this.prisma.notification;
  }

  get rating() {
    return this.prisma.rating;
  }
}
