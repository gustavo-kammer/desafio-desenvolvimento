import { describe, expect, it } from 'vitest';
import { getInitials } from './initials';

describe('getInitials', () => {
  it('usa a primeira e a última letra de nomes compostos', () => {
    expect(getInitials('Gustavo Kammer Souza')).toBe('GS');
  });

  it('usa apenas uma letra quando há uma palavra só', () => {
    expect(getInitials('admin')).toBe('A');
  });

  it('ignora espaços extras', () => {
    expect(getInitials('  maria   silva  ')).toBe('MS');
  });

  it('retorna "?" para nome vazio', () => {
    expect(getInitials('   ')).toBe('?');
  });
});
