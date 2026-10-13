import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const BASE = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-brand-50 text-brand-800',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-800',
  info: 'bg-sky-50 text-sky-800',
};

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: `<ng-content />`,
})
export class BadgeComponent {
  public readonly tone = input<BadgeTone>('neutral');

  protected readonly classes = computed<string>(() => `${BASE} ${TONES[this.tone()]}`);
}
