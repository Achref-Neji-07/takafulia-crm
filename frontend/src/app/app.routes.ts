import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Clients } from './pages/clients/clients';
import { DevisPage } from './pages/devis/devis';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: Dashboard
  },
  {
    path: 'clients',
    component: Clients
  },
  {
    path: 'devis',
    component: DevisPage
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];