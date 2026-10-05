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
    path: 'work-orders',
    loadComponent: () => import('./feature-analytics.component').then((m) => m.FeatureAnalyticsComponent),
    canActivate: [PermissionGuard],
    data: { permissions: [Permissions.Dashboard.View], mode: 'work-orders', title: 'Work Order Operations' }
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
