import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readingModeSubject = new BehaviorSubject<boolean>(false);
  readingMode$ = this.readingModeSubject.asObservable();

  toggleReadingMode() {
    const newValue = !this.readingModeSubject.value;
    this.readingModeSubject.next(newValue);
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('reading-mode', newValue);
    }
  }
} 