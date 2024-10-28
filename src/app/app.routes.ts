import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/pages/not-found/not-found.component';
import { MainLayoutPageComponent } from './core/main-layout-page/main-layout-page.component';


export const routes: Routes = [
  {
    path: '',
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
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: 'auth',
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
