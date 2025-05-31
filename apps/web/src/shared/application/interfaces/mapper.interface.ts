export interface IMapper<Dto, Entity> {
  toDomain(dto: Dto): Entity;
  toDto(entity: Entity): Dto;
}
