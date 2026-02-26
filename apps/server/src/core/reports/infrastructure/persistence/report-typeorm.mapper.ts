import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { Report } from '../../domain/report.entity';
import { Report as ReportPersistence } from './report.typeorm-entity';

export class ReportTypeOrmMapper extends TypeOrmMapper<
  Report,
  ReportPersistence
> {
  toDomain(persistence: ReportPersistence): Report {
    return new Report(
      persistence.id,
      persistence.supplierId,
      persistence.mealSelectionWindowId,
      persistence.generatedAt,
      persistence.type,
      persistence.isScheduled,
      persistence.scheduledFor,
    );
  }

  toPersistence(domain: Report): ReportPersistence {
    const persistence = new ReportPersistence();
    persistence.id = domain.id;
    persistence.supplierId = domain.supplierId;
    persistence.mealSelectionWindowId = domain.mealSelectionWindowId;
    persistence.generatedAt = domain.generatedAt;
    persistence.type = domain.type;
    persistence.isScheduled = domain.isScheduled;
    persistence.scheduledFor = domain.scheduledFor;
    return persistence;
  }

  toPersistencePartial(domain: Partial<Report>): Partial<ReportPersistence> {
    const persistence: Partial<ReportPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.supplierId !== undefined) persistence.supplierId = domain.supplierId;
    if (domain.mealSelectionWindowId !== undefined) persistence.mealSelectionWindowId = domain.mealSelectionWindowId;
    if (domain.generatedAt !== undefined) persistence.generatedAt = domain.generatedAt;
    if (domain.type !== undefined) persistence.type = domain.type;
    if (domain.isScheduled !== undefined) persistence.isScheduled = domain.isScheduled;
    if (domain.scheduledFor !== undefined) persistence.scheduledFor = domain.scheduledFor;
    return persistence;
  }
}
