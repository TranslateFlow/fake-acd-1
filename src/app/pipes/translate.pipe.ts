import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  pure: false // Make it impure so it updates when language changes
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription?: Subscription;
  private lastLanguage?: string;
  private lastKey?: string;
  private lastParams?: { [key: string]: string | number };
  private lastValue?: string;

  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
    // Subscribe to language changes to trigger pipe updates
    this.subscription = this.translationService.language$.subscribe(() => {
      this.lastLanguage = undefined; // Reset cache
      this.cdr.markForCheck();
    });
  }

  transform(key: string, params?: { [key: string]: string | number }): string {
    if (!key) {
      return '';
    }

    const currentLanguage = this.translationService.getCurrentLanguage();

    // Cache check to avoid unnecessary translations
    if (
      this.lastKey === key &&
      this.lastLanguage === currentLanguage &&
      JSON.stringify(this.lastParams) === JSON.stringify(params) &&
      this.lastValue !== undefined
    ) {
      return this.lastValue;
    }

    // Update cache
    this.lastKey = key;
    this.lastLanguage = currentLanguage;
    this.lastParams = params;
    this.lastValue = this.translationService.translate(key, params);

    return this.lastValue;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
