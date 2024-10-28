import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-layout-page',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './news-layout-page.component.html',
  styleUrl: './news-layout-page.component.css'
})
export class NewsLayoutPageComponent {

}
