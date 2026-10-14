import { describe, expect, it } from 'vitest';
import { ICriticalProduct, IDailyMovement } from '../../../core/models/api.models';
import { CHART_COLORS } from '../../../shared/utils/chart-theme';
import {
  buildCriticalChart,
  buildDailyChart,
  coverageColor,
  COVERAGE_AXIS_MAX,
  formatDay,
} from './analytics-charts';

function critical(code: string, coverage: number): ICriticalProduct {
  return {
    productId: 1,
    code,
    name: `Produto ${code}`,
    unit: 'kg',
    available: coverage * 100,
    minimumStock: 100,
    coverage,
  };
}

function days(count: number): IDailyMovement[] {
  return Array.from({ length: count }, (_: unknown, index: number): IDailyMovement => ({
    date: `2026-10-${String(index + 1).padStart(2, '0')}`,
    entries: index,
    exits: 0,
  }));
}

describe('formatDay', () => {
  it('converte yyyy-MM-dd em dd/MM sem deslocar o dia', () => {
    expect(formatDay('2026-10-13')).toBe('13/10');
    expect(formatDay('2026-01-01')).toBe('01/01');
  });
});

describe('coverageColor', () => {
  it('usa vermelho abaixo do mínimo, âmbar até 150% e verde acima', () => {
    expect(coverageColor(0.4)).toBe(CHART_COLORS.danger);
    expect(coverageColor(1)).toBe(CHART_COLORS.warning);
    expect(coverageColor(1.49)).toBe(CHART_COLORS.warning);
    expect(coverageColor(1.5)).toBe(CHART_COLORS.brand);
  });
});

describe('buildCriticalChart', () => {
  it('converte a cobertura em porcentagem e mantém o valor real acima do eixo', () => {
    const config = buildCriticalChart([critical('A', 0.25), critical('B', 180)]);
    const dataset = config.data.datasets[0];

    expect(config.data.labels).toEqual(['A · Produto A', 'B · Produto B']);
    expect(dataset.data).toEqual([25, 18000]);
    expect(COVERAGE_AXIS_MAX).toBe(200);
  });
});

describe('buildDailyChart', () => {
  it('cria as séries de entradas e saídas com os dias formatados', () => {
    const config = buildDailyChart(days(3));

    expect(config.data.labels).toEqual(['01/10', '02/10', '03/10']);
    expect(config.data.datasets.map((d) => d.label)).toEqual(['Entradas', 'Saídas']);
    expect(config.data.datasets[0].data).toEqual([0, 1, 2]);
  });

  it('esconde os pontos em períodos longos para não poluir o gráfico', () => {
    const short = buildDailyChart(days(7)).data.datasets[0] as { pointRadius: number };
    const long = buildDailyChart(days(40)).data.datasets[0] as { pointRadius: number };

    expect(short.pointRadius).toBe(3);
    expect(long.pointRadius).toBe(0);
  });
});
