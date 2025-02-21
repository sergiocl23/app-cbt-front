import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleNewsWidgetComponent } from './google-news-widget.component';

@NgModule({
  declarations: [GoogleNewsWidgetComponent],
  imports: [CommonModule],
  exports: [GoogleNewsWidgetComponent]
})
export class GoogleNewsWidgetModule {}