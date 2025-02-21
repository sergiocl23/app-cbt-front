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

mapboxgl.accessToken = environments.mapBoxKey;

@Component({
  selector: 'app-map-layout-page',
  standalone: true,
  imports: [CommonModule, LoadingComponent, BtnMyLocationComponent, SearchBarComponent],
  templateUrl: './map-layout-page.component.html',
  styleUrl: './map-layout-page.component.css'
})
export class MapLayoutPageComponent implements AfterViewInit, OnDestroy, OnInit{
  private map!: Map;
  private currentLngLat: LngLat = new LngLat(-70.14056585946109, -20.24473796434132);

  public mapPoints: Point[] = [];
  private routePoints: [number, number, string][] = [];

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
    return !!this.routePoints.length;
  }

  ngOnInit(): void {


  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.mapService.getPoints()
      .subscribe( points => {
        this.mapPoints = points.data

        this.routePoints = this.mapPoints.map(point => {
          return [point.longitude, point.latitude, point.description];
        });

        // Corregir
        setTimeout(() => {
          this.map = new Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-57.59705313935333, -22.520013511251367],
            zoom: 5.5,
            pitch: 55
          })

          this.map.addControl(new NavigationControl());

          this.setRoute(this.routePoints);

          this.mapService.setMap(this.map);
        }, 100);
        // Fin corregir
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

   // Obtener y graficar la ruta
  setRoute(routePoints: [number, number, string][]) {


    /*
    // Coordenadas ruta
    const corridorRoute: [number, number, string][] = [
      [-70.13662363926578, -20.23110856880029, 'Iquique, Chile'], // Iquique, Chile
      [-70.10197033524106, -20.2687742004362, 'Alto Hospicio, Chile'], // Alto Hospicio, Chile
      [-69.78974880198224, -20.25737089086163, 'Pozo Almonte, Chile'], // Pozo Almonte, Chile
      // [-69.4536033094392, -21.64879980592402, 'Quillagua, Chile'], // Quillagua, Chile
      // [-69.63246599865376, -22.355385948328205, 'Maria Elena, Chile'], // Maria Elena, Chile
      [-68.92965130273234, -22.455163463844116, 'Calama, Chile'], // Calama, Chile
      [-68.1728409202262, -22.912595149768027, 'San Pedro de Atacama, Chile'], // San Pedro de Atacama, Chile
      [-67.01902297614322, -23.242704878207608, 'Jama, Argentina'], // Jama, Argentina
      [-65.29765971340198, -24.18576145173499, 'San Salvador de Jujuy, Argentina'], // San Salvador de Jujuy, Argentina
      [-63.805664469718685, -22.51730196140737, 'Tartagal, Argentina'], // Tartagal, Argentina
      [-62.51579045636932, -22.370594917414362, 'Pozo Hondo, Paraguay'], // Pozo Hondo, Paraguay
      [-60.597005594447374, -22.03383697565635, 'Mariscal Estigarribia, Paraguay'], // Mariscal Estigarribia, Paraguay
      [-57.88345909398014, -21.697567863951402, 'Porto Mortinho, Brasil'], // Porto Mortinho, Brasil
      [-54.62592446692572, -20.46274690445269, 'Campo Grande'], // Campo Grande
      [-46.65440504613875, -23.565050300615344, 'Sao Paulo'], // Sao Paulo
      [-46.30268270198697, -23.965736858376157, 'Porto de Santos']  // Destino: Porto de Santos
    ];
    */

    const coordinates =  routePoints.map(point => point.slice(0, 2)).map(point => point.join(',')).join(';');

    // console.log(coordinates)

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=${environments.mapBoxKey}`;

    this.http.get(url).subscribe((response: any) => {
      const data = response.routes[0].geometry;

      // Crear fuente para la ruta
      this.map.on('load', () => {
        this.map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: data
          }
        });

        // Agregar la línea al mapa
        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FF5733', // Color de la línea (naranja en este caso)
            'line-width': 6, // Grosor de la línea
          }
        });



        this.addRoutePoints(this.map, routePoints);

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

  addRoutePoints(map: mapboxgl.Map, placesCoordinates: [number, number, string][]) {
    placesCoordinates.forEach(coordinate => {
      const id = `circle-point-${coordinate[0]}-${coordinate[1]}`;
      map.addLayer({
        id: id,
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [coordinate[0], coordinate[1]]
            },
            properties: {}
          }
        },
        paint: {
          'circle-radius': 6, // Tamaño del círculo
          'circle-color': '#3498db', // Color del círculo
          'circle-stroke-width': 2, // Borde del círculo
          'circle-stroke-color': '#FFFFFF' // Color del borde
        }
      });

      // Crear el popup
      const popup = new mapboxgl.Popup({ offset: 25 }) // Offset para posicionar el popup
        // .setHTML(coordinate[2]) // Contenido del popup
        .setHTML(`
          <div>
            ${coordinate[2]}
            <br />
            <button id="view-more-${coordinate[2]}" style="margin-top: 10px; padding: 5px 10px; background: #3498db; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
              Ver más
            </button>
          </div>
        `)
        .setMaxWidth('300px'); // Tamaño máximo del popup

      // Asociar el popup al evento de clic
      map.on('click', id, () => {
        popup.setLngLat([coordinate[0], coordinate[1]]).addTo(map);
        // Esperar a que se renderice el popup y luego asignar el evento al botón "Ver más"
        setTimeout(() => {
          const button = document.getElementById(`view-more-${coordinate[2]}`);
          if (button) {
            button.addEventListener('click', () => {
              showSidebar('contenido de prueba');
            });
          }
        }, 0);
      });


      // Asociar el popup al punto
      map.on('mouseenter', id, () => {
        map.getCanvas().style.cursor = 'pointer'; // Cambiar el cursor al pasar sobre el punto
        // popup.setLngLat([coordinate[0], coordinate[1]]).addTo(map);
      });

      map.on('mouseleave', id, () => {
        map.getCanvas().style.cursor = ''; // Restablecer el cursor
        // popup.remove(); // Eliminar el popup al salir del punto
      });



    });

  }

}
function showSidebar(content: string) {
  let sidebar = document.getElementById('map-sidebar');
  if (!sidebar) {
    // Crear el panel lateral si no existe
    sidebar = document.createElement('div');
    sidebar.id = 'map-sidebar';
    sidebar.style.position = 'absolute';
    sidebar.style.top = '0';
    sidebar.style.right = '0';
    sidebar.style.width = '300px';
    sidebar.style.height = '100%';
    sidebar.style.background = '#f7f7f7';
    sidebar.style.boxShadow = '-2px 0 5px rgba(0, 0, 0, 0.2)';
    sidebar.style.padding = '20px';
    sidebar.style.overflowY = 'auto';
    sidebar.style.zIndex = '1000';
    document.body.appendChild(sidebar);
  }

  // Mostrar el contenido en el panel
  sidebar.innerHTML = `
    <button style="float: right; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
    <h2>Información Detallada</h2>
    <p>${content}</p>
  `;

  // Agregar evento para cerrar el panel
  const closeButton = sidebar.querySelector('button');
  closeButton?.addEventListener('click', () => {
    sidebar.remove();
  });
}


