export type UserRole = 'administrator' | 'operator' | 'consultant';
export type UnitOfMeasure = 'kg' | 'ton' | 'liter' | 'unit';
export type ReservationStatus = 'active' | 'consumed' | 'canceled';
export type MovementReason = 'consumption' | 'shipment' | 'loss' | 'inventoryCorrection' | 'other';
export type MovementType =
  | 'entry'
  | 'exit'
  | 'reservation'
  | 'reservationCancellation'
  | 'reservationConsumption'
  | 'adjustmentIn'
  | 'adjustmentOut';

export interface IPagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface IApiError {
  status: number;
  title: string;
  detail?: string;
  errorCode: string;
  traceId: string;
  errors?: Record<string, string[]>;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface ILoginResponse {
  accessToken: string;
  expiresAt: string;
  user: IUser;
}

export interface ICategory {
  id: number;
  name: string;
  description: string | null;
}

export interface IProductStock {
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface IProduct {
  id: number;
  category: ICategory | null;
  code: string;
  name: string;
  description: string | null;
  unit: UnitOfMeasure;
  minimumStock: number;
  stock: IProductStock;
  belowMinimumStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IMovementProduct {
  id: number;
  code: string;
  name: string;
  unit: UnitOfMeasure;
}

export interface IMovementUser {
  id: number;
  name: string;
  email: string;
}

export interface IStockMovement {
  id: number;
  product: IMovementProduct;
  reservationId: number | null;
  type: MovementType;
  quantity: number;
  totalBefore: number;
  totalAfter: number;
  reservedBefore: number;
  reservedAfter: number;
  reason: MovementReason | null;
  justification: string | null;
  referenceDocument: string | null;
  user: IMovementUser;
  occurredAt: string;
}

export interface IReservation {
  id: number;
  product: IMovementProduct | null;
  quantity: number;
  status: ReservationStatus;
  createdBy: IMovementUser | null;
  closedBy: IMovementUser | null;
  createdAt: string;
  closedAt: string | null;
}

export interface IMovementRequest {
  productId: number;
  quantity: number;
  reason?: MovementReason | null;
  justification?: string | null;
  referenceDocument?: string | null;
}

export interface ICreateProductRequest {
  categoryId: number;
  code: string;
  name: string;
  unit: UnitOfMeasure;
  minimumStock: number;
  description?: string | null;
}

export interface IUpdateProductRequest {
  categoryId: number;
  name: string;
  minimumStock: number;
  description?: string | null;
}

export interface ISaveCategoryRequest {
  name: string;
  description?: string | null;
}

export interface ICreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface IUpdateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}
