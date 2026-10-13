import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';

const loadPlaceholder = (): Promise<
  typeof import('./features/placeholder/placeholder.page').PlaceholderPage
> => import('./features/placeholder/placeholder.page').then((m) => m.PlaceholderPage);

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
        data: { title: 'Movimentações' },
        loadComponent: loadPlaceholder,
      },
      {
        path: 'reservas',
        data: { title: 'Reservas' },
        loadComponent: loadPlaceholder,
      },
      {
        path: 'categorias',
        canActivate: [roleGuard('administrator')],
        data: { title: 'Categorias' },
        loadComponent: loadPlaceholder,
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard('administrator')],
        data: { title: 'Usuários' },
        loadComponent: loadPlaceholder,
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
