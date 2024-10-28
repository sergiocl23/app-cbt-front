import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-page',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth-layout-page.component.html',
  styleUrl: './auth-layout-page.component.css'
})
export class AuthLayoutPageComponent {

}
