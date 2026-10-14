import { Chart, ChartConfiguration, ChartType, Plugin, TooltipItem } from 'chart.js';
import {
  ICriticalProduct,
  IDailyMovement,
  IMovementTypeCount,
  ITopProduct,
} from '../../../core/models/api.models';
import { CHART_COLORS, MOVEMENT_TYPE_COLORS } from '../../../shared/utils/chart-theme';
import { MOVEMENT_TYPE_LABELS, UNIT_LABELS } from '../../../shared/utils/labels';

export type AnalyticsChartConfig = ChartConfiguration<ChartType>;

/** Acima deste valor (em %) a barra de cobertura fica "cheia"; o valor real segue na dica e na tabela. */
export const COVERAGE_AXIS_MAX = 200;

const NUMBER_FORMAT: Intl.NumberFormat = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 3,
});

/** '2026-10-13' → '13/10' (sem passar por Date, para não deslocar o dia por fuso). */
export function formatDay(isoDate: string): string {
  const [, month, day]: string[] = isoDate.split('-');
  return `${day}/${month}`;
}

/** Vermelho abaixo do mínimo, âmbar até 150% e verde acima disso. */
export function coverageColor(coverage: number): string {
  if (coverage < 1) {
    return CHART_COLORS.danger;
  }
  return coverage < 1.5 ? CHART_COLORS.warning : CHART_COLORS.brand;
}

export function buildDailyChart(days: IDailyMovement[]): AnalyticsChartConfig {
  const pointRadius: number = days.length > 31 ? 0 : 3;

  return {
    type: 'line',
    data: {
      labels: days.map((d: IDailyMovement): string => formatDay(d.date)),
      datasets: [
        {
          label: 'Entradas',
          data: days.map((d: IDailyMovement): number => d.entries),
          borderColor: CHART_COLORS.brand,
          backgroundColor: `${CHART_COLORS.brand}22`,
          fill: true,
          tension: 0.3,
          pointRadius,
        },
        {
          label: 'Saídas',
          data: days.map((d: IDailyMovement): number => d.exits),
          borderColor: CHART_COLORS.ink,
          backgroundColor: `${CHART_COLORS.ink}11`,
          fill: true,
          tension: 0.3,
          pointRadius,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: CHART_COLORS.grid } },
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 16 } },
      },
      plugins: { legend: { position: 'bottom' } },
    },
  };
}

export function buildTypeChart(types: IMovementTypeCount[]): ChartConfiguration<'doughnut'> {
  return {
    type: 'doughnut',
    data: {
      labels: types.map((t: IMovementTypeCount): string => MOVEMENT_TYPE_LABELS[t.type]),
      datasets: [
        {
          label: 'Movimentações',
          data: types.map((t: IMovementTypeCount): number => t.count),
          backgroundColor: types.map(
            (t: IMovementTypeCount): string => MOVEMENT_TYPE_COLORS[t.type],
          ),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
    },
  };
}

export function buildTopChart(products: ITopProduct[]): AnalyticsChartConfig {
  return {
    type: 'bar',
    data: {
      labels: products.map((p: ITopProduct): string => p.code),
      datasets: [
        {
          label: 'Movimentações',
          data: products.map((p: ITopProduct): number => p.movements),
          backgroundColor: CHART_COLORS.brand,
          borderRadius: 4,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: CHART_COLORS.grid } },
        y: { grid: { display: false } },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items: TooltipItem<ChartType>[]): string =>
              products[items[0].dataIndex]?.name ?? '',
          },
        },
      },
    },
  };
}

export function buildCriticalChart(products: ICriticalProduct[]): AnalyticsChartConfig {
  return {
    type: 'bar',
    data: {
      labels: products.map((p: ICriticalProduct): string => `${p.code} · ${p.name}`),
      datasets: [
        {
          label: 'Cobertura (%)',
          data: products.map((p: ICriticalProduct): number => Math.round(p.coverage * 100)),
          backgroundColor: products.map((p: ICriticalProduct): string => coverageColor(p.coverage)),
          borderRadius: 4,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          max: COVERAGE_AXIS_MAX,
          ticks: {
            stepSize: 50,
            maxRotation: 0,
            callback: (value: string | number): string => `${value}%`,
          },
          grid: { color: CHART_COLORS.grid },
        },
        y: { grid: { display: false } },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item: TooltipItem<ChartType>): string =>
              `Cobertura: ${NUMBER_FORMAT.format(Number(item.raw))}%`,
            afterLabel: (item: TooltipItem<ChartType>): string => {
              const product: ICriticalProduct | undefined = products[item.dataIndex];
              if (!product) {
                return '';
              }
              const unit: string = UNIT_LABELS[product.unit];
              return `Disponível ${NUMBER_FORMAT.format(product.available)} ${unit} · mínimo ${NUMBER_FORMAT.format(product.minimumStock)} ${unit}`;
            },
          },
        },
      },
    },
    plugins: [minimumLinePlugin()],
  };
}

/** Linha tracejada em 100% (o estoque mínimo), a referência para ler o gráfico de cobertura. */
function minimumLinePlugin(): Plugin {
  return {
    id: 'minimumLine',
    afterDatasetsDraw: (chart: Chart): void => {
      const x: number = chart.scales['x'].getPixelForValue(100);
      const { top, bottom } = chart.chartArea;
      const ctx: CanvasRenderingContext2D = chart.ctx;

      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = CHART_COLORS.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
      ctx.restore();
    },
  };
}
