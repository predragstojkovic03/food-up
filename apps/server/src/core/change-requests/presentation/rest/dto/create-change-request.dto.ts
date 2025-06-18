export class CreateChangeRequestDto {
  employeeId: string;
  mealSelectionId: string;
  newMenuItemId: string;
  newQuantity?: number | null;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string | null;
  approvedAt?: Date | null;
}
