import { Component, computed, effect, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './features/auth/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  authService = inject(AuthService);
    router = inject(Router)


  public finshedAuthCheck = computed<boolean>(() => {
    if( this.authService.authStatus() === 'checking'){
      return false
    }
    return true
  });

  public authStatusChangedEffect = effect(()=>{
    console.log('authStatus: ', this.authService.authStatus())
    switch(this.authService.authStatus()){
      case 'checking':
        return;

        case 'authenticated':
          this.router.navigateByUrl('/');
          return;

        case 'not-authenticated':
          this.router.navigateByUrl('/auth/login');
          return;
    }
  })

}
