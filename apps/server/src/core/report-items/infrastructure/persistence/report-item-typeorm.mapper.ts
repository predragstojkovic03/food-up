import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { ReportItem } from '../../domain/report-item.entity';
import { ReportItem as ReportItemPersistence } from './report-item.typeorm-entity';

export class ReportItemTypeOrmMapper extends TypeOrmMapper<
  ReportItem,
  ReportItemPersistence
> {
  toDomain(persistence: ReportItemPersistence): ReportItem {
    return new ReportItem(
      persistence.id,
      persistence.reportId,
      persistence.menuItemId,
      persistence.date,
      persistence.quantity,
    );
  }

  toPersistence(domain: ReportItem): ReportItemPersistence {
    const persistence = new ReportItemPersistence();
    persistence.id = domain.id;
    persistence.reportId = domain.reportId;
    persistence.menuItemId = domain.menuItemId;
    persistence.date = domain.date;
    persistence.quantity = domain.quantity;
    return persistence;
  }
}
