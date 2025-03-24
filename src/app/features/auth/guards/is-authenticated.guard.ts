import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.authStatus() === 'authenticated') {
    return true
  };

  // if (authService.authStatus() === 'checking') {
  //   return false
  // };

  router.navigateByUrl('/auth/login')
  return false;
};
