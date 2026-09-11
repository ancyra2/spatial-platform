import { Routes } from '@angular/router';
export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./home').then((m) => m.Home),
  },
  {
    path: '**',
    loadComponent: () => import('./not-found').then((m) => m.NotFound),
  },
];
