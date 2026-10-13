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
import { CategoriesService } from '../../../core/api/categories.service';
import { ICategory, ISaveCategoryRequest } from '../../../core/models/api.models';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-category-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent implements OnInit {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _categoriesService: CategoriesService = inject(CategoriesService);

  public readonly category = input<ICategory | null>(null);

  public readonly saved = output<ICategory>();
  public readonly cancelled = output<void>();

  protected readonly isEditing = computed<boolean>(() => this.category() !== null);
  protected readonly saving = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this._fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', Validators.maxLength(500)],
  });

  public ngOnInit(): void {
    const category: ICategory | null = this.category();
    if (category) {
      this.form.patchValue({ name: category.name, description: category.description ?? '' });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: ISaveCategoryRequest = {
      name: value.name.trim(),
      description: value.description.trim() || null,
    };
    const current: ICategory | null = this.category();

    const request$: Observable<ICategory> = current
      ? this._categoriesService.update(current.id, request)
      : this._categoriesService.create(request);

    this.saving.set(true);
    this.error.set(null);

    request$.subscribe({
      next: (saved: ICategory): void => {
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
