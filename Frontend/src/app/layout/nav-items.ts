import { UserRole } from '../core/models/api.models';

export interface INavItem {
  label: string;
  path: string;
  icon: string[];
  roles?: UserRole[];
}

export const NAV_ITEMS: INavItem[] = [
  {
    label: 'Produtos',
    path: '/produtos',
    icon: [
      'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z',
      'M12 22V12',
      'm3.3 7 8.7 5 8.7-5',
    ],
  },
  {
    label: 'Movimentações',
    path: '/movimentacoes',
    icon: ['M8 3 4 7l4 4', 'M4 7h16', 'm16 21 4-4-4-4', 'M20 17H4'],
  },
  {
    label: 'Reservas',
    path: '/reservas',
    icon: ['m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z'],
  },
  {
    label: 'Análise',
    path: '/analise',
    icon: ['M3 3v16a2 2 0 0 0 2 2h16', 'M7 16v-3', 'M12 16V8', 'M17 16v-6'],
  },
  {
    label: 'Categorias',
    path: '/categorias',
    icon: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
    roles: ['administrator'],
  },
  {
    label: 'Usuários',
    path: '/usuarios',
    icon: [
      'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
      'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'M22 21v-2a4 4 0 0 0-3-3.87',
      'M16 3.13a4 4 0 0 1 0 7.75',
    ],
    roles: ['administrator'],
  },
];
