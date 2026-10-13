import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../components/button/button.component';

@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  public readonly page = input.required<number>();
  public readonly totalPages = input.required<number>();
  public readonly totalCount = input<number>(0);

  public readonly pageChange = output<number>();

  protected go(target: number): void {
    if (target >= 1 && target <= this.totalPages()) {
      this.pageChange.emit(target);
    }
  }
}
