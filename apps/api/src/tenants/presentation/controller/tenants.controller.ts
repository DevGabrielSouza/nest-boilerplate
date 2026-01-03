import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
} from '@nestjs/common';

import { TenantService } from 'apps/api/src/tenants/application/service/tenants.service';
import { CreateTenantWithUserDto } from 'apps/api/src/tenants/domain/dto/create-tenant-with-user.dto';
import { CreateTenantDto } from 'apps/api/src/tenants/domain/dto/create-tenant.dto';
import { UpdateTenantDto } from 'apps/api/src/tenants/domain/dto/update-tenant.dto';
import { TenantWithUserPresenter } from '../presenter/tenant-with-user.presenter';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Post('create-with-user')
  @HttpCode(201)
  async createTenantWithUser(@Body() createTenantDto: CreateTenantWithUserDto) {
    const result =
      await this.tenantService.createTenantWithUser(createTenantDto);
    return TenantWithUserPresenter.present(result);
  }

  @Get()
  findAll() {
    return this.tenantService.getAllTenants();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantService.getTenantById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.updateTenant(id, updateTenantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantService.deleteTenant(id);
  }
}
