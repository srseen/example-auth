import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user', 'admin')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: Request & { user: { id: string; role: string } }) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) return null;
    const { password, currentHashedRefreshToken, ...rest } = user;
    return rest;
  }

  @Patch('me')
  async updateMe(
    @Req() req: Request & { user: { id: string; role: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.update(req.user.id, updateUserDto);
    const user = await this.usersService.findById(req.user.id);
    if (!user) return null;
    const { password, currentHashedRefreshToken, ...rest } = user;
    return rest;
  }

  @Post('me/profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(
            file.originalname,
          )}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: Number(process.env.UPLOAD_MAX_FILE_SIZE) || 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Only image files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadProfilePicture(
    @Req() req: Request & { user: { id: string; role: string } },
    @UploadedFile() file: { filename: string },
  ) {
    const profilePictureUrl = `/uploads/${file.filename}`;
    await this.usersService.update(req.user.id, { profilePictureUrl });
    return { profilePictureUrl };
  }

  @Patch('me/password')
  async changePassword(
    @Req() req: Request & { user: { id: string; role: string } },
    @Body() body: ChangePasswordDto,
  ) {
    await this.usersService.updatePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
    return { success: true };
  }

  @Delete('me')
  async deleteMe(@Req() req: Request & { user: { id: string; role: string } }) {
    await this.usersService.remove(req.user.id);
    return { success: true };
  }
}
