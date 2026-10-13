import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  model,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  public readonly open = model<boolean>(false);
  public readonly title = input.required<string>();

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
