import { Routes } from '@angular/router';
import { NewsLayoutPageComponent } from './pages/news-layout-page/news-layout-page.component';
import { NewsPageComponent } from './pages/news-page/news-page.component';
import { ListPageCarouselComponent } from './pages/list-page-carousel/list-page-carousel.component';

export const routes: Routes = [
  {
    path: '',
    component: NewsLayoutPageComponent,
    children: [
      {
        path: 'carousel',
        component: ListPageCarouselComponent
      },
      {
        path: ':id',
        component: NewsPageComponent
      },
      {
        path: '**',
        redirectTo: 'carousel'
      }
    ]
  }
];
