import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'search-bar',
  standalone: true,
  imports: [CommonModule, InputTextModule, SearchResultsComponent],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {

  private debounteTimer?: NodeJS.Timeout;

  constructor(
    private mapService: MapService
  ){}

  onQueryChanged( query: string) {

    if ( this.debounteTimer ) clearTimeout( this.debounteTimer );

    this.debounteTimer = setTimeout(() => {
      this.mapService.getPlacesByQuery( query );
    }, 350);

  }

}
