import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { errorMessage } from '../../../core/api/api-error';
import { AnalyticsService } from '../../../core/api/analytics.service';
import {
  IAnalyticsSummary,
  ICriticalProduct,
  IDailyMovement,
  IMovementTypeCount,
  ITopProduct,
} from '../../../core/models/api.models';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InfoTipComponent } from '../../../shared/components/info-tip/info-tip.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import {
  AnalyticsChartConfig,
  buildCriticalChart,
  buildDailyChart,
  buildTopChart,
  buildTypeChart,
} from '../charts/analytics-charts';

interface IPeriodOption {
  value: number;
  label: string;
}

interface IKpi {
  label: string;
  value: number;
  hint: string;
  alert: boolean;
}

const PERIOD_OPTIONS: IPeriodOption[] = [
  { value: 7, label: 'Últimos 7 dias' },
  { value: 30, label: 'Últimos 30 dias' },
  { value: 90, label: 'Últimos 90 dias' },
];

@Component({
  selector: 'app-analytics-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AlertComponent,
    ButtonComponent,
    ChartComponent,
    InfoTipComponent,
    PageHeaderComponent,
  ],
  templateUrl: './analytics.page.html',
})
export class AnalyticsPage implements OnInit {
  private readonly _analyticsService: AnalyticsService = inject(AnalyticsService);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);

  protected readonly periodOptions: IPeriodOption[] = PERIOD_OPTIONS;
  protected readonly periodControl = new FormControl<number>(30, { nonNullable: true });

  protected readonly summary = signal<IAnalyticsSummary | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly periodLabel = computed<string>(
    () => PERIOD_OPTIONS.find((o: IPeriodOption) => o.value === this.summary()?.days)?.label ?? '',
  );

  protected readonly kpis = computed<IKpi[]>(() => {
    const overview = this.summary()?.overview;
    return [
      {
        label: 'Produtos ativos',
        value: overview?.activeProducts ?? 0,
        hint: 'No catálogo',
        alert: false,
      },
      {
        label: 'Abaixo do mínimo',
        value: overview?.belowMinimum ?? 0,
        hint: 'Disponível menor que o mínimo',
        alert: (overview?.belowMinimum ?? 0) > 0,
      },
      {
        label: 'Reservas ativas',
        value: overview?.activeReservations ?? 0,
        hint: 'Aguardando consumo ou cancelamento',
        alert: false,
      },
      {
        label: 'Movimentações',
        value: overview?.movementsInPeriod ?? 0,
        hint: this.periodLabel(),
        alert: false,
      },
    ];
  });

  protected readonly hasMovements = computed<boolean>(
    () => (this.summary()?.overview.movementsInPeriod ?? 0) > 0,
  );

  protected readonly dailyChart = computed<AnalyticsChartConfig | null>(() => {
    const days: IDailyMovement[] | undefined = this.summary()?.dailyMovements;
    return days ? buildDailyChart(days) : null;
  });

  protected readonly typeChart = computed<AnalyticsChartConfig | null>(() => {
    const types: IMovementTypeCount[] = this.summary()?.movementsByType ?? [];
    return types.length > 0 ? buildTypeChart(types) : null;
  });

  protected readonly topChart = computed<AnalyticsChartConfig | null>(() => {
    const products: ITopProduct[] = this.summary()?.topProducts ?? [];
    return products.length > 0 ? buildTopChart(products) : null;
  });

  protected readonly criticalChart = computed<AnalyticsChartConfig | null>(() => {
    const products: ICriticalProduct[] = this.summary()?.criticalProducts ?? [];
    return products.length > 0 ? buildCriticalChart(products) : null;
  });

  public ngOnInit(): void {
    this.periodControl.valueChanges
      .pipe(
        startWith(this.periodControl.value),
        tap((): void => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap((days: number): Observable<IAnalyticsSummary | null> =>
          this._analyticsService.summary(days).pipe(
            catchError((err: unknown): Observable<null> => {
              this.error.set(errorMessage(err));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((summary: IAnalyticsSummary | null): void => {
        if (summary) {
          this.summary.set(summary);
        }
        this.loading.set(false);
      });
  }

  protected reload(): void {
    this.periodControl.setValue(this.periodControl.value);
  }
}
