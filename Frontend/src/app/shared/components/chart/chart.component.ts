import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartType,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { CHART_COLORS } from '../../utils/chart-theme';

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);
Chart.defaults.font.family = "'Montserrat', ui-sans-serif, system-ui, sans-serif";
Chart.defaults.color = CHART_COLORS.text;

interface IChartTable {
  columns: string[];
  rows: { label: string; values: number[] }[];
}

@Component({
  selector: 'app-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="relative" [style.height.px]="height()">
      <canvas #canvas role="img" [attr.aria-label]="ariaLabel()"></canvas>
    </div>

    <details class="mt-3 text-xs text-text-muted">
      <summary
        class="inline-block cursor-pointer rounded-sm font-medium underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Ver dados em tabela
      </summary>
      <div class="mt-2 max-h-48 overflow-auto rounded-md border border-line">
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col">{{ firstColumn() }}</th>
              @for (column of table().columns; track column) {
                <th scope="col" class="text-right">{{ column }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of table().rows; track row.label) {
              <tr>
                <th scope="row" class="font-medium">{{ row.label }}</th>
                @for (value of row.values; track $index) {
                  <td class="text-right">{{ value }}</td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </details>
  `,
})
export class ChartComponent {
  public readonly config = input.required<ChartConfiguration<ChartType>>();
  public readonly ariaLabel = input.required<string>();
  public readonly firstColumn = input<string>('Item');
  public readonly height = input<number>(260);

  private readonly _canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private _chart: Chart | null = null;

  protected readonly table = computed<IChartTable>(() => {
    const data = this.config().data;
    const labels: string[] = (data.labels ?? []).map((label: unknown): string => String(label));
    const datasets = data.datasets;

    return {
      columns: datasets.map((dataset): string => dataset.label ?? 'Valor'),
      rows: labels.map((label: string, index: number) => ({
        label,
        values: datasets.map((dataset): number => Number(dataset.data[index] ?? 0)),
      })),
    };
  });

  public constructor() {
    effect((): void => {
      const config: ChartConfiguration<ChartType> = this.config();
      this._chart?.destroy();
      this._chart = new Chart(this._canvas().nativeElement, config);
    });

    inject(DestroyRef).onDestroy((): void => this._chart?.destroy());
  }
}
