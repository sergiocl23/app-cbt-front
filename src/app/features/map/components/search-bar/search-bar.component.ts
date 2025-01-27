import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { SearchResultsComponent } from '../search-results/search-results.component';

@Component({
  selector: 'search-bar',
  standalone: true,
  imports: [CommonModule, InputTextModule, SearchResultsComponent],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {

}
