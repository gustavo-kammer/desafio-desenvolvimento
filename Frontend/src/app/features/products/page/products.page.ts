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
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  merge,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { errorMessage } from '../../../core/api/api-error';
import { CategoriesService } from '../../../core/api/categories.service';
import { IProductFilter, ProductsService } from '../../../core/api/products.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ICategory, IPagedResult, IProduct } from '../../../core/models/api.models';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ProductFormComponent } from '../components/product-form.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchFieldComponent } from '../../../shared/components/search-field/search-field.component';
import { QuantityPipe } from '../../../shared/pipes/quantity.pipe';

@Component({
  selector: 'app-products-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    QuantityPipe,
    SearchFieldComponent,
    PageHeaderComponent,
    AlertComponent,
    ReactiveFormsModule,
    BadgeComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    ModalComponent,
    PaginationComponent,
    ProductFormComponent,
  ],
  templateUrl: './products.page.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class ProductsPage implements OnInit {
  private readonly _auth: AuthService = inject(AuthService);
  private readonly _toast: ToastService = inject(ToastService);
  private readonly _productsService: ProductsService = inject(ProductsService);
  private readonly _categoriesService: CategoriesService = inject(CategoriesService);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _reload$: Subject<void> = new Subject<void>();

  protected readonly searchControl = new FormControl<string>('', { nonNullable: true });
  protected readonly categoryControl = new FormControl<number | null>(null);
  protected readonly belowMinimumControl = new FormControl<boolean>(false, { nonNullable: true });
  protected readonly hasFilters = signal<boolean>(false);

  protected readonly canManage = computed<boolean>(() => this._auth.hasRole('administrator'));

  protected readonly categories = signal<ICategory[]>([]);
  protected readonly result = signal<IPagedResult<IProduct> | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly page = signal<number>(1);

  protected readonly formOpen = signal<boolean>(false);
  protected readonly editing = signal<IProduct | null>(null);

  protected readonly archiveOpen = signal<boolean>(false);
  protected readonly archiveTarget = signal<IProduct | null>(null);
  protected readonly archiving = signal<boolean>(false);
  protected readonly archiveMessage = computed<string>(
    () =>
      `Deseja arquivar "${this.archiveTarget()?.name ?? ''}"? O produto deixa de aparecer na lista, mas o histórico de movimentações é mantido.`,
  );

  public ngOnInit(): void {
    this._categoriesService.list().subscribe({
      next: (list: ICategory[]): void => this.categories.set(list),
      error: (err: unknown): void => this.error.set(errorMessage(err)),
    });

    this._reload$
      .pipe(
        startWith(undefined),
        tap((): void => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() =>
          this._productsService.list(this.buildFilter()).pipe(
            catchError((err: unknown) => {
              this.error.set(errorMessage(err));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((result: IPagedResult<IProduct> | null): void => {
        if (result) {
          this.result.set(result);
        }
        this.loading.set(false);
      });

    merge(
      this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
      this.categoryControl.valueChanges,
      this.belowMinimumControl.valueChanges,
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

  protected openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(product: IProduct): void {
    this.editing.set(product);
    this.formOpen.set(true);
  }

  protected onSaved(product: IProduct): void {
    const wasEditing: boolean = this.editing() !== null;
    this._toast.success(
      wasEditing ? `Produto "${product.name}" atualizado.` : `Produto "${product.name}" criado.`,
    );
    this.formOpen.set(false);
    this.reload();
  }

  protected askArchive(product: IProduct): void {
    this.archiveTarget.set(product);
    this.archiveOpen.set(true);
  }

  protected confirmArchive(): void {
    const target: IProduct | null = this.archiveTarget();
    if (!target) {
      return;
    }

    this.archiving.set(true);
    this._productsService.archive(target.id).subscribe({
      next: (): void => {
        this._toast.success(`Produto "${target.name}" arquivado.`);
        this.archiving.set(false);
        this.archiveOpen.set(false);
        this.reload();
      },
      error: (err: unknown): void => {
        this._toast.error(errorMessage(err));
        this.archiving.set(false);
        this.archiveOpen.set(false);
      },
    });
  }

  private buildFilter(): IProductFilter {
    return {
      search: this.searchControl.value,
      categoryId: this.categoryControl.value,
      onlyBelowMinimumStock: this.belowMinimumControl.value,
      page: this.page(),
    };
  }

  protected clearFilters(): void {
    this.hasFilters.set(false);
    this.searchControl.reset();
    this.categoryControl.reset();
    this.belowMinimumControl.reset();
  }

  private hasActiveFilters(): boolean {
    return (
      this.searchControl.value.trim() !== '' ||
      this.categoryControl.value !== null ||
      this.belowMinimumControl.value
    );
  }
}
