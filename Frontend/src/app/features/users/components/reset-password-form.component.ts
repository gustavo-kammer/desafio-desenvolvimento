import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { errorMessage } from '../../../core/api/api-error';
import { UsersService } from '../../../core/api/users.service';
import { IUser } from '../../../core/models/api.models';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-reset-password-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './reset-password-form.component.html',
})
export class ResetPasswordFormComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _usersService: UsersService = inject(UsersService);

  public readonly user = input.required<IUser>();

  public readonly saved = output<void>();
  public readonly cancelled = output<void>();

  protected readonly saving = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this._fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this._usersService
      .resetPassword(this.user().id, { newPassword: this.form.getRawValue().newPassword })
      .subscribe({
        next: (): void => {
          this.saving.set(false);
          this.saved.emit();
        },
        error: (err: unknown): void => {
          this.error.set(errorMessage(err));
          this.saving.set(false);
        },
      });
  }
}
