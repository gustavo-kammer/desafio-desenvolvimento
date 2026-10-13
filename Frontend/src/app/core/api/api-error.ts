import { HttpErrorResponse } from '@angular/common/http';
import { IApiError } from '../models/api.models';

export function errorCode(error: unknown): string | null {
  if (!(error instanceof HttpErrorResponse)) return null;
  return (error.error as Partial<IApiError> | null)?.errorCode ?? null;
}

export function errorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocorreu um erro inesperado.';
  }
  if (error.status === 0) {
    return 'Não foi possível conectar ao servidor. Verifique se a API está em execução.';
  }
  if (error.status === 403) {
    return 'Você não tem permissão para realizar esta ação.';
  }

  const body = error.error as Partial<IApiError> | null;

  if (body?.errors) {
    const first = Object.values(body.errors).flat()[0];
    if (first) return first;
  }

  return body?.detail ?? body?.title ?? 'Ocorreu um erro inesperado.';
}
