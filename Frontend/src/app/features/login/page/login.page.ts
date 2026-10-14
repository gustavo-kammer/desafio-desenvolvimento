import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../../core/api/api-error';
import { APP_VERSION, SUPPORT_EMAIL } from '../../../core/app.constants';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AuthLayoutComponent } from '../../../shared/components/auth-layout/auth-layout.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { isFieldInvalid } from '../../../shared/utils/forms';

interface ILoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
  remember: FormControl<boolean>;
}

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthLayoutComponent, AlertComponent, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _auth: AuthService = inject(AuthService);
  private readonly _router: Router = inject(Router);
  private readonly _emailInput = viewChild.required<ElementRef<HTMLInputElement>>('emailInput');

  protected readonly version: string = APP_VERSION;
  protected readonly supportEmail: string = SUPPORT_EMAIL;
  protected readonly year: number = new Date().getFullYear();

  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal<boolean>(false);

  protected readonly isInvalid = isFieldInvalid;

  protected readonly form: FormGroup<ILoginForm> = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    remember: [true],
  });

  public constructor() {
    afterNextRender((): void => this._emailInput().nativeElement.focus());
  }

  protected togglePassword(): void {
    this.showPassword.update((visible: boolean): boolean => !visible);
  }

  protected submit(): void {
    if (this.loading()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password, remember } = this.form.getRawValue();
    this._auth.login(email, password, remember).subscribe({
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
