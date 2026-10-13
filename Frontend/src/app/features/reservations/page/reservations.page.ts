import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, catchError, of, startWith, switchMap, tap } from 'rxjs';

import { errorMessage } from '../../../core/api/api-error';
import { ReservationsService } from '../../../core/api/reservations.service';
import { AuthService } from '../../../core/auth/auth.service';
import { IReservation, ReservationStatus } from '../../../core/models/api.models';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { RESERVATION_STATUS_LABELS, UNIT_LABELS } from '../../../shared/utils/labels';
import { ReservationFormComponent } from '../components/reservation-form.component';

type ReservationAction = 'cancel' | 'consume';

@Component({
  selector: 'app-reservations-page',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    BadgeComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    ModalComponent,
    ReservationFormComponent,
  ],
  templateUrl: './reservations.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationsPage {
  private readonly _reservations: ReservationsService = inject(ReservationsService);
  private readonly _auth: AuthService = inject(AuthService);
  private readonly _toast: ToastService = inject(ToastService);
  private readonly _reload$: Subject<void> = new Subject<void>();

  protected readonly statusLabels = RESERVATION_STATUS_LABELS;
  protected readonly unitLabels = UNIT_LABELS;

  protected readonly statusControl = new FormControl<ReservationStatus | ''>('', {
    nonNullable: true,
  });

  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly items = signal<IReservation[]>([]);

  protected readonly formOpen = signal<boolean>(false);
  protected readonly confirmOpen = signal<boolean>(false);
  protected readonly acting = signal<boolean>(false);
  protected readonly selected = signal<IReservation | null>(null);
  protected readonly action = signal<ReservationAction>('cancel');

  // Ajuste conforme o que você expõe no AuthService (veja nota no fim)
  protected readonly canOperate = computed<boolean>(() => {
    const role = this._auth.user()?.role;
    return role === 'administrator' || role === 'operator';
  });

  protected readonly confirmTitle = computed<string>(() =>
    this.action() === 'cancel' ? 'Cancelar reserva' : 'Consumir reserva',
  );

  protected readonly confirmMessage = computed<string>(() => {
    const item = this.selected();
    const product = item?.product?.name ?? 'produto';
    return this.action() === 'cancel'
      ? `A quantidade reservada de "${product}" voltará a ficar disponível.`
      : `A quantidade reservada de "${product}" será baixada definitivamente do estoque.`;
  });

  public constructor() {
    this._reload$
      .pipe(
        startWith(undefined),
        tap((): void => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() =>
          this._reservations.list({ status: this.statusControl.value }).pipe(
            catchError((err: unknown) => {
              this.error.set(errorMessage(err));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((result: IReservation[] | null): void => {
        this.loading.set(false);
        if (result) {
          this.items.set(result);
        }
      });

    this.statusControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((): void => this.reload());
  }

  protected reload(): void {
    this._reload$.next();
  }

  protected tone(status: ReservationStatus): BadgeTone {
    switch (status) {
      case 'active':
        return 'info';
      case 'consumed':
        return 'success';
      default:
        return 'neutral';
    }
  }

  protected openCreate(): void {
    this.formOpen.set(true);
  }

  protected onSaved(): void {
    this.formOpen.set(false);
    this.reload();
  }

  protected askAction(item: IReservation, action: ReservationAction): void {
    this.selected.set(item);
    this.action.set(action);
    this.confirmOpen.set(true);
  }

  protected confirm(): void {
    const item = this.selected();
    if (!item || this.acting()) {
      return;
    }

    this.acting.set(true);
    const request$ =
      this.action() === 'cancel'
        ? this._reservations.cancel(item.id)
        : this._reservations.consume(item.id);

    request$.subscribe({
      next: (): void => {
        this.acting.set(false);
        this.confirmOpen.set(false);
        this._toast.success(
          this.action() === 'cancel' ? 'Reserva cancelada.' : 'Reserva consumida.',
        );
        this.reload();
      },
      error: (err: unknown): void => {
        this.acting.set(false);
        this.confirmOpen.set(false);
        this._toast.error(errorMessage(err));
      },
    });
  }
}
