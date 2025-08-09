import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: Request & { user: { id: string } }) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) return null;
    const { password, currentHashedRefreshToken, ...rest } = user as any;
    return rest;
  }

  @Patch('me')
  async updateMe(
    @Req() req: Request & { user: { id: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.update(req.user.id, updateUserDto);
    const user = await this.usersService.findById(req.user.id);
    if (!user) return null;
    const { password, currentHashedRefreshToken, ...rest } = user as any;
    return rest;
  }

  @Post('me/profile-picture')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async uploadProfilePicture(
    @Req() req: Request & { user: { id: string } },
    @UploadedFile() file: any,
  ) {
    const profilePictureUrl = `/uploads/${file.filename}`;
    await this.usersService.update(req.user.id, { profilePictureUrl });
    return { profilePictureUrl };
  }
}
