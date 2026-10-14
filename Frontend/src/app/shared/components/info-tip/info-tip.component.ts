import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let nextId = 0;

@Component({
  selector: 'app-info-tip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'group relative inline-flex align-middle' },
  template: `
    <button
      type="button"
      class="inline-flex size-5 items-center justify-center rounded-full text-text-subtle transition hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:outline-none"
      [attr.aria-label]="label()"
      [attr.aria-describedby]="tipId"
      (keydown.escape)="dismiss($event)"
    >
      <svg
        viewBox="0 0 24 24"
        class="size-4"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    </button>
    <span
      role="tooltip"
      [id]="tipId"
      class="invisible absolute top-full left-1/2 z-20 mt-2 w-64 max-w-[calc(100vw-3rem)] -translate-x-1/2 rounded-md bg-ink px-3 py-2 text-xs leading-relaxed font-normal text-white opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
    >
      {{ text() }}
    </span>
  `,
})
export class InfoTipComponent {
  public readonly text = input.required<string>();
  public readonly label = input<string>('Mais informações');

  protected readonly tipId: string = `info-tip-${nextId++}`;

  protected dismiss(event: Event): void {
    (event.target as HTMLElement).blur();
  }
}
