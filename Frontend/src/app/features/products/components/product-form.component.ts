import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { errorMessage } from '../../../core/api/api-error';
import { ProductsService } from '../../../core/api/products.service';
import { ICategory, IProduct, UnitOfMeasure } from '../../../core/models/api.models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IUnitOption, UNIT_OPTIONS } from '../../../shared/utils/labels';

type ProductField = 'categoryId' | 'code' | 'name' | 'minimumStock' | 'description';

@Component({
  selector: 'app-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _productsService: ProductsService = inject(ProductsService);

  public readonly product = input<IProduct | null>(null);
  public readonly categories = input.required<ICategory[]>();

  public readonly saved = output<IProduct>();
  public readonly cancelled = output<void>();

  protected readonly unitOptions: IUnitOption[] = UNIT_OPTIONS;
  protected readonly isEditing = computed<boolean>(() => this.product() !== null);
  protected readonly saving = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this._fb.group({
    categoryId: this._fb.control<number | null>(null, Validators.required),
    code: this._fb.nonNullable.control<string>('', [Validators.required, Validators.maxLength(40)]),
    name: this._fb.nonNullable.control<string>('', [
      Validators.required,
      Validators.maxLength(150),
    ]),
    unit: this._fb.nonNullable.control<UnitOfMeasure>('kg'),
    minimumStock: this._fb.nonNullable.control<number>(0, [Validators.required, Validators.min(0)]),
    description: this._fb.nonNullable.control<string>('', Validators.maxLength(500)),
  });

  public ngOnInit(): void {
    const product: IProduct | null = this.product();
    if (!product) {
      return;
    }

    this.form.patchValue({
      categoryId: product.category?.id ?? null,
      code: product.code,
      name: product.name,
      unit: product.unit,
      minimumStock: product.minimumStock,
      description: product.description ?? '',
    });
    this.form.controls.code.disable();
    this.form.controls.unit.disable();
  }

  protected isInvalid(field: ProductField): boolean {
    const control = this.form.controls[field];
    return control.touched && control.invalid;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.categoryId === null) {
      return;
    }

    const description: string | null = value.description.trim() || null;
    const current: IProduct | null = this.product();

    const request$: Observable<IProduct> = current
      ? this._productsService.update(current.id, {
          categoryId: value.categoryId,
          name: value.name.trim(),
          minimumStock: value.minimumStock,
          description,
        })
      : this._productsService.create({
          categoryId: value.categoryId,
          code: value.code.trim(),
          name: value.name.trim(),
          unit: value.unit,
          minimumStock: value.minimumStock,
          description,
        });

    this.saving.set(true);
    this.error.set(null);

    request$.subscribe({
      next: (saved: IProduct): void => {
        this.saving.set(false);
        this.saved.emit(saved);
      },
      error: (err: unknown): void => {
        this.error.set(errorMessage(err));
        this.saving.set(false);
      },
    });
  }
}
