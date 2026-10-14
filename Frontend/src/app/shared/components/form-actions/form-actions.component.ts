import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-form-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  host: { class: 'flex justify-end gap-2 pt-2' },
  template: `
    <button appButton type="button" variant="secondary" (click)="cancelled.emit()">
      {{ cancelLabel() }}
    </button>
    <button appButton type="submit" [loading]="saving()">{{ submitLabel() }}</button>
  `,
})
export class FormActionsComponent {
  public readonly submitLabel = input.required<string>();
  public readonly saving = input<boolean>(false);
  public readonly cancelLabel = input<string>('Cancelar');

  public readonly cancelled = output<void>();
}
