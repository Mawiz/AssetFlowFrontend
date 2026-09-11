import { Routes } from '@angular/router';
import { TenantComponent } from './tenant-component/tenant-component';
import { SubscriptionComponent } from './subscription-component/subscription-component';
import { RoleComponent } from './role-component/role-component';
import { ResourceComponent } from './resource-component/resource-component';
import { UserComponent } from './user-component/user-component';
import { PermissionGuard } from '@/guards/permission-guard';
import { Permissions } from '@/constants/permissions';

export const routes: Routes = [
  { path: 'tenant', component: TenantComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Tenant.List] } },
  { path: 'subscription', component: SubscriptionComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Subscription.List] } },
  { path: 'role', component: RoleComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Role.List] } },
  { path: 'resource', component: ResourceComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Resource.List] } },
  { path: 'user', component: UserComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.User.List] } },
];
