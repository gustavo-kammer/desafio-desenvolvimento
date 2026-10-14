import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mb-6 flex shrink-0 flex-wrap items-start justify-between gap-3' },
  template: `
    <div>
      <h1 class="title-caps text-2xl text-text-strong">{{ heading() }}</h1>
      <p class="mt-1 text-sm text-text-muted">{{ subtitle() }}</p>
    </div>
    <ng-content />
  `,
})
export class PageHeaderComponent {
  public readonly heading = input.required<string>();
  public readonly subtitle = input.required<string>();
}
