import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ChangeRequestStatus, MealType } from '@food-up/shared';
import { Employee } from 'src/core/employees/infrastructure/persistence/employee.typeorm-entity';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';
import { IChangeRequestsQueryRepository } from '../../application/queries/change-requests-query-repository.interface';
import { RichChangeRequestDto } from '../../application/queries/dto/rich-change-request.dto';
import { ChangeRequest } from './change-request.typeorm-entity';

@Injectable()
export class ChangeRequestsQueryTypeOrmRepository
  implements IChangeRequestsQueryRepository
{
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private get _repository(): Repository<ChangeRequest> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(ChangeRequest)
      : this._dataSource.getRepository(ChangeRequest);
  }

  async findRichByWindow(windowId: string): Promise<RichChangeRequestDto[]> {
    const rows = await this._buildRichQuery()
      .where('cr.mealSelectionWindowId = :windowId', { windowId })
      .getRawMany();

    return rows.map(this._mapRow);
  }

  async findRichByEmployee(employeeId: string): Promise<RichChangeRequestDto[]> {
    const rows = await this._buildRichQuery()
      .where('cr.employeeId = :employeeId', { employeeId })
      .getRawMany();

    return rows.map(this._mapRow);
  }

  async findPendingCountByWindow(windowId: string): Promise<number> {
    return this._repository
      .createQueryBuilder('cr')
      .where('cr.mealSelectionWindowId = :windowId', { windowId })
      .andWhere('cr.status = :status', { status: ChangeRequestStatus.Pending })
      .getCount();
  }

  private _buildRichQuery() {
    return this._repository
      .createQueryBuilder('cr')
      .leftJoin(Employee, 'employee', 'employee.id = cr.employeeId')
      .leftJoin('cr.mealSelection', 'mealSelection')
      .leftJoin('mealSelection.menuItem', 'currentMenuItem')
      .leftJoin('currentMenuItem.meal', 'currentMeal')
      .leftJoin('cr.newMenuItem', 'newMenuItem')
      .leftJoin('newMenuItem.meal', 'newMeal')
      .select([
        'cr.id AS id',
        'cr.status AS status',
        'cr.employeeId AS "employeeId"',
        'employee.name AS "employeeName"',
        'cr.mealSelectionWindowId AS "mealSelectionWindowId"',
        'cr.mealSelectionId AS "mealSelectionId"',
        'mealSelection.date AS date',
        'currentMeal.name AS "currentMealName"',
        'currentMeal.type AS "currentMealType"',
        'newMeal.name AS "newMealName"',
        'newMeal.type AS "newMealType"',
        'cr.clearSelection AS "clearSelection"',
        'cr.newMenuItemId AS "newMenuItemId"',
        'cr.newQuantity AS "newQuantity"',
      ]);
  }

  private _mapRow(row: any): RichChangeRequestDto {
    return {
      id: row.id,
      status: row.status as ChangeRequestStatus,
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      mealSelectionWindowId: row.mealSelectionWindowId,
      mealSelectionId: row.mealSelectionId ?? null,
      date: row.date ?? null,
      currentMeal: row.currentMealName
        ? { name: row.currentMealName, type: row.currentMealType as MealType }
        : null,
      requestedMeal: row.newMealName
        ? { name: row.newMealName, type: row.newMealType as MealType }
        : null,
      clearSelection: row.clearSelection ?? false,
      newMenuItemId: row.newMenuItemId ?? null,
      newQuantity: row.newQuantity ?? null,
    };
  }
}
