import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { Observable } from 'rxjs';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-language-selector',
  template: `
    <div class="language-selector">
      <select
        [value]="currentLanguage"
        (change)="onLanguageChange($event)"
        [disabled]="loading$ | async"
        class="form-select">
        <option value="" disabled>Select Language</option>
        <option *ngFor="let lang of availableLanguages" [value]="lang">
          {{ getLanguageDisplayName(lang) }}
        </option>
      </select>
      <div *ngIf="loading$ | async" class="loading-indicator">
        Loading translations...
      </div>
    </div>
  `,
  imports: [
    AsyncPipe,
    NgFor,
    NgIf
  ],
  styles: [`
    .language-selector {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .form-select {
      padding: 12px 16px;
      border: 2px solid rgba(102, 126, 234, 0.2);
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      color: #333;
      outline: none;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(102, 126, 234, 0.1);
    }

    .form-select:hover {
      border-color: rgba(102, 126, 234, 0.4);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
      transform: translateY(-1px);
    }

    .form-select:focus {
      border-color: #667eea;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
      transform: translateY(-1px);
    }

    .form-select:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .loading-indicator {
      font-size: 0.9rem;
      color: #667eea;
      font-weight: 500;
      padding: 8px 16px;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.02);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .language-selector {
        flex-direction: column;
        gap: 10px;
        width: 100%;
      }
      
      .form-select {
        width: 100%;
        max-width: 250px;
      }
    }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  currentLanguage: string = '';
  availableLanguages: string[] = [];
  loading$: Observable<boolean>;

  private languageNames: { [key: string]: string } = {
    'de': 'Deutsch',
    'en-US': 'English (US)',
    'es': 'Español',
    'fr-ca': 'Français (Canada)',
    'fr': 'Français',
    'ja': '日本語',
    'ko': '한국어',
    'nl': 'Nederlands',
    'pt': 'Português',
    'zh-cn': '中文 (简体)',
    'zh-hk': '中文 (繁體)'
  };

  constructor(private translationService: TranslationService) {
    this.loading$ = this.translationService.loading$;
  }

  ngOnInit(): void {
    this.availableLanguages = this.translationService.getAvailableLanguages();
    this.currentLanguage = this.translationService.getCurrentLanguage();

    // Subscribe to language changes
    this.translationService.language$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  onLanguageChange(event: any): void {
    const selectedLanguage = event.target.value;
    if (selectedLanguage) {
      this.translationService.loadLanguage(selectedLanguage);
    }
  }

  getLanguageDisplayName(langCode: string): string {
    return this.languageNames[langCode] || langCode;
  }
}
