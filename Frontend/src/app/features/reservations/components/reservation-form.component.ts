import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  Signal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';

import { ProductsService } from '../../../core/api/products.service';
import { errorMessage } from '../../../core/api/api-error';
import { ReservationsService } from '../../../core/api/reservations.service';
import { IPagedResult, IProduct, IReservation } from '../../../core/models/api.models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { UNIT_LABELS } from '../../../shared/utils/labels';

@Component({
  selector: 'app-reservation-form',
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './reservation-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationFormComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _reservations: ReservationsService = inject(ReservationsService);
  private readonly _products: ProductsService = inject(ProductsService);
  private readonly _toast: ToastService = inject(ToastService);

  public readonly saved = output<IReservation>();
  public readonly cancelled = output<void>();

  protected readonly unitLabels = UNIT_LABELS;
  protected readonly saving = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly products: Signal<IProduct[]> = toSignal(
    this._products.list({ page: 1, pageSize: 100 }).pipe(
      map((result: IPagedResult<IProduct>): IProduct[] => result.items),
      catchError((): Observable<IProduct[]> => of<IProduct[]>([])),
    ),
    { initialValue: [] },
  );
  protected readonly form = this._fb.nonNullable.group({
    productId: [0, [Validators.min(1)]],
    quantity: [1, [Validators.required, Validators.min(0.001)]],
  });

  private readonly _selectedProductId: Signal<number> = toSignal(
    this.form.controls.productId.valueChanges,
    { initialValue: 0 },
  );

  protected readonly quantityStep = computed<number>(() => {
    const selected: IProduct | undefined = this.products().find(
      (p: IProduct): boolean => p.id === Number(this._selectedProductId()),
    );
    return selected?.unit === 'unit' ? 1 : 0.001;
  });

  protected submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const { productId, quantity } = this.form.getRawValue();
    this._reservations.create({ productId: Number(productId), quantity }).subscribe({
      next: (reservation: IReservation): void => {
        this.saving.set(false);
        this._toast.success('Reserva criada com sucesso.');
        this.saved.emit(reservation);
      },
      error: (err: unknown): void => {
        this.saving.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }

  protected cancel(): void {
    this.cancelled.emit();
  }
}
