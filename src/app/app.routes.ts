import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.routes').then( r => r.routes)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then( r => r.routes)
  },
  {
    path: 'news',
    loadChildren: () => import('./news/news.routes').then( r => r.routes)
  },
  {
    path: 'not-found',
    component: NotFoundComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
