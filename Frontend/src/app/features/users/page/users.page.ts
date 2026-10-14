import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { UserFormComponent } from '../components/user-form.component';
import { ResetPasswordFormComponent } from '../components/reset-password-form.component';
import { UsersService } from '../../../core/api/users.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ROLE_LABELS } from '../../../shared/utils/labels';
import { IUser, UserRole } from '../../../core/models/api.models';
import { errorMessage } from '../../../core/api/api-error';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchFieldComponent } from '../../../shared/components/search-field/search-field.component';

type UserStatusFilter = '' | 'active' | 'inactive';

@Component({
  selector: 'app-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  imports: [
    SearchFieldComponent,
    PageHeaderComponent,
    AlertComponent,
    DatePipe,
    BadgeComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    ModalComponent,
    UserFormComponent,
    ResetPasswordFormComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './users.page.html',
})
export class UsersPage implements OnInit {
  private readonly _usersService: UsersService = inject(UsersService);
  private readonly _auth: AuthService = inject(AuthService);
  private readonly _toast: ToastService = inject(ToastService);

  protected readonly roleLabels = ROLE_LABELS;
  protected readonly roles = Object.keys(ROLE_LABELS) as UserRole[];

  protected readonly searchControl = new FormControl<string>('', { nonNullable: true });
  protected readonly roleControl = new FormControl<UserRole | ''>('', { nonNullable: true });
  protected readonly statusControl = new FormControl<UserStatusFilter>('', { nonNullable: true });

  private readonly _search = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  private readonly _role = toSignal(this.roleControl.valueChanges, { initialValue: '' });
  private readonly _status = toSignal(this.statusControl.valueChanges, { initialValue: '' });

  protected readonly users = signal<IUser[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  protected readonly formOpen = signal<boolean>(false);
  protected readonly editing = signal<IUser | null>(null);

  protected readonly passwordOpen = signal<boolean>(false);
  protected readonly passwordTarget = signal<IUser | null>(null);

  protected readonly confirmOpen = signal<boolean>(false);
  protected readonly confirmTarget = signal<IUser | null>(null);
  protected readonly acting = signal<boolean>(false);

  protected readonly confirmTitle = computed<string>(() =>
    this.confirmTarget()?.isActive ? 'Desativar usuário' : 'Ativar usuário',
  );

  protected readonly confirmMessage = computed<string>(() => {
    const target: IUser | null = this.confirmTarget();
    if (!target) {
      return '';
    }
    return target.isActive
      ? `"${target.name}" não conseguirá mais entrar no sistema. O histórico é mantido.`
      : `"${target.name}" voltará a ter acesso ao sistema.`;
  });

  public ngOnInit(): void {
    this.load();
  }

  protected isSelf(user: IUser): boolean {
    return this._auth.user()?.id === user.id;
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this._usersService.list().subscribe({
      next: (list: IUser[]): void => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: (err: unknown): void => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(user: IUser): void {
    this.editing.set(user);
    this.formOpen.set(true);
  }

  protected onSaved(user: IUser): void {
    const wasEditing: boolean = this.editing() !== null;
    this._toast.success(
      wasEditing ? `Usuário "${user.name}" atualizado.` : `Usuário "${user.name}" criado.`,
    );
    this.formOpen.set(false);
    this.load();
  }

  protected openPassword(user: IUser): void {
    this.passwordTarget.set(user);
    this.passwordOpen.set(true);
  }

  protected onPasswordSaved(): void {
    this._toast.success('Senha redefinida com sucesso.');
    this.passwordOpen.set(false);
  }

  protected askToggle(user: IUser): void {
    this.confirmTarget.set(user);
    this.confirmOpen.set(true);
  }

  protected confirmToggle(): void {
    const target: IUser | null = this.confirmTarget();
    if (!target || this.acting()) {
      return;
    }

    this.acting.set(true);
    this._usersService.setActive(target.id, !target.isActive).subscribe({
      next: (updated: IUser): void => {
        this.acting.set(false);
        this.confirmOpen.set(false);
        this._toast.success(
          updated.isActive ? `"${updated.name}" ativado.` : `"${updated.name}" desativado.`,
        );
        this.load();
      },
      error: (err: unknown): void => {
        this.acting.set(false);
        this.confirmOpen.set(false);
        this._toast.error(errorMessage(err));
      },
    });
  }

  protected readonly filtered = computed<IUser[]>(() => {
    const term: string = this._search().trim().toLowerCase();
    const role: UserRole | '' = this._role();
    const status: UserStatusFilter = this._status();

    return this.users().filter(
      (user: IUser): boolean =>
        (term === '' ||
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)) &&
        (role === '' || user.role === role) &&
        (status === '' || (status === 'active') === user.isActive),
    );
  });

  protected readonly hasFilters = computed<boolean>(
    () => this._search().trim() !== '' || this._role() !== '' || this._status() !== '',
  );

  protected clearFilters(): void {
    this.searchControl.reset();
    this.roleControl.reset();
    this.statusControl.reset();
  }
}
