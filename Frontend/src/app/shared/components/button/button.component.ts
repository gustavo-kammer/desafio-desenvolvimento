import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type ButtonVariant = 'primary' | 'add' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold transition focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';

const PRIMARY = 'bg-brand-primary text-white hover:bg-brand-primary-hover';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: PRIMARY,
  add: PRIMARY,
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
  danger: 'bg-danger text-white hover:bg-danger-strong',
  ghost: 'text-slate-700 hover:bg-slate-100',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'rounded-md px-3 py-1.5 text-xs',
  md: 'rounded-md px-4 py-2.5 text-sm',
  lg: 'h-12 rounded-lg px-6 text-base',
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- atributo em <button> preserva a semântica nativa
  selector: 'button[appButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.aria-busy]': "loading() ? 'true' : null",
    '[disabled]': 'disabled() || loading()',
  },
  template: `
    @if (loading()) {
      <span
        class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden="true"
      ></span>
    } @else if (variant() === 'add') {
      <svg
        viewBox="0 0 24 24"
        [class]="iconClass()"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    }
    <ng-content />
  `,
})
export class ButtonComponent {
  public readonly variant = input<ButtonVariant>('primary');
  public readonly size = input<ButtonSize>('md');
  public readonly loading = input<boolean>(false);
  public readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  protected readonly classes = computed<string>(
    () => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}`,
  );

  protected readonly iconClass = computed<string>(() =>
    this.size() === 'sm' ? 'size-3.5' : 'size-4',
  );
}
