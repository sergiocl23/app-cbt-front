import { Pipe, PipeTransform } from '@angular/core';
import { Point } from './../interfaces/point.interface';
import { environments } from '@environments/environments';

@Pipe({
  name: 'placeImage',
  standalone: true
})
export class PlaceImagePipe implements PipeTransform {

  private baseUrlStrapi: string = environments.baseUrlStrapi;

  transform(point: Point): string {
    if(!point){
      return 'assets/images/no-image.png';
    }
    if(!point.main_image){
      return 'assets/images/no-image.png';
    }
    if (!point.main_image.formats.large.url) {
      return 'assets/images/no-image.png';
    }
    return this.baseUrlStrapi + point.main_image.formats.large.url;
  }

}
