import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../services/news.service';
import { News, NewsItem } from '../../interfaces/news.interface';
import { CommonModule } from '@angular/common';
import {MatDividerModule} from '@angular/material/divider';
import { NewsCardComponent } from '../../components/news-card/news-card.component';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
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
