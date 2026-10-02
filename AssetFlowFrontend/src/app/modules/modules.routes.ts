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
import { PartCategoryComponent } from './part-category-component/part-category-component';
import { PartsComponent } from './parts-component/parts-component';
import { PartDetailComponent } from './part-detail-component/part-detail-component';
import { PartInventoryComponent } from './part-inventory-component/part-inventory-component';
import { PartInventoryDetailComponent } from './part-inventory-detail-component/part-inventory-detail-component';
import { PartTransactionComponent } from './part-transaction-component/part-transaction-component';
import { SupplierComponent } from './supplier-component/supplier-component';
import { MaintenanceTypeComponent } from './maintenance-type-component/maintenance-type-component';
import { MaintenanceChecklistComponent } from './maintenance-checklist-component/maintenance-checklist-component';
import { MaintenanceScheduleComponent } from './maintenance-schedule-component/maintenance-schedule-component';
import { PreventiveMaintenanceComponent } from './preventive-maintenance-component/preventive-maintenance-component';
import { MaintenanceCalendarComponent } from './maintenance-calendar-component/maintenance-calendar-component';
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
  { path: 'assets/new', component: AssetDetailComponent, canActivate: [PermissionGuard], data: { mode: 'create', permissions: [Permissions.Asset.Create] } },
  { path: 'assets/:id', component: AssetDetailComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Asset.View] } },
  { path: 'part-category', component: PartCategoryComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.PartCategory.View] } },
  { path: 'parts', component: PartsComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Part.View] } },
  { path: 'parts/new', component: PartDetailComponent, canActivate: [PermissionGuard], data: { mode: 'create', permissions: [Permissions.Part.Create] } },
  { path: 'parts/:id', component: PartDetailComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Part.View] } },
  { path: 'part-inventory', component: PartInventoryComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.PartInventory.View] } },
  { path: 'part-inventory/:id', component: PartInventoryDetailComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.PartInventory.View] } },
  { path: 'part-transaction', component: PartTransactionComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.PartTransaction.View] } },
  { path: 'supplier', component: SupplierComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Supplier.View] } },
  { path: 'maintenance-types', component: MaintenanceTypeComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.MaintenanceType.View] } },
  { path: 'maintenance-checklists', component: MaintenanceChecklistComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.MaintenanceChecklist.View] } },
  { path: 'maintenance-schedules', component: MaintenanceScheduleComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.MaintenanceSchedule.View] } },
  { path: 'preventive-maintenance', component: PreventiveMaintenanceComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.PreventiveMaintenance.View] } },
  { path: 'maintenance-calendar', component: MaintenanceCalendarComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.PreventiveMaintenance.View] } },
];
