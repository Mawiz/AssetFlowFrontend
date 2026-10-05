import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '@/services/auth-service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    constructor(private authService: AuthService) {}

    ngOnInit() {
        const adminItems: MenuItem[] = [
            { label: 'Subscription', icon: 'pi pi-fw pi-id-card', routerLink: ['/modules/subscription'], visible: this.authService.hasPrefix('Subscription.') },
            { label: 'Tenant', icon: 'pi pi-fw pi-id-card', routerLink: ['/modules/tenant'], visible: this.authService.hasPrefix('Tenant.') },
            { label: 'Role', icon: 'pi pi-fw pi-id-card', routerLink: ['/modules/role'], visible: this.authService.hasPrefix('Role.') },
            { label: 'Permissions', icon: 'pi pi-fw pi-id-card', routerLink: ['/modules/resource'], visible: this.authService.hasPrefix('Resource.') },
            { label: 'User', icon: 'pi pi-fw pi-id-card', routerLink: ['/modules/user'], visible: this.authService.hasPrefix('User.') }
        ].filter((item) => item.visible !== false);

        const locationItems: MenuItem[] = [
            { label: 'Location Types', icon: 'pi pi-fw pi-map', routerLink: ['/modules/location-type'], visible: this.authService.hasPrefix('LocationType.') },
            { label: 'Locations', icon: 'pi pi-fw pi-map-marker', routerLink: ['/modules/location'], visible: this.authService.hasPrefix('Location.') }
        ].filter((item) => item.visible !== false);

        const assetItems: MenuItem[] = [
            { label: 'Asset Categories', icon: 'pi pi-fw pi-box', routerLink: ['/modules/asset-category'], visible: this.authService.hasPrefix('AssetCategory.') },
            { label: 'Asset Types', icon: 'pi pi-fw pi-tags', routerLink: ['/modules/asset-type'], visible: this.authService.hasPrefix('AssetType.') },
            { label: 'Assets', icon: 'pi pi-fw pi-server', routerLink: ['/modules/assets'], visible: this.authService.hasPrefix('Asset.') },
            { label: 'Asset Analytics', icon: 'pi pi-fw pi-chart-line', routerLink: ['/modules/analytics/assets'], visible: this.authService.hasPermission('Dashboard.View') }
        ].filter((item) => item.visible !== false);

        const maintenanceItems: MenuItem[] = [
            { label: 'Preventive Maintenance', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/modules/preventive-maintenance'], visible: this.authService.hasPrefix('PreventiveMaintenance.') },
            { label: 'Maintenance Schedules', icon: 'pi pi-fw pi-calendar', routerLink: ['/modules/maintenance-schedules'], visible: this.authService.hasPrefix('MaintenanceSchedule.') },
            { label: 'Checklists', icon: 'pi pi-fw pi-list-check', routerLink: ['/modules/maintenance-checklists'], visible: this.authService.hasPrefix('MaintenanceChecklist.') },
            { label: 'Maintenance Types', icon: 'pi pi-fw pi-tags', routerLink: ['/modules/maintenance-types'], visible: this.authService.hasPrefix('MaintenanceType.') },
            { label: 'Maintenance Calendar', icon: 'pi pi-fw pi-calendar', routerLink: ['/modules/maintenance-calendar'], visible: this.authService.hasPrefix('PreventiveMaintenance.') },
            { label: 'Work Orders', icon: 'pi pi-fw pi-briefcase', routerLink: ['/modules/work-orders'], visible: this.authService.hasPrefix('WorkOrder.') },
            { label: 'Issues / Breakdowns', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/modules/issues'], visible: this.authService.hasPrefix('AssetIssue.') },
            { label: 'Issue Categories', icon: 'pi pi-fw pi-tags', routerLink: ['/modules/issue-categories'], visible: this.authService.hasPrefix('IssueCategory.') }
        ].filter((item) => item.visible !== false);

        const sparePartItems: MenuItem[] = [
            { label: 'Parts', icon: 'pi pi-fw pi-wrench', routerLink: ['/modules/parts'], visible: this.authService.hasPrefix('Part.') },
            { label: 'Part Categories', icon: 'pi pi-fw pi-tags', routerLink: ['/modules/part-category'], visible: this.authService.hasPrefix('PartCategory.') },
            { label: 'Suppliers', icon: 'pi pi-fw pi-truck', routerLink: ['/modules/supplier'], visible: this.authService.hasPrefix('Supplier.') },
            { label: 'Inventory', icon: 'pi pi-fw pi-inbox', routerLink: ['/modules/part-inventory'], visible: this.authService.hasPrefix('PartInventory.') },
            { label: 'Part Transactions', icon: 'pi pi-fw pi-history', routerLink: ['/modules/part-transaction'], visible: this.authService.hasPrefix('PartTransaction.') },
            { label: 'Low Stock', icon: 'pi pi-fw pi-exclamation-triangle', routerLink: ['/modules/parts'], queryParams: { lowStock: 'true' }, visible: this.authService.hasPrefix('Part.') }
        ].filter((item) => item.visible !== false);

        const reportItems: MenuItem[] = [
            { label: 'Reports Center', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/modules/reports'], visible: this.authService.hasPermission('Reports.View') }
        ].filter((item) => item.visible !== false);

        const analyticsItems: MenuItem[] = [
            { label: 'Asset Analytics', icon: 'pi pi-fw pi-server', routerLink: ['/modules/analytics/assets'], visible: this.authService.hasPermission('Dashboard.View') },
            { label: 'Maintenance Analytics', icon: 'pi pi-fw pi-calendar', routerLink: ['/modules/analytics/maintenance'], visible: this.authService.hasPermission('Dashboard.View') },
            { label: 'Reliability Analytics', icon: 'pi pi-fw pi-exclamation-triangle', routerLink: ['/modules/analytics/reliability'], visible: this.authService.hasPermission('Dashboard.View') },
            { label: 'Work Order Analytics', icon: 'pi pi-fw pi-briefcase', routerLink: ['/modules/analytics/work-orders'], visible: this.authService.hasPermission('Dashboard.View') },
            { label: 'Spare Parts Analytics', icon: 'pi pi-fw pi-wrench', routerLink: ['/modules/analytics/spare-parts'], visible: this.authService.hasPermission('Dashboard.View') },
            { label: 'Cost Analytics', icon: 'pi pi-fw pi-dollar', routerLink: ['/modules/analytics/cost'], visible: this.authService.hasPermission('Dashboard.View') },
            { label: 'Team Performance', icon: 'pi pi-fw pi-users', routerLink: ['/modules/analytics/performance'], visible: this.authService.hasPermission('Dashboard.View') }
        ].filter((item) => item.visible !== false);

        this.model = [
            {
                label: 'Home',
                items: [
                    { label: 'Management Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'], visible: this.authService.hasPermission('Dashboard.View') || this.authService.hasPrefix('Dashboard.') },
                    ...reportItems
                ].filter((item) => item.visible !== false)
            },
            ...(analyticsItems.length ? [{ label: 'Analytics', items: analyticsItems }] : []),
            ...(adminItems.length
                ? [{
                    label: 'Admin Components',
                    items: adminItems
                }]
                : []),
            ...(locationItems.length
                ? [{
                    label: 'Location Management',
                    items: locationItems
                }]
                : []),
            ...(assetItems.length
                ? [{
                    label: 'Asset Management',
                    items: assetItems
                }]
                : []),
            ...(sparePartItems.length
                ? [{
                    label: 'Spare Parts',
                    items: sparePartItems
                }]
                : []),
            ...(maintenanceItems.length
                ? [{
                    label: 'Maintenance',
                    items: maintenanceItems
                }]
                : []),
            {
                label: 'UI Components',
                items: [
                    { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
                    { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
                    { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
                    { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
                    { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
                    { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
                    { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
                    { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
                    { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
                    { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
                    { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
                    { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
                    { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
                    { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
                    { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
                ]
            }
        ];
    }
}
