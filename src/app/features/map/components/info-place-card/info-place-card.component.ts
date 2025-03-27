import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Point } from '../../interfaces/point.interface';
import { environments } from '@environments/environments';
import { PlaceImagePipe } from '../../pipes/place-image.pipe';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { MapService } from '../../services/map.service';
import { PlacesNominatim } from '../../interfaces/placesNominatim.interface';

@Component({
  selector: 'info-place-card',
  standalone: true,
  imports: [ CommonModule ,ButtonModule ,PlaceImagePipe ],
  templateUrl: './info-place-card.component.html',
  styleUrl: './info-place-card.component.css'
})
export class InfoPlaceCardComponent {
  @Input() isInfoCardOpen: boolean = false;
  @Input() place!: Point | null;
  @Output() close = new EventEmitter<void>();

  baseUrlStrapi: string = environments.baseUrlStrapi;

  constructor(
      private mapService: MapService
    ){}

  closeCard() {
    const map = this.mapService.Map
    if(map.getLayer('RouteString')){
      map.removeLayer('RouteString');
      map.removeSource('RouteString');
    }
    this.isInfoCardOpen = false;
    this.close.emit();
  }

  getDirections( place: Point | null){
    if(place){
      if(!this.mapService.userLocation) throw Error('No hay UserLocation');

      this.mapService.deletePlaces();

      const start = this.mapService.userLocation;
      // const end = place.geometry.coordinates as [number, number];
      const end = [Number(place.longitude), Number(place.latitude)] as [number, number];


      this.mapService.getRouteBetweenPoints(start, end);
    }

  }
}
