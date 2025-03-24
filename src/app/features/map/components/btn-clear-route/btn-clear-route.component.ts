import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'btn-clear-route',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './btn-clear-route.component.html',
  styleUrl: './btn-clear-route.component.css'
})
export class BtnClearRouteComponent {

  constructor(
    private mapService: MapService
  ){}

  clearRoute(){
    console.log('limpiar ruta');
  }

}
