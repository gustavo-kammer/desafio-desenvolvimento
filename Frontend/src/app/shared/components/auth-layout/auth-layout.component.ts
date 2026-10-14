import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <main class="grid min-h-screen lg:grid-cols-2">
      <section
        class="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-end"
      >
        <img
          src="/login/login-bg.png"
          alt=""
          width="1122"
          height="1402"
          loading="eager"
          fetchpriority="high"
          class="absolute inset-0 size-full object-cover object-center"
        />
        <div class="absolute inset-0 bg-brand-500/25 mix-blend-multiply" aria-hidden="true"></div>
        <div
          class="absolute inset-0 bg-linear-to-t from-black/90 from-10% via-black/60 via-45% to-transparent to-75%"
          aria-hidden="true"
        ></div>

        <div class="relative p-16">
          <p
            class="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-white/90 uppercase"
          >
            <span class="h-0.5 w-10 bg-brand-500" aria-hidden="true"></span>
          </p>
          <h2 class="title-caps mt-4 text-4xl leading-tight">Controle de estoque</h2>
          <p class="mt-4 max-w-md text-lg text-white/90">
            Entradas, saídas, reservas e histórico completo.
          </p>
        </div>
      </section>

      <section class="flex min-h-screen flex-col bg-surface-subtle">
        <div class="relative h-35 overflow-hidden bg-ink lg:hidden">
          <img
            src="/login/login-bg.png"
            alt=""
            width="1122"
            height="1402"
            loading="eager"
            fetchpriority="high"
            class="absolute inset-0 size-full object-cover object-center"
          />
          <div class="absolute inset-0 bg-brand-500/25 mix-blend-multiply" aria-hidden="true"></div>
          <div
            class="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent"
            aria-hidden="true"
          ></div>
          <p class="title-caps absolute inset-x-0 bottom-0 px-6 pb-6 text-xl text-white">
            Controle de estoque
          </p>
        </div>

        <div class="flex flex-1 items-center justify-center px-4 py-10 sm:px-12">
          <div class="w-full max-w-105">
            <img
              src="/brand/logo.png"
              alt="Torrecid"
              width="2058"
              height="621"
              class="h-12 w-auto"
            />
            <ng-content />
          </div>
        </div>
      </section>
    </main>
  `,
})
export class AuthLayoutComponent {}
