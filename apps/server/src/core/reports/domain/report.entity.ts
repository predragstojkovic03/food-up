import { Entity } from 'src/shared/domain/entity';

export class Report extends Entity {
  constructor(
    id: string,
    supplierId: string,
    mealSelectionWindowId: string,
    generatedAt: Date,
    type: 'full' | 'delta',
    isScheduled: boolean,
    scheduledFor?: Date | null,
  ) {
    super();
    this.id = id;
    this.supplierId = supplierId;
    this.mealSelectionWindowId = mealSelectionWindowId;
    this.generatedAt = generatedAt;
    this.type = type;
    this.isScheduled = isScheduled;
    this.scheduledFor = scheduledFor ?? null;
  }

  readonly id: string;
  supplierId: string;
  mealSelectionWindowId: string;
  generatedAt: Date;
  type: 'full' | 'delta';
  isScheduled: boolean;
  scheduledFor: Date | null;
}
