import { Component} from '@angular/core';
import { LatestNewsCardComponent } from '../../../news/components/latest-news-card/latest-news-card.component';
import { NearPlacesCardComponent } from '../../../map/components/near-places-card/near-places-card.component';
import { LastSimulationCardComponent } from '../../../simulation/components/last-simulation-card/last-simulation-card.component';
import { SavedCompaniesCardComponent } from '../../../companies/components/saved-companies-card/saved-companies-card.component';
import { UpcomingMeetingsCardComponent } from '../../../meetings/components/upcoming-meetings-card/upcoming-meetings-card.component';

@Component({
  selector: 'app-layout-page',
  standalone: true,
  imports: [
    LatestNewsCardComponent,
    NearPlacesCardComponent,
    LastSimulationCardComponent,
    SavedCompaniesCardComponent,
    UpcomingMeetingsCardComponent],
  templateUrl: './home-layout-page.component.html',
  styleUrl: './home-layout-page.component.css'
})
export class HomeLayoutPageComponent {

}
