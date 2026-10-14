import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { describe, expect, it } from 'vitest';
import { Injector, LOCALE_ID, runInInjectionContext } from '@angular/core';
import { QuantityPipe } from './quantity.pipe';

registerLocaleData(localePt);

function createPipe(): QuantityPipe {
  const injector: Injector = Injector.create({
    providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
  });
  return runInInjectionContext(injector, (): QuantityPipe => new QuantityPipe());
}

describe('QuantityPipe', () => {
  it('formata até 3 casas decimais', () => {
    expect(createPipe().transform(1234.5678)).toBe('1.234,568');
  });

  it('acrescenta a unidade quando informada', () => {
    expect(createPipe().transform(10, 'kg')).toBe('10 kg');
    expect(createPipe().transform(2.5, 'ton')).toBe('2,5 t');
  });

  it('retorna vazio para valores ausentes', () => {
    expect(createPipe().transform(null)).toBe('');
    expect(createPipe().transform(undefined, 'unit')).toBe('');
  });
});
