import { IsNull, Not, ObjectLiteral } from 'typeorm';
import { IArchivableRepository } from '../domain/archivable-repository.interface';
import { Entity } from '../domain/entity';
import { TypeOrmRepository } from './typeorm.repository';

export abstract class ArchivableTypeormRepository<
  TDomain extends Entity,
  TPersistence extends ObjectLiteral,
>
  extends TypeOrmRepository<TDomain, TPersistence>
  implements IArchivableRepository<TDomain>
{
  async archive(entity: TDomain): Promise<void> {
    await this._repository.softDelete(entity.id);
  }
  async restore(entity: TDomain): Promise<void> {
    await this._repository.restore(entity.id);
  }
  async findAllArchived(): Promise<TDomain[]> {
    return this._repository
      .find({
        withDeleted: true,
        where: { deletedAt: Not(IsNull()) } as unknown as any,
      })
      .then((entities) => entities.map((e) => this._mapper.toDomain(e)));
  }
}
