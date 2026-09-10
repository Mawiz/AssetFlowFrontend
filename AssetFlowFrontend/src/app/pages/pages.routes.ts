import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { SubscriptionComponent } from '@/modules/subscription-component/subscription-component';
import { TenantComponent } from '@/modules/tenant-component/tenant-component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'modules/subscription', component: SubscriptionComponent },
    { path: 'modules/tenant', component: TenantComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
