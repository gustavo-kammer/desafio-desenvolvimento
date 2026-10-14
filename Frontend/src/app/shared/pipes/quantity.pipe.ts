import { formatNumber } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { UnitOfMeasure } from '../../core/models/api.models';
import { UNIT_LABELS } from '../utils/labels';

@Pipe({ name: 'quantity' })
export class QuantityPipe implements PipeTransform {
  private readonly _locale: string = inject(LOCALE_ID);

  public transform(value: number | null | undefined, unit?: UnitOfMeasure): string {
    if (value === null || value === undefined) {
      return '';
    }

    const formatted: string = formatNumber(value, this._locale, '1.0-3');
    return unit ? `${formatted} ${UNIT_LABELS[unit]}` : formatted;
  }
}
