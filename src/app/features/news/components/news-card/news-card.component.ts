import { Component, Input, OnInit } from '@angular/core';
import { NewsItem } from '../../interfaces/news.interface';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { NewsItemImagePipe } from '../../pipes/news-item-image.pipe';

@Component({
  selector: 'news-card',
  standalone: true,
  imports: [
    // Modules
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    RouterModule,

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
