import { Routes } from '@angular/router';
import { ForumLayoutPageComponent } from './pages/forum-layout-page/forum-layout-page.component';
import { TopicDetailComponent } from './pages/topic-detail-page/topic-detail-page.component';
import { NewTopicComponent } from './pages/new-topic/new-topic.component';

export const routes: Routes = [
  {
    path: '',
    component: ForumLayoutPageComponent
  },
  {
    path: 'topic/:id',
    component: TopicDetailComponent
  },
  {
    path: 'new',
    component: NewTopicComponent
  }
];
