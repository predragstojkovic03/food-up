import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeRequestsService } from './application/change-requests.service';
import { ChangeRequestsRepositoryProvide } from './infrastructure/change-requests.providers';
import { ChangeRequest } from './infrastructure/persistence/change-request.typeorm-entity';
import { ChangeRequestsController } from './presentation/rest/change-requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChangeRequest])],
  controllers: [ChangeRequestsController],
  providers: [ChangeRequestsRepositoryProvide, ChangeRequestsService],
})
export class ChangeRequestsModule {}
