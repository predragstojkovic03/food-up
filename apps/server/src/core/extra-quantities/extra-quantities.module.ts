import { Module, Provider } from '@nestjs/common';
import { ExtraQuantitiesService } from './application/extra-quantities.service';
import { I_EXTRA_QUANTITIES_REPOSITORY } from './domain/extra-quantities.repository.interface';
import { ExtraQuantitiesTypeOrmRepository } from './infrastructure/persistence/extra-quantities-typeorm.repository';
import { ExtraQuantitiesController } from './presentation/rest/extra-quantities.controller';

const ExtraQuantitiesRepositoryProvider: Provider = {
  provide: I_EXTRA_QUANTITIES_REPOSITORY,
  useClass: ExtraQuantitiesTypeOrmRepository,
};

@Module({
  controllers: [ExtraQuantitiesController],
  providers: [ExtraQuantitiesRepositoryProvider, ExtraQuantitiesService],
  exports: [ExtraQuantitiesService],
})
export class ExtraQuantitiesModule {}
