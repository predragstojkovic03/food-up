import { types } from 'pg';

// Array type OIDs aren't part of pg's TypeId enum
type TypeId = Parameters<typeof types.getTypeParser>[0];
const DATE_ARRAY_OID = 1182 as TypeId;
const TEXT_ARRAY_OID = 1009 as TypeId;

/**
 * Postgres `date` values are calendar days without a timezone. By default node-postgres turns
 * them into Date objects at local midnight, which shifts the day for anyone converting back via
 * toISOString() on a server that isn't in UTC. Keep them as plain YYYY-MM-DD strings instead.
 *
 * Registered globally on import, before TypeORM opens its first connection.
 */
const parseTextArray = types.getTypeParser(TEXT_ARRAY_OID);

types.setTypeParser(types.builtins.DATE, (value: string) => value);
types.setTypeParser(DATE_ARRAY_OID, (value: string) => parseTextArray(value));
