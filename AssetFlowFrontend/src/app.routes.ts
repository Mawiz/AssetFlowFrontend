import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { TenantComponent } from '@/modules/tenant-component/tenant-component';
import { SubscriptionComponent } from '@/modules/subscription-component/subscription-component';
import { AuthGuard } from '@/guards/auth-guard';
import { PermissionGuard } from '@/guards/permission-guard';
import { Permissions } from '@/constants/permissions';
import { TestComponent } from '@/modules/test/test.component';
import { LoginComponent } from '@/shared/authentication/login.component/login.component';
import { RoleComponent } from '@/modules/role-component/role-component';

// export const appRoutes: Routes = [
//     {
//         path: '',
//         component: AppLayout,
//         children: [
//             { path: '', component: Dashboard },
//             { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
//             { path: 'documentation', component: Documentation },
//             { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
//         ]
//     },
//     { path: 'landing', component: Landing },
//     { path: 'notfound', component: Notfound },
//     { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
//     { path: '**', redirectTo: '/notfound' }
// ];

export const appRoutes: Routes = [
  // Redirect base path to login
  { path: '', redirectTo: 'landing', pathMatch: 'full' },

  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'landing', component: Landing },

  // Protected routes inside AppLayout
  {
    path: '',
    component: AppLayout,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'subscription', component: SubscriptionComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Subscription.List] } },
      { path: 'role', component: RoleComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Role.List] } },
      { path: 'tenant', component: TenantComponent, canActivate: [PermissionGuard], data: { permissions: [Permissions.Tenant.List] } },
      { path: 'test', component: TestComponent },
      { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
      { path: 'documentation', component: Documentation },
      { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
    ],
  },

  // Other routes
  { path: 'notfound', component: Notfound },
  { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
{
  path: 'modules',
  component: AppLayout,
  canActivate: [AuthGuard],
  loadChildren: () => import('./app/modules/modules.routes').then(m => m.routes)
},

  // Wildcard route
  { path: '**', redirectTo: 'login' },
];
