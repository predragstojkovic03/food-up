export abstract class Mapper<Domain, Persistence> {
  abstract toDomain(entity: Persistence): Domain;
  abstract toPersistence(domain: Domain): Persistence;
  abstract toPersistencePartial(domain: Partial<Domain>): Partial<Persistence>;

  toPersistenceList(domainList: Domain[]): Persistence[] {
    return domainList.map((domain) => this.toPersistence(domain));
  }

  toDomainList(persistenceList: Persistence[]): Domain[] {
    return persistenceList.map((entity) => this.toDomain(entity));
  }
}
