import { Routes } from '@angular/router';
import { TenantComponent } from './tenant-component/tenant-component';
import { SubscriptionComponent } from './subscription-component/subscription-component';
import { RoleComponent } from './role-component/role-component';
import { ResourceComponent } from './resource-component/resource-component';
import { UserComponent } from './user-component/user-component';
import { LocationTypeComponent } from './location-type-component/location-type-component';
import { LocationComponent } from './location-component/location-component';
import { AssetCategoryComponent } from './asset-category-component/asset-category-component';
import { AssetTypeComponent } from './asset-type-component/asset-type-component';
import { AssetsComponent } from './assets-component/assets-component';
import { AssetDetailComponent } from './asset-detail-component/asset-detail-component';
import { PermissionGuard } from '@/guards/permission-guard';
import { Permissions } from '@/constants/permissions';

export const routes: Routes = [
  { path: 'tenant', component: TenantComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Tenant.List] } },
  { path: 'subscription', component: SubscriptionComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Subscription.List] } },
  { path: 'role', component: RoleComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Role.List] } },
  { path: 'resource', component: ResourceComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Resource.List] } },
  { path: 'user', component: UserComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.User.List] } },
  { path: 'location-type', component: LocationTypeComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.LocationType.View] } },
  { path: 'location', component: LocationComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Location.View] } },
  { path: 'asset-category', component: AssetCategoryComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.AssetCategory.View] } },
  { path: 'asset-type', component: AssetTypeComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.AssetType.View] } },
  { path: 'assets', component: AssetsComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Asset.View] } },
  { path: 'assets/new', component: AssetDetailComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Asset.Create] } },
  { path: 'assets/:id', component: AssetDetailComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Asset.View] } },
];
