import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from 'apps/api/src/common/guards/auth.guard';
import { Roles } from 'apps/api/src/common/decorators/roles.decorator';
import { RoleGuard } from 'apps/api/src/common/guards/role.guard';
import { UsersService } from 'apps/api/src/users/application/service/users.service';
import { CreateUserDto } from 'apps/api/src/users/domain/dto/create-user.dto';
import { UpdateUserDto } from 'apps/api/src/users/domain/dto/update-user.dto';
import { Role } from 'apps/api/src/common/enums/role.enum';

@UseGuards(AuthGuard, RoleGuard)
@Controller('users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
