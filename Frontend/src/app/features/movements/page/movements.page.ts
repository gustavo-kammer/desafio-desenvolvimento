import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { errorMessage } from '../../../core/api/api-error';
import { ProductsService } from '../../../core/api/products.service';
import { AuthService } from '../../../core/auth/auth.service';
import { IPagedResult, IProduct, IStockMovement } from '../../../core/models/api.models';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { MOVEMENT_TYPE_LABELS } from '../../../shared/utils/labels';
import { MovementFormComponent } from '../components/movement-form.component';
import { MovementHistoryComponent } from '../components/movement-history.component';

type MovementsTab = 'history' | 'register';

@Component({
  selector: 'app-movements-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MovementFormComponent, MovementHistoryComponent],
  templateUrl: './movements.page.html',
})
export class MovementsPage implements OnInit {
  private readonly _auth: AuthService = inject(AuthService);
  private readonly _toast: ToastService = inject(ToastService);
  private readonly _productsService: ProductsService = inject(ProductsService);

  protected readonly canRegister = computed<boolean>(() =>
    this._auth.hasRole('administrator', 'operator'),
  );
  protected readonly canAdjust = computed<boolean>(() => this._auth.hasRole('administrator'));

  protected readonly tab = signal<MovementsTab>('history');
  protected readonly products = signal<IProduct[]>([]);

  protected readonly activeTabClass: string = 'border-brand-600 text-brand-800';
  protected readonly idleTabClass: string =
    'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900';

  public ngOnInit(): void {
    this.loadProducts();
  }

  protected selectTab(tab: MovementsTab): void {
    this.tab.set(tab);
  }

  protected onRegistered(movement: IStockMovement): void {
    this._toast.success(
      `${MOVEMENT_TYPE_LABELS[movement.type]} registrada: ${movement.product.name} ` +
        `(saldo ${movement.totalBefore} → ${movement.totalAfter}).`,
    );
    this.loadProducts();
  }

  private loadProducts(): void {
    this._productsService.list({ pageSize: 100 }).subscribe({
      next: (result: IPagedResult<IProduct>): void => this.products.set(result.items),
      error: (err: unknown): void => this._toast.error(errorMessage(err)),
    });
  }
}
