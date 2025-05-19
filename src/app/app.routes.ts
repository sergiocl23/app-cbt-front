import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/pages/not-found/not-found.component';
import { MainLayoutPageComponent } from './core/main-layout-page/main-layout-page.component';
import { AuthLayoutPageComponent } from './core/auth-layout-page/auth-layout-page.component';
import { isAuthenticatedGuard } from './features/auth/guards/is-authenticated.guard';
import { isNotAuthenticatedGuard } from './features/auth/guards/is-not-authenticated.guard';


export const routes: Routes = [
  {
    path: '',
    // canActivate: [ isAuthenticatedGuard ],
    component: MainLayoutPageComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./features/home/home.routes').then( r => r.routes)
      },
      {
        path: 'news',
        loadChildren: () => import('./features/news/news.routes').then( r => r.routes)
      },
      {
        path: 'simulation',
        loadChildren: () => import('./features/simulation/simulation.routes').then( r => r.routes)
      },
      {
        path: 'map',
        loadChildren: () => import('./features/map/map.routes').then( r => r.routes)
      },
      {
        path: 'companies',
        loadChildren: () => import('./features/companies/companies.routes').then( r => r.routes)
      },
      {
        path: 'meetings',
        loadChildren: () => import('./features/meetings/meetings.routes').then( r => r.routes)
      },
      {
        path: 'forum',
        loadChildren: () => import('./features/forum/forum.routes').then( r => r.routes)
      },
      {
        path: '',
        redirectTo: 'news',
        // redirectTo: 'map',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: 'auth',
    component: AuthLayoutPageComponent,
    // canActivate: [ isNotAuthenticatedGuard ],
    loadChildren: () => import('./features/auth/auth.routes').then( r => r.routes)
  },
  {
    path: 'not-found',
    component: NotFoundComponent
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
