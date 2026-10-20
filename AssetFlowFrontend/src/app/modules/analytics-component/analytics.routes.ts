import { Routes } from '@angular/router';
import { PermissionGuard } from '@/guards/permission-guard';
import { Permissions } from '@/constants/permissions';

export const analyticsRoutes: Routes = [
  {
    path: 'assets',
    loadComponent: () => import('./feature-analytics.component').then((m) => m.FeatureAnalyticsComponent),
    canActivate: [PermissionGuard],
    data: { permissions: [Permissions.Dashboard.View], mode: 'assets', title: 'Asset Analytics' }
  },
  {
    path: 'maintenance',
    loadComponent: () => import('./feature-analytics.component').then((m) => m.FeatureAnalyticsComponent),
    canActivate: [PermissionGuard],
    data: { permissions: [Permissions.Dashboard.View], mode: 'maintenance', title: 'Maintenance & PM Analytics' }
  },
  {
    path: 'reliability',
    loadComponent: () => import('./feature-analytics.component').then((m) => m.FeatureAnalyticsComponent),
    canActivate: [PermissionGuard],
    data: { permissions: [Permissions.Dashboard.View], mode: 'reliability', title: 'Reliability & Breakdown Analytics' }
  },
  {
    path: 'workflow-operations',
    loadComponent: () => import('./feature-analytics.component').then((m) => m.FeatureAnalyticsComponent),
    canActivate: [PermissionGuard],
    data: { permissions: [Permissions.Dashboard.View], mode: 'workflow-operations', title: 'Workflow Operations' }
  },
  {
    path: 'work-orders',
    redirectTo: 'workflow-operations',
    pathMatch: 'full'
  },
  {
    path: 'spare-parts',
    loadComponent: () => import('./feature-analytics.component').then((m) => m.FeatureAnalyticsComponent),
    canActivate: [PermissionGuard],
    data: { permissions: [Permissions.Dashboard.View], mode: 'spare-parts', title: 'Spare Parts & Inventory Analytics' }
  },
  {
    path: 'cost',
    loadComponent: () => import('./feature-analytics.component').then((m) => m.FeatureAnalyticsComponent),
    canActivate: [PermissionGuard],
    data: { permissions: [Permissions.Dashboard.View], mode: 'cost', title: 'Maintenance Cost Analytics' }
  },
  {
    path: 'performance',
    loadComponent: () => import('./feature-analytics.component').then((m) => m.FeatureAnalyticsComponent),
    canActivate: [PermissionGuard],
    data: { permissions: [Permissions.Dashboard.View], mode: 'performance', title: 'Team Performance' }
  }
];
