import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { errorMessage } from '../../../core/api/api-error';
import { UsersService } from '../../../core/api/users.service';
import { IUser, UserRole } from '../../../core/models/api.models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ROLE_LABELS } from '../../../shared/utils/labels';

interface IRoleOption {
  value: UserRole;
  label: string;
}

@Component({
  selector: 'app-user-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _usersService: UsersService = inject(UsersService);

  public readonly user = input<IUser | null>(null);

  public readonly saved = output<IUser>();
  public readonly cancelled = output<void>();

  protected readonly isEditing = computed<boolean>(() => this.user() !== null);
  protected readonly saving = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly roleOptions: IRoleOption[] = (Object.keys(ROLE_LABELS) as UserRole[]).map(
    (value: UserRole): IRoleOption => ({ value, label: ROLE_LABELS[value] }),
  );

  protected readonly form = this._fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    role: ['operator' as UserRole, Validators.required],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });

  public ngOnInit(): void {
    const current: IUser | null = this.user();
    if (current) {
      this.form.patchValue({ name: current.name, email: current.email, role: current.role });
      this.form.controls.password.disable();
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const name: string = value.name.trim();
    const email: string = value.email.trim();
    const current: IUser | null = this.user();

    const request$: Observable<IUser> = current
      ? this._usersService.update(current.id, { name, email, role: value.role })
      : this._usersService.create({ name, email, role: value.role, password: value.password });

    this.saving.set(true);
    this.error.set(null);

    request$.subscribe({
      next: (saved: IUser): void => {
        this.saving.set(false);
        this.saved.emit(saved);
      },
      error: (err: unknown): void => {
        this.error.set(errorMessage(err));
        this.saving.set(false);
      },
    });
  }
}
