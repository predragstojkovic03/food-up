import { Module, Provider } from '@nestjs/common';
import { MailModule } from 'src/shared/infrastructure/notifications/mail/mail.module';
import { ChangeRequestsModule } from '../change-requests/change-requests.module';
import { IdentityModule } from '../identity/identity.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { I_ORDER_SUMMARY_QUERY_REPOSITORY } from './application/queries/order-summary-query-repository.interface';
import { ReportsService } from './application/reports.service';
import { I_ORDER_SUMMARY_SENDS_REPOSITORY } from './domain/order-summary-sends.repository.interface';
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
  imports: [MailModule, SuppliersModule, IdentityModule, ChangeRequestsModule],
  controllers: [ReportsController],
  providers: [
    OrderSummaryQueryRepositoryProvider,
    OrderSummarySendsRepositoryProvider,
    ReportsService,
  ],
  exports: [ReportsService, OrderSummaryQueryRepositoryProvider],
})
export class ReportsModule {}
