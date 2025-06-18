export abstract class Mapper<Domain, Persistence> {
  abstract toDomain(entity: Persistence): Domain;
  abstract toPersistence(domain: Domain): Persistence;

  toPersistenceList(domainList: Domain[]): Persistence[] {
    return domainList.map((domain) => this.toPersistence(domain));
  }

  toDomainList(persistenceList: Persistence[]): Domain[] {
    return persistenceList.map((entity) => this.toDomain(entity));
  }

  toPersistencePartial(domain: Partial<Domain>): Partial<Persistence> {
    // Default: map only defined fields
    const result: Partial<Persistence> = {};
    for (const key in domain) {
      if (domain[key] !== undefined) {
        // @ts-ignore
        result[key] = domain[key];
      }
    }
    return result;
  }

  toDomainPartial(entity: Partial<Persistence>): Partial<Domain> {
    const result: Partial<Domain> = {};
    for (const key in entity) {
      if (entity[key] !== undefined) {
        // @ts-ignore
        result[key] = entity[key];
      }
    }
    return result;
  }
}
