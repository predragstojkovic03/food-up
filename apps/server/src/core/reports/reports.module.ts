import { Module, Provider } from '@nestjs/common';
import { ChangeRequestsModule } from '../change-requests/change-requests.module';
import { IdentityModule } from '../identity/identity.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { I_MAIL_SERVICE } from 'src/shared/infrastructure/notifications/mail.service.interface';
import { MockMailService } from 'src/shared/infrastructure/notifications/mock-mail.service';
import { ReportsService } from './application/reports.service';
import {
  I_ORDER_SUMMARY_QUERY_REPOSITORY,
} from './application/queries/order-summary-query-repository.interface';
import {
  I_ORDER_SUMMARY_SENDS_REPOSITORY,
} from './domain/order-summary-sends.repository.interface';
import { OrderSummaryQueryTypeOrmRepository } from './infrastructure/persistence/order-summary-query-typeorm.repository';
import { OrderSummarySendsTypeOrmRepository } from './infrastructure/persistence/order-summary-sends-typeorm.repository';
import { ReportsController } from './presentation/rest/reports.controller';

const OrderSummaryQueryRepositoryProvider: Provider = {
  provide: I_ORDER_SUMMARY_QUERY_REPOSITORY,
  useClass: OrderSummaryQueryTypeOrmRepository,
};

const OrderSummarySendsRepositoryProvider: Provider = {
  provide: I_ORDER_SUMMARY_SENDS_REPOSITORY,
  useClass: OrderSummarySendsTypeOrmRepository,
};

@Module({
  imports: [SuppliersModule, IdentityModule, ChangeRequestsModule],
  controllers: [ReportsController],
  providers: [
    OrderSummaryQueryRepositoryProvider,
    OrderSummarySendsRepositoryProvider,
    { provide: I_MAIL_SERVICE, useClass: MockMailService },
    ReportsService,
  ],
  exports: [ReportsService, OrderSummaryQueryRepositoryProvider],
})
export class ReportsModule {}
