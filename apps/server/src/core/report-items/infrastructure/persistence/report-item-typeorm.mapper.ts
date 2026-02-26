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

  toPersistencePartial(domain: Partial<ReportItem>): Partial<ReportItemPersistence> {
    const persistence: Partial<ReportItemPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.reportId !== undefined) persistence.reportId = domain.reportId;
    if (domain.menuItemId !== undefined) persistence.menuItemId = domain.menuItemId;
    if (domain.date !== undefined) persistence.date = domain.date;
    if (domain.quantity !== undefined) persistence.quantity = domain.quantity;
    return persistence;
  }
}
