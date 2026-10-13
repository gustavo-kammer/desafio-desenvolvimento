import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { errorMessage } from '../../../core/api/api-error';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _auth: AuthService = inject(AuthService);
  private readonly _router: Router = inject(Router);

  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal<boolean>(false);

  protected readonly form = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected togglePassword(): void {
    this.showPassword.update((visible: boolean): boolean => !visible);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.getRawValue();
    this._auth.login(email, password).subscribe({
      next: (): void => {
        void this._router.navigate(['/']);
      },
      error: (err: unknown): void => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }
}
