import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { errorMessage } from '../../../core/api/api-error';
import { CategoriesService } from '../../../core/api/categories.service';
import { ICategory } from '../../../core/models/api.models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { CategoryFormComponent } from '../components/category-form.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchFieldComponent } from '../../../shared/components/search-field/search-field.component';

@Component({
  selector: 'app-categories-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  imports: [
    SearchFieldComponent,
    PageHeaderComponent,
    AlertComponent,
    ButtonComponent,
    ModalComponent,
    CategoryFormComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './categories.page.html',
})
export class CategoriesPage implements OnInit {
  private readonly _categoriesService: CategoriesService = inject(CategoriesService);
  private readonly _toast: ToastService = inject(ToastService);

  protected readonly categories = signal<ICategory[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchControl = new FormControl<string>('', { nonNullable: true });
  private readonly _search = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  protected readonly formOpen = signal<boolean>(false);
  protected readonly editing = signal<ICategory | null>(null);

  public ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this._categoriesService.list().subscribe({
      next: (list: ICategory[]): void => {
        this.categories.set(list);
        this.loading.set(false);
      },
      error: (err: unknown): void => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(category: ICategory): void {
    this.editing.set(category);
    this.formOpen.set(true);
  }

  protected onSaved(category: ICategory): void {
    const wasEditing: boolean = this.editing() !== null;
    this._toast.success(
      wasEditing
        ? `Categoria "${category.name}" atualizada.`
        : `Categoria "${category.name}" criada.`,
    );
    this.formOpen.set(false);
    this.load();
  }

  protected readonly filtered = computed<ICategory[]>(() => {
    const term: string = this._search().trim().toLowerCase();
    if (term === '') {
      return this.categories();
    }
    return this.categories().filter(
      (category: ICategory): boolean =>
        category.name.toLowerCase().includes(term) ||
        (category.description ?? '').toLowerCase().includes(term),
    );
  });
}
