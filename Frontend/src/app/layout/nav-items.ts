import { UserRole } from '../core/models/api.models';

export interface INavItem {
  label: string;
  path: string;
  roles?: UserRole[];
}

export const NAV_ITEMS: INavItem[] = [
  { label: 'Produtos', path: '/produtos' },
  { label: 'Movimentações', path: '/movimentacoes' },
  { label: 'Reservas', path: '/reservas' },
  { label: 'Categorias', path: '/categorias', roles: ['administrator'] },
  { label: 'Usuários', path: '/usuarios', roles: ['administrator'] },
];
