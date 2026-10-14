import { AbstractControl } from '@angular/forms';

export function isFieldInvalid(control: AbstractControl): boolean {
  return control.touched && control.invalid;
}
