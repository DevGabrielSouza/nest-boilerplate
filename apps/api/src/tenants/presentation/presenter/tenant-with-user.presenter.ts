import { Tenant, User, UserTenant } from '@prisma/client';

type TenantWithUserTenants = Tenant & {
  userTenants: Array<
    UserTenant & {
      user: User;
    }
  >;
};

export class TenantWithUserPresenter {
  static present(data: TenantWithUserTenants) {
    const userTenant = data.userTenants?.[0];
    const user = userTenant?.user;

    return {
      tenant: {
        id: data.id,
        name: data.name,
        slug: data.slug,
      },
      user: {
        id: user?.id,
        name: `${user?.name} ${user?.lastName}`,
        email: user?.email,
        role: userTenant?.role,
        emailVerified: !!user?.emailVerifiedAt,
      },
      createdAt: data.createdAt,
    };
  }
}
