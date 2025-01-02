import { Component, Inject, PLATFORM_ID, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import mapboxgl, { Map, NavigationControl, LngLat, Marker, Popup, LngLatBounds } from 'mapbox-gl';
import { Feature, LineString } from 'geojson';
import { environments } from '../../../../../environments/environments';

mapboxgl.accessToken = environments.mapBoxKey;

@Component({
  selector: 'app-map-layout-page',
  standalone: true,
  imports: [],
  templateUrl: './map-layout-page.component.html',
  styleUrl: './map-layout-page.component.css'
})
export class MapLayoutPageComponent implements AfterViewInit, OnDestroy{
  private map!: Map;
  private currentLngLat: LngLat = new LngLat(-70.14056585946109, -20.24473796434132);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {

      this.map = new Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-64.09705313935333, -22.520013511251367],
        zoom: 6.5,
        pitch: 45
      })

      this.map.addControl(new NavigationControl());

      // Marker ubicacion
      this.createCurrentLocationMarker(this.map, this.currentLngLat)

      const route: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-70.13662363926578, -20.23110856880029], // Iquique, Chile
            [-70.10197033524106, -20.2687742004362], // Alto Hospicio, Chile
            [-69.78974880198224, -20.25737089086163], // Pozo Almonte, Chile
            [-69.4536033094392, -21.64879980592402], // Quillagua, Chile
            [-69.63246599865376, -22.355385948328205], // Maria Elena, Chile
            [-68.92965130273234, -22.455163463844116], // Calama, Chile
            [-68.1728409202262, -22.912595149768027], // San Pedro de Atacama, Chile
            [-67.01902297614322, -23.242704878207608], // Jama, Argentina
            [-65.29765971340198, -24.18576145173499], // San Salvador de Jujuy, Argentina
            [-63.805664469718685, -22.51730196140737], // Tartagal, Argentina
            [-62.51579045636932, -22.370594917414362], // Pozo Hondo, Paraguay
            [-60.353472958813654, -22.066341292528996], // Mariscal Estigarribia, Paraguay
            [-57.88345909398014, -21.697567863951402], // Porto Mortinho, Brasil

          ],
        },
        properties: {},
      };

      this.map.on('load', () => {
        // Agregar la fuente GeoJSON
        this.map.addSource('route', {
          type: 'geojson',
          data: route,
        });

        // Agregar una capa para la ruta
        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#FF5733', // Color de la línea (naranja en este caso)
            'line-width': 5, // Grosor de la línea
          },
        });
      });
    }
  }

  // Detecta cambios en el tamaño de la ventana
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (this.map) {
      this.map.resize(); // Ajusta el mapa al nuevo tamaño del contenedor
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove(); // Elimina el mapa al destruir el componente
    }
  }

  createCurrentLocationMarker( map: Map, lngLat: LngLat): Marker{
    const locationMarker = new Marker(({
      color: 'red'
    }))
      .setLngLat( lngLat )
      .addTo(map)

    this.reSizeMarker(locationMarker);

    // Crea el popup
    const popup = new Popup({ offset: 25 }).setText('Ubicación Actual');
    locationMarker.setPopup(popup);

    return locationMarker;
  }

  reSizeMarker(marker: Marker){
    const markerElement = marker.getElement();
    const iconElement = markerElement.querySelector('img') || markerElement.querySelector('svg');

    if (iconElement) {
      iconElement.style.width = '30px';  // Ajusta el ancho del icono
      iconElement.style.height = '30px'; // Ajusta la altura del icono
    }
  }

}
