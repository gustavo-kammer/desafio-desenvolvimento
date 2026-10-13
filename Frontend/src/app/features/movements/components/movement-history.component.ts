import { DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, merge, of, startWith, Subject, switchMap, tap } from 'rxjs';
import { errorMessage } from '../../../core/api/api-error';
import { IMovementFilter, MovementsService } from '../../../core/api/movements.service';
import {
  IPagedResult,
  IProduct,
  IStockMovement,
  MovementReason,
  MovementType,
  UnitOfMeasure,
} from '../../../core/models/api.models';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import {
  MOVEMENT_REASON_LABELS,
  MOVEMENT_TYPE_LABELS,
  UNIT_LABELS,
} from '../../../shared/utils/labels';

interface ITypeOption {
  value: MovementType;
  label: string;
}

const TYPE_TONES: Record<MovementType, BadgeTone> = {
  entry: 'success',
  adjustmentIn: 'success',
  exit: 'danger',
  adjustmentOut: 'danger',
  reservation: 'warning',
  reservationCancellation: 'neutral',
  reservationConsumption: 'info',
};

@Component({
  selector: 'app-movement-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    BadgeComponent,
    ButtonComponent,
    PaginationComponent,
  ],
  templateUrl: './movement-history.component.html',
})
export class MovementHistoryComponent implements OnInit {
  private readonly _movementsService: MovementsService = inject(MovementsService);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _reload$: Subject<void> = new Subject<void>();

  public readonly products = input.required<IProduct[]>();

  protected readonly productControl = new FormControl<number | null>(null);
  protected readonly typeControl = new FormControl<MovementType | null>(null);
  protected readonly fromControl = new FormControl<string>('', { nonNullable: true });
  protected readonly toControl = new FormControl<string>('', { nonNullable: true });

  protected readonly typeOptions: ITypeOption[] = (
    Object.keys(MOVEMENT_TYPE_LABELS) as MovementType[]
  ).map((value: MovementType): ITypeOption => ({ value, label: MOVEMENT_TYPE_LABELS[value] }));

  protected readonly result = signal<IPagedResult<IStockMovement> | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly page = signal<number>(1);

  public ngOnInit(): void {
    this._reload$
      .pipe(
        startWith(undefined),
        tap((): void => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() =>
          this._movementsService.list(this.buildFilter()).pipe(
            catchError((err: unknown) => {
              this.error.set(errorMessage(err));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((result: IPagedResult<IStockMovement> | null): void => {
        if (result) {
          this.result.set(result);
        }
        this.loading.set(false);
      });

    merge(
      this.productControl.valueChanges,
      this.typeControl.valueChanges,
      this.fromControl.valueChanges,
      this.toControl.valueChanges,
    )
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((): void => {
        this.page.set(1);
        this.reload();
      });
  }

  protected reload(): void {
    this._reload$.next();
  }

  protected goToPage(page: number): void {
    this.page.set(page);
    this.reload();
  }

  protected clearFilters(): void {
    this.productControl.reset(null, { emitEvent: false });
    this.typeControl.reset(null, { emitEvent: false });
    this.fromControl.reset('', { emitEvent: false });
    this.toControl.reset('', { emitEvent: false });
    this.page.set(1);
    this.reload();
  }

  protected typeLabel(type: MovementType): string {
    return MOVEMENT_TYPE_LABELS[type];
  }

  protected typeTone(type: MovementType): BadgeTone {
    return TYPE_TONES[type];
  }

  protected reasonLabel(reason: MovementReason): string {
    return MOVEMENT_REASON_LABELS[reason];
  }

  protected unitLabel(unit: UnitOfMeasure): string {
    return UNIT_LABELS[unit];
  }

  private buildFilter(): IMovementFilter {
    return {
      productId: this.productControl.value,
      type: this.typeControl.value,
      from: this.fromControl.value,
      to: this.toControl.value,
      page: this.page(),
    };
  }
}
