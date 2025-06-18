export class ReportResponseDto {
  id: string;
  supplierId: string;
  mealSelectionWindowId: string;
  generatedAt: Date;
  type: 'full' | 'delta';
  isScheduled: boolean;
  scheduledFor: Date | null;
}
