import { DatePipe } from '@angular/common';
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
import { UsersService } from '../../../core/api/users.service';
import { AuthService } from '../../../core/auth/auth.service';
import { IMovementFilter, MovementsService } from '../../../core/api/movements.service';
import {
  IPagedResult,
  IProduct,
  IStockMovement,
  IUser,
  MovementReason,
  MovementType,
} from '../../../core/models/api.models';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { MOVEMENT_REASON_LABELS, MOVEMENT_TYPE_LABELS } from '../../../shared/utils/labels';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { QuantityPipe } from '../../../shared/pipes/quantity.pipe';

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
    QuantityPipe,
    AlertComponent,
    ReactiveFormsModule,
    DatePipe,
    BadgeComponent,
    ButtonComponent,
    PaginationComponent,
  ],
  templateUrl: './movement-history.component.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class MovementHistoryComponent implements OnInit {
  private readonly _movementsService: MovementsService = inject(MovementsService);
  private readonly _usersService: UsersService = inject(UsersService);
  private readonly _auth: AuthService = inject(AuthService);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _reload$: Subject<void> = new Subject<void>();

  public readonly products = input.required<IProduct[]>();

  protected readonly productControl = new FormControl<number | null>(null);
  protected readonly userControl = new FormControl<number | null>(null);
  protected readonly typeControl = new FormControl<MovementType | null>(null);
  protected readonly fromControl = new FormControl<string>('', { nonNullable: true });
  protected readonly toControl = new FormControl<string>('', { nonNullable: true });

  protected readonly typeOptions: ITypeOption[] = (
    Object.keys(MOVEMENT_TYPE_LABELS) as MovementType[]
  ).map((value: MovementType): ITypeOption => ({ value, label: MOVEMENT_TYPE_LABELS[value] }));

  protected readonly canFilterByUser: boolean = this._auth.hasRole('administrator');
  protected readonly users = signal<IUser[]>([]);

  protected readonly result = signal<IPagedResult<IStockMovement> | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly page = signal<number>(1);
  protected readonly hasFilters = signal<boolean>(false);

  public ngOnInit(): void {
    if (this.canFilterByUser) {
      this._usersService
        .list()
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (users: IUser[]): void => this.users.set(users),
          error: (): void => this.users.set([]),
        });
    }

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
      this.userControl.valueChanges,
      this.typeControl.valueChanges,
      this.fromControl.valueChanges,
      this.toControl.valueChanges,
    )
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((): void => {
        this.hasFilters.set(this.hasActiveFilters());
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
    this.userControl.reset(null, { emitEvent: false });
    this.typeControl.reset(null, { emitEvent: false });
    this.fromControl.reset('', { emitEvent: false });
    this.toControl.reset('', { emitEvent: false });
    this.hasFilters.set(false);
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

  private buildFilter(): IMovementFilter {
    return {
      productId: this.productControl.value,
      userId: this.userControl.value,
      type: this.typeControl.value,
      from: this.fromControl.value,
      to: this.toControl.value,
      page: this.page(),
    };
  }

  public refresh(): void {
    this.page.set(1);
    this.reload();
  }

  private hasActiveFilters(): boolean {
    return (
      this.productControl.value !== null ||
      this.userControl.value !== null ||
      this.typeControl.value !== null ||
      this.fromControl.value !== '' ||
      this.toControl.value !== ''
    );
  }
}
