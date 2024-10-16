import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-layout-page',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './layout-page.component.html',
  styleUrl: './layout-page.component.css'
})
export class LayoutPageComponent {

}
