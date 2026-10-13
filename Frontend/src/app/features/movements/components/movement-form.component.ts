import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  Signal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { errorMessage } from '../../../core/api/api-error';
import { MovementOperation, MovementsService } from '../../../core/api/movements.service';
import {
  IMovementRequest,
  IProduct,
  IStockMovement,
  MovementReason,
  UnitOfMeasure,
} from '../../../core/models/api.models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MOVEMENT_REASON_LABELS, UNIT_LABELS } from '../../../shared/utils/labels';

interface IOperationOption {
  value: MovementOperation;
  label: string;
  adjustment: boolean;
}

interface IReasonOption {
  value: MovementReason;
  label: string;
}

type MovementField = 'productId' | 'quantity' | 'reason' | 'justification';

const OPERATIONS: IOperationOption[] = [
  { value: 'entry', label: 'Entrada', adjustment: false },
  { value: 'exit', label: 'Saída', adjustment: false },
  { value: 'adjustmentIn', label: 'Ajuste de entrada', adjustment: true },
  { value: 'adjustmentOut', label: 'Ajuste de saída', adjustment: true },
];

const EXIT_REASONS: MovementReason[] = ['consumption', 'shipment', 'loss', 'other'];
const ADJUSTMENT_REASONS: MovementReason[] = [
  'inventoryCorrection',
  'loss',
  'consumption',
  'shipment',
  'other',
];

@Component({
  selector: 'app-movement-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DecimalPipe, ButtonComponent],
  templateUrl: './movement-form.component.html',
})
export class MovementFormComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _movementsService: MovementsService = inject(MovementsService);

  public readonly products = input.required<IProduct[]>();
  public readonly canAdjust = input<boolean>(false);

  public readonly registered = output<IStockMovement>();

  protected readonly activeClass: string = 'border-brand-600 bg-brand-600 text-white';
  protected readonly idleClass: string =
    'border-slate-300 bg-white text-slate-800 hover:bg-slate-50';

  protected readonly operation = signal<MovementOperation>('entry');
  protected readonly saving = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly operations = computed<IOperationOption[]>(() =>
    OPERATIONS.filter((option: IOperationOption) => !option.adjustment || this.canAdjust()),
  );
  protected readonly isAdjustment = computed<boolean>(
    () => this.operation() === 'adjustmentIn' || this.operation() === 'adjustmentOut',
  );
  protected readonly reasonOptions = computed<IReasonOption[]>(() => {
    const reasons: MovementReason[] = this.isAdjustment() ? ADJUSTMENT_REASONS : EXIT_REASONS;
    return reasons.map((value: MovementReason): IReasonOption => ({
      value,
      label: MOVEMENT_REASON_LABELS[value],
    }));
  });

  protected readonly form = this._fb.group({
    productId: this._fb.control<number | null>(null, Validators.required),
    quantity: this._fb.control<number | null>(null, [Validators.required, Validators.min(0.001)]),
    reason: this._fb.control<MovementReason | null>(null),
    justification: this._fb.nonNullable.control<string>('', Validators.maxLength(500)),
    referenceDocument: this._fb.nonNullable.control<string>('', Validators.maxLength(100)),
  });

  private readonly _selectedProductId: Signal<number | null> = toSignal(
    this.form.controls.productId.valueChanges,
    { initialValue: null },
  );

  protected readonly selectedProduct = computed<IProduct | null>(
    () => this.products().find((p: IProduct) => p.id === this._selectedProductId()) ?? null,
  );

  protected unitLabel(unit: UnitOfMeasure): string {
    return UNIT_LABELS[unit];
  }

  protected isInvalid(field: MovementField): boolean {
    const control = this.form.controls[field];
    return control.touched && control.invalid;
  }

  protected selectOperation(operation: MovementOperation): void {
    this.operation.set(operation);
    this.error.set(null);

    const { reason, justification } = this.form.controls;
    reason.reset(null);

    if (this.isAdjustment()) {
      reason.setValidators(Validators.required);
      justification.setValidators([Validators.required, Validators.maxLength(500)]);
    } else {
      reason.clearValidators();
      justification.setValidators(Validators.maxLength(500));
    }
    reason.updateValueAndValidity();
    justification.updateValueAndValidity();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.productId === null || value.quantity === null) {
      return;
    }

    const operation: MovementOperation = this.operation();
    const request: IMovementRequest = {
      productId: value.productId,
      quantity: value.quantity,
      reason: operation === 'entry' ? null : value.reason,
      justification: value.justification.trim() || null,
      referenceDocument: value.referenceDocument.trim() || null,
    };

    this.saving.set(true);
    this.error.set(null);

    this._movementsService.register(operation, request).subscribe({
      next: (movement: IStockMovement): void => {
        this.saving.set(false);
        this.form.reset();
        this.registered.emit(movement);
      },
      error: (err: unknown): void => {
        this.error.set(errorMessage(err));
        this.saving.set(false);
      },
    });
  }
}
