import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  model,
  viewChild,
} from '@angular/core';

export type ModalSize = 'md' | 'lg';
const SIZE_CLASSES: Record<ModalSize, string> = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  public readonly open = model<boolean>(false);
  public readonly title = input.required<string>();
  public readonly size = input<ModalSize>('md');

  protected readonly sizeClass = computed<string>(() => SIZE_CLASSES[this.size()]);

  private readonly _dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  public constructor() {
    effect((): void => {
      const dialog: HTMLDialogElement = this._dialog().nativeElement;
      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  public close(): void {
    this.open.set(false);
  }

  protected onNativeClose(): void {
    this.open.set(false);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this._dialog().nativeElement) {
      this.close();
    }
  }
}
