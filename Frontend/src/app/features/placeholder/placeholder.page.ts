import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-2xl font-bold">{{ title }}</h1>
    <p class="mt-2 text-slate-600">Esta tela será construída nos próximos passos.</p>
  `,
})
export class PlaceholderPage {
  protected readonly title: string = inject(ActivatedRoute).snapshot.data['title'] as string;
}
