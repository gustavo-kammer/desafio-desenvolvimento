import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  host: { class: 'relative block min-w-60 flex-1' },
  template: `
    <label [for]="inputId()" class="sr-only">{{ label() }}</label>
    <svg
      viewBox="0 0 24 24"
      class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-subtle"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    <input
      [id]="inputId()"
      type="search"
      class="field-input h-10 pl-9"
      [placeholder]="placeholder()"
      [formControl]="control()"
    />
  `,
})
export class SearchFieldComponent {
  public readonly control = input.required<FormControl<string>>();
  public readonly inputId = input.required<string>();
  public readonly label = input.required<string>();
  public readonly placeholder = input<string>('');
}
