import { Component } from '@angular/core';
import { ManagementDashboard } from './management-dashboard';

@Component({
    selector: 'app-dashboard',
    imports: [ManagementDashboard],
    template: `<app-management-dashboard />`
})
export class Dashboard {}
