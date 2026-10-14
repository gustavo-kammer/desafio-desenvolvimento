import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastKind, ToastService } from './toast.service';

const KIND_CLASSES: Record<ToastKind, string> = {
  success: 'bg-brand-700',
  error: 'bg-danger',
  info: 'bg-ink',
};

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-container.component.html',
})
export class ToastContainerComponent {
  protected readonly toastService: ToastService = inject(ToastService);

  protected kindClass(kind: ToastKind): string {
    return KIND_CLASSES[kind];
  }
}
