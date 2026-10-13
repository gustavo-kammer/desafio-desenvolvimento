import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole } from '../../core/models/api.models';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ROLE_LABELS } from '../../shared/utils/labels';
import { INavItem, NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BadgeComponent, ButtonComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  private readonly _auth: AuthService = inject(AuthService);

  protected readonly user = this._auth.user;
  protected readonly menuOpen = signal<boolean>(false);

  protected readonly items = computed<INavItem[]>(() =>
    NAV_ITEMS.filter((item: INavItem) => !item.roles || this._auth.hasRole(...item.roles)),
  );

  protected readonly activeLinkClass: string = 'border-brand-500 bg-white/10 text-white';
  protected readonly idleLinkClass: string =
    'border-transparent text-white/70 hover:bg-white/5 hover:text-white';

  protected roleLabel(role: UserRole): string {
    return ROLE_LABELS[role];
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected logout(): void {
    this._auth.logout();
  }
}
