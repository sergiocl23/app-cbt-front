import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-auth-layout-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    ToolbarModule,
  ],
  templateUrl: './auth-layout-page.component.html',
  styleUrl: './auth-layout-page.component.css'
})
export class AuthLayoutPageComponent {

}
