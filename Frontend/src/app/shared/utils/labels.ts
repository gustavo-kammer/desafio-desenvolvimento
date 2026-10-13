import {
  MovementReason,
  MovementType,
  ReservationStatus,
  UnitOfMeasure,
  UserRole,
} from '../../core/models/api.models';

export const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  kg: 'kg',
  ton: 't',
  liter: 'L',
  unit: 'un',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  administrator: 'Administrador',
  operator: 'Operador',
  consultant: 'Consultor',
};

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  entry: 'Entrada',
  exit: 'Saída',
  reservation: 'Reserva',
  reservationCancellation: 'Cancelamento de reserva',
  reservationConsumption: 'Consumo de reserva',
  adjustmentIn: 'Ajuste (entrada)',
  adjustmentOut: 'Ajuste (saída)',
};

export const MOVEMENT_REASON_LABELS: Record<MovementReason, string> = {
  consumption: 'Consumo',
  shipment: 'Expedição',
  loss: 'Perda',
  inventoryCorrection: 'Correção de inventário',
  other: 'Outro',
};

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  active: 'Ativa',
  consumed: 'Consumida',
  canceled: 'Cancelada',
};
