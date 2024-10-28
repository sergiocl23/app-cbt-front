import { Routes } from '@angular/router';
import { NewsLayoutPageComponent } from './pages/news-layout-page/news-layout-page.component';
import { AddPageComponent } from './pages/add-page/add-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { ListPageComponent } from './pages/list-page/list-page.component';
import { NewsPageComponent } from './pages/news-page/news-page.component';

// localhost:4200/news
export const routes: Routes = [
  {
    path: '',
    component: NewsLayoutPageComponent,
    children: [
      { path: 'add-news', component: AddPageComponent },
      { path: 'search', component: SearchPageComponent },
      { path: 'edit/:id', component: AddPageComponent },
      { path: 'list', component: ListPageComponent },
      { path: ':id', component: NewsPageComponent },
      { path: '**', redirectTo: 'list' },
    ]
  }
];
