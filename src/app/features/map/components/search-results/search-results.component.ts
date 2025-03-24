import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessagesModule } from 'primeng/messages';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { CommonModule } from '@angular/common';
import { MapService } from '../../services/map.service';
import { Feature } from '../../interfaces/places.interace';
import mapboxgl from 'mapbox-gl';
import { SearchResultItem } from '../../interfaces/searchResultItem.interface';
import { PlacesNominatim } from '../../interfaces/placesNominatim.interface';

@Component({
  selector: 'search-results',
  standalone: true,
  imports: [CommonModule, FormsModule, MessagesModule, ListboxModule, ButtonModule, PanelModule],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.css'
})
export class SearchResultsComponent {

  public selectedId: string | number = '';
  // private searchMarker: mapboxgl.Marker | null = null;

  constructor(
    private mapService: MapService
  ){}

  get isLoadingPlaces() {
    return this.mapService.isLoadingPlaces;
  }

  get places(){
    return this.mapService.places;
  }

  flyTo( place: PlacesNominatim ){
    this.selectedId = place.place_id;
    // const [ lng, lat ] = place.geometry.coordinates;
    const [ lng, lat ] = [Number(place.lon), Number(place.lat)] as [number, number];

    // if (this.searchMarker) {
    //   this.searchMarker.remove();
    // }

    this.mapService.flyTo([ lng, lat ]);
    const map = this.mapService.Map
    // this.searchMarker = new mapboxgl.Marker().setLngLat([ lng, lat ]).addTo(map);

    const iconId = `circle-point-destination`;
    const iconUrl = 'assets/images/icons/destination.png';

    //Elimina cualquier marcador previo con el mismo ID
    if (map.getLayer(iconId)) {
      map.removeLayer(iconId);
    }
    if (map.getSource(iconId)) {
      map.removeSource(iconId);
    }

    if (!map.hasImage(iconId)) {
      map.loadImage(iconUrl, (error, image) => {
        if (error) throw error;

        // Agregar la imagen con un identificador único
        map.addImage(iconId, image!);

        // Agregar el punto al mapa con su icono correspondiente
        this.mapService.addPointToMap(map, [ lng, lat ], iconId, place.display_name);
      })
    }
    else{
      // Si la imagen ya está cargada, solo agrega el punto con su icono
      this.mapService.addPointToMap(map, [ lng, lat ], iconId, place.display_name);
    }

  }

  getDirections( place: PlacesNominatim ){

    if(!this.mapService.userLocation) throw Error('No hay UserLocation');

    this.mapService.deletePlaces();

    const start = this.mapService.userLocation;
    // const end = place.geometry.coordinates as [number, number];
    const end = [Number(place.lon), Number(place.lat)] as [number, number];


    this.mapService.getRouteBetweenPoints(start, end);
  }

}
