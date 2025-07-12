import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service.js';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // In a real app, you'd get the userId from an auth guard
  // For now, we'll pass it as a parameter for testing
  @Get(':id/profile')
  async getUserProfile(@Param('id') id: string) {
    try {
      return await this.userService.getUserProfile(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
