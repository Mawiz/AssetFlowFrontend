import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard-component/dashboard-component';
import { SubscriptionComponent } from './subscription-component/subscription-component';
import { TenantComponent } from './tenant-component/tenant-component';
import { RoleComponent } from './role-component/role-component';
import { ResourceComponent } from './resource-component/resource-component';
import { UserComponent } from './user-component/user-component';


export const routes: Routes = [
  { path: 'tenant', component: TenantComponent },
  { path: 'subscription', component: SubscriptionComponent },
  { path: 'role', component: RoleComponent },
  { path: 'resource', component: ResourceComponent },
  { path: 'user', component: UserComponent },
];
