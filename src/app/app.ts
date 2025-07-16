import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './services/translation.service';
import { TranslatePipe } from './pipes/translate.pipe';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [TranslatePipe, LanguageSelectorComponent, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  userName = 'John Doe';
  isTranslationsLoaded = signal(false);

  constructor(public translationService: TranslationService) { }

  async ngOnInit(): Promise<void> {
    try {
      await this.translationService.loadLanguage('en-US');
      this.isTranslationsLoaded.set(true);
    } catch (error) {
      console.error('Failed to load initial translations:', error);
    }
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLanguage();
  }

  // Example of using translations in TypeScript
  getTranslatedMessage(): string {
    return this.translationService.translate('fake-acd-1.homepage.title');
  }
}
