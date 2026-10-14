import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'alert',
    class:
      'flex items-center justify-between gap-3 rounded-lg border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger-strong',
  },
  template: `
    <span><ng-content /></span>
    <ng-content select="[alertAction]" />
  `,
})
export class AlertComponent {}
