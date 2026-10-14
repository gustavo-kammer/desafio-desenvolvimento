import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { errorMessage } from '../../../core/api/api-error';
import { ProductsService } from '../../../core/api/products.service';
import { AuthService } from '../../../core/auth/auth.service';
import { IPagedResult, IProduct, IStockMovement } from '../../../core/models/api.models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { MOVEMENT_TYPE_LABELS } from '../../../shared/utils/labels';
import { MovementFormComponent } from '../components/movement-form.component';
import { MovementHistoryComponent } from '../components/movement-history.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-movements-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  imports: [
    PageHeaderComponent,
    ButtonComponent,
    ModalComponent,
    MovementFormComponent,
    MovementHistoryComponent,
  ],
  templateUrl: './movements.page.html',
})
export class MovementsPage implements OnInit {
  private readonly _auth: AuthService = inject(AuthService);
  private readonly _toast: ToastService = inject(ToastService);
  private readonly _productsService: ProductsService = inject(ProductsService);
  private readonly _history = viewChild.required(MovementHistoryComponent);

  protected readonly canRegister = computed<boolean>(() =>
    this._auth.hasRole('administrator', 'operator'),
  );
  protected readonly canAdjust = computed<boolean>(() => this._auth.hasRole('administrator'));

  protected readonly products = signal<IProduct[]>([]);
  protected readonly formOpen = signal<boolean>(false);

  public ngOnInit(): void {
    this.loadProducts();
  }

  protected openRegister(): void {
    this.formOpen.set(true);
  }

  protected onRegistered(movement: IStockMovement): void {
    this.formOpen.set(false);
    this._toast.success(
      `${MOVEMENT_TYPE_LABELS[movement.type]} registrada: ${movement.product.name} ` +
        `(saldo ${movement.totalBefore} → ${movement.totalAfter}).`,
    );
    this.loadProducts();
    this._history().refresh();
  }

  private loadProducts(): void {
    this._productsService.list({ pageSize: 100 }).subscribe({
      next: (result: IPagedResult<IProduct>): void => this.products.set(result.items),
      error: (err: unknown): void => this._toast.error(errorMessage(err)),
    });
  }
}
