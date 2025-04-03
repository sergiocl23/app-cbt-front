import { Component, Inject, PLATFORM_ID, AfterViewInit, OnDestroy, HostListener, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import mapboxgl, { Map, NavigationControl, LngLat, Marker, Popup, LngLatBounds, GeoJSONSource } from 'mapbox-gl';
import { Feature, LineString } from 'geojson';
import { environments } from '../../../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { MapService } from '../../services/map.service';
import { Point } from '../../interfaces/point.interface';
import { LoadingComponent } from '../../components/loading/loading.component';
import { BtnMyLocationComponent } from '../../components/btn-my-location/btn-my-location.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { InfoPlaceCardComponent } from '../../components/info-place-card/info-place-card.component';
import { BtnClearRouteComponent } from '../../components/btn-clear-route/btn-clear-route.component';

mapboxgl.accessToken = environments.mapBoxKey;

@Component({
  selector: 'app-map-layout-page',
  standalone: true,
  imports: [CommonModule, LoadingComponent, BtnMyLocationComponent, SearchBarComponent, InfoPlaceCardComponent, BtnClearRouteComponent],
  templateUrl: './map-layout-page.component.html',
  styleUrl: './map-layout-page.component.css'
})
export class MapLayoutPageComponent implements AfterViewInit, OnDestroy, OnInit{
  private map!: Map;
  private currentLngLat: LngLat = new LngLat(-70.14056585946109, -20.24473796434132);
  public message: string = 'Calculando ruta...'

  public mapPoints: Point[] = [];
  // private routePoints: routePoint[] = [];

  isInfoCardOpen = false;
  selectedPlace: Point | null = null;

  constructor(
    @Inject(PLATFORM_ID)
    private platformId: Object,
    private http: HttpClient,
    private mapService: MapService
  ) {}

  get isUserLocationReady() {
    return this.mapService.isUserLocationReady;
  }

  get isRoutePointsReady() {
    return !!this.mapPoints.length;
  }

  ngAfterViewInit(): void {


  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.map) {
        this.map.remove(); // Elimina el mapa al destruir el componente
      }
      // Corregir
      setTimeout(() => {
        this.map = new Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-57.99705313935333, -21.520013511251367],
          zoom: 5.4,
          // pitch: 50
        })

        // this.map.addControl(new NavigationControl());
        this.mapService.setMap(this.map);
      }, 100);

      setTimeout(() => {
        this.loadThirdRoute();
      }, 200);
      setTimeout(() => {
        this.loadSecondaryRoute();
      }, 300);
      setTimeout(() => {
        this.loadPrimaryRoute();
      }, 400);
      setTimeout(() => {
        this.addRoutePoints();
      }, 1200);
    }
  }

  // TODO: FALTA HACER QUE CUANDO SE ABRA O CIERRA EL SIDEBAR SE EJECUTE ESTO
  // Detecta cambios en el tamaño de la ventana
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    console.log('resize')
    if (this.map) {
      this.map.resize(); // Ajusta el mapa al nuevo tamaño del contenedor
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove(); // Elimina el mapa al destruir el componente
    }
  }

  loadPrimaryRoute() {
    this.mapService.getRoutePoints()
    .subscribe( points => {
      this.map = this.mapService.Map;
      this.mapPoints = points.data

      // Ordenar los puntos de oeste a este (menor a mayor en longitud)
      this.mapPoints.sort((a, b) => a.longitude - b.longitude);
      this.setRoute(this.mapPoints, '#FF5733', 'route1');
    });
  }

  loadSecondaryRoute() {
    this.mapService.getSecondRoutePoints()
    .subscribe( points => {
      this.map = this.mapService.Map;
      this.mapPoints = points.data

      // Ordenar los puntos de oeste a este (menor a mayor en longitud)
      this.mapPoints.sort((a, b) => a.longitude - b.longitude);

      this.setRoute(this.mapPoints, '#ff8633', 'route2');
    });
  }

  loadThirdRoute() {
    this.mapService.getThirdRoutePoints()
    .subscribe( points => {
      this.map = this.mapService.Map;
      this.mapPoints = points.data

      // Ordenar los puntos de oeste a este (menor a mayor en longitud)
      this.mapPoints.sort((a, b) => a.latitude - b.latitude);

      this.setRoute(this.mapPoints, '#9b59b6', 'route3');
    });
  }


   //graficar la ruta
  setRoute(mapPoints: Point[], routeColor: string, idRoute: string) {
    // const coordinates =  routePoints.map(point => point.slice(0, 2)).map(point => point.join(',')).join(';');
    const coordinates =  mapPoints.map(point => `${point.longitude},${point.latitude}`).join(';');

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=${environments.mapBoxKey}`;

    this.http.get(url).subscribe((response: any) => {
      const data = response.routes[0].geometry;

      // Crear fuente para la ruta
      this.map.on('load', () => {
        this.map.addSource(idRoute, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: data
          }
        });

        // Agregar la línea al mapa
        this.map.addLayer({
          id: idRoute,
          type: 'line',
          source: idRoute,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': routeColor, // Color de la línea (naranja en este caso)
            'line-width': 4, // Grosor de la línea
          }
        });

      });

      // EVENTOS HOVER
      this.map.on('mouseenter', 'route', () => {
        this.map.setPaintProperty('route', 'line-width', 8); // Aumentar grosor
        // this.map.getCanvas().style.cursor = 'pointer'; // Cambiar el cursor
      });

      this.map.on('mouseleave', 'route', () => {
        this.map.setPaintProperty('route', 'line-width', 6); // Grosor original
        // this.map.getCanvas().style.cursor = ''; // Restaurar cursor
      });
    });
  }

  addRoutePoints() {
    this.mapService.getAllMapPoints()
    .subscribe( points => {
      const map = this.mapService.Map;
      this.mapPoints = points.data

      this.mapPoints.forEach(point => {
        const iconUrl = point.id_categories[0].icon;
        const iconId = `circle-point-${point.latitude}-${point.longitude}`;

        if (!map.hasImage(iconId)) {
          map.loadImage(iconUrl, (error, image) => {
            if (error) throw error;

            // Agregar la imagen con un identificador único
            map.addImage(iconId, image!);

            // Agregar el punto al mapa con su icono correspondiente
            this.addPointToMap(map, point, iconId);
          })
        }
        else{
          // Si la imagen ya está cargada, solo agrega el punto con su icono
          this.addPointToMap(map, point, iconId);
        }
      });
    });
  }

  private addPointToMap(map: mapboxgl.Map, point: Point, iconId: string) {
    const id = `circle-point-${point.latitude}-${point.longitude}}`;

    map.addLayer({
      id: id,
      type: 'symbol',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.longitude, point.latitude]
          },
          properties: {}
        }
      },
      layout: {
        'icon-image': iconId, // Usa el ID único del icono
        'icon-size': point.id_categories[0].icon_size,
        'icon-allow-overlap': true
      }
    });

    // Crear y asociar popup
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`
        <div>
          <strong>${point.name}</strong>
          <br />
          <button id="view-more-${point.description}" style="margin-top: 10px; padding: 5px 10px; background: #3498db; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Ver más
          </button>
        </div>
      `)
      .setMaxWidth('300px');

    map.on('click', id, () => {
      popup.setLngLat([point.longitude, point.latitude]).addTo(map);
      setTimeout(() => {
        const button = document.getElementById(`view-more-${point.description}`);
        if (button) {
          button.addEventListener('click', () => {
            // showSidebar('contenido de prueba');
            this.showPlaceCard(point);
            popup.remove();
          });
        }
      }, 0);
    });

    map.on('mouseenter', id, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', id, () => {
      map.getCanvas().style.cursor = '';
    });
  }

  showPlaceCard(point: Point) {
    this.isInfoCardOpen = false; // Cierra la tarjeta primero
    setTimeout(() => {
      this.selectedPlace = point;
      this.isInfoCardOpen = true;
    }, 10); // Breve retraso para que Angular detecte el cambio
  }

}


