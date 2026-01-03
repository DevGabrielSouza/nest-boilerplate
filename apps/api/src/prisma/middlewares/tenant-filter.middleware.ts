import { Prisma } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

export const tenantContext = new AsyncLocalStorage<{
  tenantId: string | null;
  bypassTenantFilter?: boolean;
}>();

const TENANT_FILTERED_MODELS = [
  'UserTenant',
  'Log',
  'TenantConfiguration',
] as const;

const READ_OPERATIONS = [
  'findUnique',
  'findFirst',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
] as const;

const WRITE_OPERATIONS = [
  'update',
  'updateMany',
  'delete',
  'deleteMany',
] as const;

export const tenantFilterMiddleware: Prisma.Middleware = async (
  params,
  next
) => {
  const context = tenantContext.getStore();

  if (!context || context.bypassTenantFilter) {
    return next(params);
  }

  const { tenantId } = context;
  const { model, action } = params;

  const shouldFilter =
    model &&
    TENANT_FILTERED_MODELS.includes(
      model as (typeof TENANT_FILTERED_MODELS)[number]
    );

  if (!shouldFilter) {
    return next(params);
  }

  if (READ_OPERATIONS.includes(action as (typeof READ_OPERATIONS)[number])) {
    if (tenantId) {
      params.args = params.args || {};
      params.args.where = params.args.where || {};

      if (params.args.where.tenantId === undefined) {
        params.args.where.tenantId = tenantId;
      }
    }
  }

  if (WRITE_OPERATIONS.includes(action as (typeof WRITE_OPERATIONS)[number])) {
    if (tenantId) {
      params.args = params.args || {};
      params.args.where = params.args.where || {};

      if (params.args.where.tenantId === undefined) {
        params.args.where.tenantId = tenantId;
      }
    }
  }

  if (action === 'create' && tenantId) {
    params.args = params.args || {};
    params.args.data = params.args.data || {};

    if (params.args.data.tenantId === undefined && model !== 'Tenant') {
      params.args.data.tenantId = tenantId;
    }
  }

  if (action === 'createMany' && tenantId) {
    params.args = params.args || {};

    if (Array.isArray(params.args.data)) {
      params.args.data = params.args.data.map(
        (record: Record<string, unknown>) => {
          if (record.tenantId === undefined && model !== 'Tenant') {
            return { ...record, tenantId };
          }
          return record;
        }
      );
    }
  }

  return next(params);
};

export async function runWithoutTenantFilter<T>(
  callback: () => Promise<T>
): Promise<T> {
  const currentContext = tenantContext.getStore();
  return tenantContext.run(
    { ...currentContext, tenantId: null, bypassTenantFilter: true },
    callback
  );
}

export async function runWithTenantId<T>(
  tenantId: string,
  callback: () => Promise<T>
): Promise<T> {
  return tenantContext.run({ tenantId, bypassTenantFilter: false }, callback);
}
