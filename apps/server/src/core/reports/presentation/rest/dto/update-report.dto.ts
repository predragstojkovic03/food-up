export class UpdateReportDto {
  supplierId?: string;
  mealSelectionWindowId?: string;
  generatedAt?: Date;
  type?: 'full' | 'delta';
  isScheduled?: boolean;
  scheduledFor?: Date | null;
}
