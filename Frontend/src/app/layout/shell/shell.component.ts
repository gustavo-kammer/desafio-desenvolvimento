import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { IUser } from '../../core/models/api.models';
import { INavItem, NAV_ITEMS } from '../nav-items';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UserMenuComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  private readonly _auth: AuthService = inject(AuthService);

  protected readonly user: Signal<IUser | null> = this._auth.user;
  protected readonly menuOpen = signal<boolean>(false);

  protected readonly items = computed<INavItem[]>(() =>
    NAV_ITEMS.filter((item: INavItem) => !item.roles || this._auth.hasRole(...item.roles)),
  );

  protected readonly activeLinkClass: string =
    'border-brand-primary bg-brand-50 font-semibold text-brand-800';
  protected readonly idleLinkClass: string =
    'border-transparent font-medium text-text-muted hover:bg-slate-50 hover:text-text-strong';

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected logout(): void {
    this._auth.logout();
  }
}
