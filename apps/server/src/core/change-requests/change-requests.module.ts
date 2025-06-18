import { Module } from '@nestjs/common';
import { ChangeRequestsController } from './presentation/rest/change-requests.controller';

@Module({
  imports: [],
  controllers: [ChangeRequestsController],
  providers: [],
})
export class ChangeRequestsModule {}