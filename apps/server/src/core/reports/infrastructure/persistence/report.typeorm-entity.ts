import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Report {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  supplierId: string;

  @Column('character varying', { length: 26 })
  mealSelectionWindowId: string;

  @Column('timestamp')
  generatedAt: Date;

  @Column('enum', { enum: ['full', 'delta'] })
  type: 'full' | 'delta';

  @Column('boolean')
  isScheduled: boolean;

  @Column('timestamp', { nullable: true })
  scheduledFor: Date | null;
}
