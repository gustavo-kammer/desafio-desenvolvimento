import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { IUser } from '../../core/models/api.models';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { getInitials } from '../../shared/utils/initials';
import { ROLE_LABELS } from '../../shared/utils/labels';

@Component({
  selector: 'app-user-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(keydown.escape)': 'close(true)',
  },
  templateUrl: './user-menu.component.html',
})
export class UserMenuComponent {
  private readonly _host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  public readonly user = input.required<IUser>();
  public readonly signOut = output<void>();

  protected readonly open = signal<boolean>(false);
  protected readonly initials = computed<string>(() => getInitials(this.user().name));
  protected readonly roleLabel = computed<string>(() => ROLE_LABELS[this.user().role]);

  protected toggle(): void {
    this.open.update((value: boolean): boolean => !value);
  }

  protected close(restoreFocus = false): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    if (restoreFocus) {
      this._trigger().nativeElement.focus();
    }
  }

  protected onDocumentClick(event: Event): void {
    const target: EventTarget | null = event.target;
    if (this.open() && target instanceof Node && !this._host.nativeElement.contains(target)) {
      this.open.set(false);
    }
  }

  protected confirmSignOut(): void {
    this.open.set(false);
    this.signOut.emit();
  }
}
