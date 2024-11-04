import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

import { NewsItemImagePipe } from '../../pipes/news-item-image.pipe';
import { NewsItem } from '../../interfaces/news.interface';

@Component({
  selector: 'news-card',
  standalone: true,
  imports: [
    // Modules
    RouterModule,
    DividerModule,
    CardModule,
    ButtonModule,

    // Pipes
    NewsItemImagePipe
  ],
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.css'
})
export class NewsCardComponent implements OnInit{

  @Input()
  public newsItem!: NewsItem

  ngOnInit(): void {
    if ( !this.newsItem ) throw new Error('newsItem property is required');
  }

}
