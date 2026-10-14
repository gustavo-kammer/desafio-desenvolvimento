import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SUPPORT_EMAIL } from '../../../core/app.constants';
import { AuthLayoutComponent } from '../../../shared/components/auth-layout/auth-layout.component';

interface IStep {
  title: string;
  description: string;
}

@Component({
  selector: 'app-forgot-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthLayoutComponent, RouterLink],
  templateUrl: './forgot-password.page.html',
})
export class ForgotPasswordPage {
  protected readonly supportEmail: string = SUPPORT_EMAIL;
  protected readonly supportLink: string = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    'Redefinição de senha - Controle de estoque',
  )}`;

  protected readonly steps: IStep[] = [
    {
      title: 'Procure um administrador',
      description: 'Informe o e-mail que você usa para entrar no sistema.',
    },
    {
      title: 'Ele define uma nova senha',
      description: 'A redefinição é feita na tela de usuários, em "Redefinir senha".',
    },
    {
      title: 'Entre com a nova senha',
      description: 'Volte ao login e acesse normalmente.',
    },
  ];
}
