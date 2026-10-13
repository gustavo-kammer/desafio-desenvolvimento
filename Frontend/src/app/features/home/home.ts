import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { ICategory } from '../../core/models/api.models';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-home',
  imports: [ButtonComponent, BadgeComponent, PaginationComponent, ModalComponent],
  template: `
    <div class="mx-auto max-w-3xl space-y-6 p-8">
      <header>
        <h1 class="text-2xl font-bold">Olá, {{ auth.user()?.name }}</h1>
        <p class="mt-1 text-slate-600">{{ auth.user()?.email }} · {{ auth.role() }}</p>
      </header>

      <section class="card space-y-4 p-6">
        <h2 class="font-semibold">Botões</h2>
        <div class="flex flex-wrap gap-2">
          <button appButton type="button">Primário</button>
          <button appButton type="button" variant="secondary">Secundário</button>
          <button appButton type="button" variant="danger">Perigo</button>
          <button appButton type="button" variant="ghost">Ghost</button>
          <button appButton type="button" [loading]="true">Salvando</button>
        </div>
      </section>

      <section class="card space-y-4 p-6">
        <h2 class="font-semibold">Badges</h2>
        <div class="flex flex-wrap gap-2">
          <app-badge>Neutro</app-badge>
          <app-badge tone="success">Ativa</app-badge>
          <app-badge tone="warning">Abaixo do mínimo</app-badge>
          <app-badge tone="danger">Cancelada</app-badge>
          <app-badge tone="info">Entrada</app-badge>
        </div>
      </section>

      <section class="card space-y-4 p-6">
        <h2 class="font-semibold">
          Toast, modal e categorias da API ({{ categories()?.length ?? '...' }})
        </h2>
        <div class="flex flex-wrap gap-2">
          <button appButton type="button" (click)="toast.success('Operação concluída.')">
            Toast sucesso
          </button>
          <button
            appButton
            type="button"
            variant="danger"
            (click)="toast.error('Algo deu errado.')"
          >
            Toast erro
          </button>
          <button appButton type="button" variant="secondary" (click)="modalOpen.set(true)">
            Abrir modal
          </button>
        </div>
      </section>

      <section class="card p-6">
        <app-pagination
          [page]="page()"
          [totalPages]="5"
          [totalCount]="87"
          (pageChange)="page.set($event)"
        />
      </section>

      <button appButton type="button" variant="secondary" (click)="auth.logout()">Sair</button>
    </div>

    <app-modal [(open)]="modalOpen" title="Exemplo de modal">
      <p class="text-sm text-slate-700">Conteúdo do modal. Esc, clique fora ou o X fecham.</p>
      <div class="mt-5 flex justify-end">
        <button appButton type="button" (click)="modalOpen.set(false)">Entendi</button>
      </div>
    </app-modal>
  `,
})
export class Home {
  protected readonly auth: AuthService = inject(AuthService);
  protected readonly toast: ToastService = inject(ToastService);

  protected readonly modalOpen = signal<boolean>(false);
  protected readonly page = signal<number>(1);

  protected readonly categories = toSignal(
    inject(HttpClient).get<ICategory[]>(`${environment.apiUrl}/categories`),
  );
}
