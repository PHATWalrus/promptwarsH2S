import { and, eq, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { contracts } from "./schema";

export * from "./schema";

export type Database = ReturnType<typeof createDatabase>;
export type TenantScope = {
  userId: string;
  orgId: string;
  role: "user" | "admin";
};

export function createDatabase(databaseUrl: string, max = 20) {
  const client = postgres(databaseUrl, {
    max,
    prepare: true,
    transform: postgres.camel,
  });
  return drizzle(client, { schema });
}

export function tenantContractFilter(scope: TenantScope, contractId?: string) {
  const filters = [eq(contracts.orgId, scope.orgId), isNull(contracts.deletedAt)];
  if (contractId) {
    filters.push(eq(contracts.id, contractId));
  }
  return and(...filters);
}

export const pgvectorExtensionSql = sql`create extension if not exists vector`;
export const cryptoExtensionSql = sql`create extension if not exists pgcrypto`;
