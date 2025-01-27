import { Component } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'search-results',
  standalone: true,
  imports: [MessageModule],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.css'
})
export class SearchResultsComponent {

}
