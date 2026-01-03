export interface LoginSuccessResponse {
  requiresTenantSelection: false;
  accessToken: string;
  user: unknown;
  selectedTenant: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface LoginTenantSelectionResponse {
  requiresTenantSelection: true;
  user: unknown;
  availableTenants: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
}

export type LoginResponse = LoginSuccessResponse | LoginTenantSelectionResponse;
