import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { ButtonComponent, ButtonVariant } from '../button/button.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, ButtonComponent],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  public readonly open = model<boolean>(false);
  public readonly title = input.required<string>();
  public readonly message = input.required<string>();
  public readonly confirmLabel = input<string>('Confirmar');
  public readonly variant = input<ButtonVariant>('danger');
  public readonly loading = input<boolean>(false);

  public readonly confirmed = output<void>();
}
