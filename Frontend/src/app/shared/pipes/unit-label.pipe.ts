import { Pipe, PipeTransform } from '@angular/core';
import { UnitOfMeasure } from '../../core/models/api.models';
import { UNIT_LABELS } from '../utils/labels';

@Pipe({ name: 'unitLabel' })
export class UnitLabelPipe implements PipeTransform {
  public transform(unit: UnitOfMeasure): string {
    return UNIT_LABELS[unit];
  }
}
