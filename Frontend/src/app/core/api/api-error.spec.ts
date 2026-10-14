import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { errorMessage } from './api-error';

function httpError(status: number, body?: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

describe('errorMessage', () => {
  it('trata erros que não vêm do HTTP', () => {
    expect(errorMessage(new Error('boom'))).toBe('Ocorreu um erro inesperado.');
  });

  it('avisa quando a API está inacessível (status 0)', () => {
    expect(errorMessage(httpError(0))).toContain('Não foi possível conectar');
  });

  it('avisa falta de permissão (403)', () => {
    expect(errorMessage(httpError(403))).toContain('não tem permissão');
  });

  it('prioriza a primeira mensagem de validação', () => {
    const error: HttpErrorResponse = httpError(400, {
      title: 'Erro de validação',
      errors: { Name: ['Informe o nome.'] },
    });
    expect(errorMessage(error)).toBe('Informe o nome.');
  });

  it('usa o detail do ProblemDetails quando existe', () => {
    expect(
      errorMessage(httpError(409, { title: 'Conflito', detail: 'Código já cadastrado.' })),
    ).toBe('Código já cadastrado.');
  });

  it('cai no title e depois na mensagem genérica', () => {
    expect(errorMessage(httpError(500, { title: 'Falha interna' }))).toBe('Falha interna');
    expect(errorMessage(httpError(500, null))).toBe('Ocorreu um erro inesperado.');
  });
});
