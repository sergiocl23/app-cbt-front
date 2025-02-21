import { Pipe, PipeTransform } from '@angular/core';
import { NewsItem } from '../interfaces/news.interface';
import { environments } from '@environments/environments';

@Pipe({
  name: 'newsItemImage',
  standalone: true
})
export class NewsItemImagePipe implements PipeTransform {

  private baseUrlStrapi: string = environments.baseUrlStrapi;

  transform(newsItem: NewsItem): string {
    if (!newsItem.images?.length) {
      return 'assets/images/default-news.jpg';
    }
    return newsItem.images[0];
  }

}
