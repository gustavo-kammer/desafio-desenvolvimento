import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/page/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'produtos' },
      {
        path: 'produtos',
        loadComponent: () =>
          import('./features/product/page/products.page').then((m) => m.ProductsPage),
      },
      {
        path: 'movimentacoes',
        loadComponent: () =>
          import('./features/movements/page/movements.page').then((m) => m.MovementsPage),
      },
      {
        path: 'reservas',
        data: { title: 'Reservas' },
        loadComponent: () =>
          import('./features/reservations/page/reservations.page').then((m) => m.ReservationsPage),
      },
      {
        path: 'categorias',
        canActivate: [roleGuard('administrator')],
        loadComponent: () =>
          import('./features/categories/page/categories.page').then((m) => m.CategoriesPage),
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard('administrator')],
        loadComponent: () => import('./features/users/page/users.page').then((m) => m.UsersPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
