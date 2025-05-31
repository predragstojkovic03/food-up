export abstract class Mapper<T, U> {
  abstract toDomain(entity: U): T;
  abstract toPersistence(domain: T): U;

  toPersistenceList(domainList: T[]): U[] {
    return domainList.map((domain) => this.toPersistence(domain));
  }

  toDomainList(persistenceList: U[]): T[] {
    return persistenceList.map((entity) => this.toDomain(entity));
  }

  toPersistencePartial(domain: Partial<T>): Partial<U> {
    // Default: map only defined fields
    const result: Partial<U> = {};
    for (const key in domain) {
      if (domain[key] !== undefined) {
        // @ts-ignore
        result[key] = domain[key];
      }
    }
    return result;
  }

  toDomainPartial(entity: Partial<U>): Partial<T> {
    const result: Partial<T> = {};
    for (const key in entity) {
      if (entity[key] !== undefined) {
        // @ts-ignore
        result[key] = entity[key];
      }
    }
    return result;
  }
}
