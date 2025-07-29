import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordsMatchValidator(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const password = form.get('password')?.value;
    const password2 = form.get('password2')?.value;

    return password === password2 ? null : { passwordsMismatch: true };
  };
}
