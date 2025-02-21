import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { environments } from '@environments/environments';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { NewsItem } from '../../interfaces/news.interface';

@Component({
  selector: 'latest-news-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule
  ],
  templateUrl: './latest-news-card.component.html',
  styleUrls: ['./latest-news-card.component.css']
})
export class LatestNewsCardComponent {
  @Input() latestNews?: NewsItem;

  constructor(private router: Router) {}

  getImageUrl(newsItem: NewsItem): string {
    return newsItem?.images?.[0] || 'assets/images/default-news.jpg';
  }

  navigateToNews() {
    if (this.latestNews) {
      this.router.navigate(['/news', this.latestNews.id]);
    }
  }
}
