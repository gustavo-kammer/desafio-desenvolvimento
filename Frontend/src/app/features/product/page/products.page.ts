import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import { ICategory, IPagedResult, IProduct, UnitOfMeasure } from '../../../core/models/api.models';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { UNIT_LABELS } from '../../../shared/utils/labels';

@Component({
  selector: 'app-products-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DecimalPipe, BadgeComponent, ButtonComponent, PaginationComponent],
  templateUrl: './products.page.html',
})
export class ProductsPage implements OnInit {
  private readonly _productsService: ProductsService = inject(ProductsService);
  private readonly _categoriesService: CategoriesService = inject(CategoriesService);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _reload$: Subject<void> = new Subject<void>();

  protected readonly searchControl = new FormControl<string>('', { nonNullable: true });
  protected readonly categoryControl = new FormControl<number | null>(null);
  protected readonly belowMinimumControl = new FormControl<boolean>(false, { nonNullable: true });

  protected readonly categories = signal<ICategory[]>([]);
  protected readonly result = signal<IPagedResult<IProduct> | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly page = signal<number>(1);

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

  protected unitLabel(unit: UnitOfMeasure): string {
    return UNIT_LABELS[unit];
  }

  private buildFilter(): IProductFilter {
    return {
      search: this.searchControl.value,
      categoryId: this.categoryControl.value,
      onlyBelowMinimumStock: this.belowMinimumControl.value,
      page: this.page(),
    };
  }
}
