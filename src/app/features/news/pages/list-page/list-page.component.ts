import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DividerModule } from 'primeng/divider';

import { NewsCardComponent } from '../../components/news-card/news-card.component';

import { NewsService } from '../../services/news.service';

import { News, NewsItem } from '../../interfaces/news.interface';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [
    CommonModule,
    DividerModule,
    NewsCardComponent
  ],
  templateUrl: './list-page.component.html',
  styleUrl: './list-page.component.css'
})
export class ListPageComponent implements OnInit{

  public news: NewsItem[] = [];

  constructor( private newsService: NewsService ){}

  ngOnInit(): void {
    this.newsService.getNews()
      .subscribe( news => this.news = news.data );
  }

}
