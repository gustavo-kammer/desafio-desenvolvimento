import { MovementType } from '../../core/models/api.models';

export const CHART_COLORS = {
  brand: '#009579',
  brandSoft: '#66bfae',
  ink: '#111111',
  neutral: '#6b7280',
  neutralSoft: '#9ca3af',
  warning: '#d97706',
  info: '#0369a1',
  danger: '#b91c1c',
  grid: '#e2e8f0',
  text: '#475569',
} as const;

export const MOVEMENT_TYPE_COLORS: Record<MovementType, string> = {
  entry: CHART_COLORS.brand,
  adjustmentIn: CHART_COLORS.brandSoft,
  exit: CHART_COLORS.ink,
  adjustmentOut: CHART_COLORS.neutral,
  reservation: CHART_COLORS.warning,
  reservationCancellation: CHART_COLORS.neutralSoft,
  reservationConsumption: CHART_COLORS.info,
};
