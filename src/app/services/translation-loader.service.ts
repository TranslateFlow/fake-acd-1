import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface TranslationFiles {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationLoaderService {
  private baseUrl = 'https://raw.githubusercontent.com/TranslateFlow/translate-platform/main/languages';

  // Define all your translation files here
  private translationFiles = [
    'fake-acd-1.json',
    'fake-acd-2.json'
    // Add more files as needed
  ];

  constructor(private http: HttpClient) {}

  /**
   * Load all translation files for a specific language
   * @param language - Language code (e.g., 'en-US', 'es', 'fr')
   */
  loadTranslations(language: string): Observable<TranslationFiles> {
    const requests = this.translationFiles.map(file =>
      this.http.get(`${this.baseUrl}/${language}/${file}`).pipe(
        catchError(error => {
          console.warn(`Failed to load ${file} for language ${language}:`, error);
          return of({}); // Return empty object if file fails to load
        })
      )
    );

    return forkJoin(requests).pipe(
      map(responses => {
        const mergedTranslations: TranslationFiles = {};

        responses.forEach((response, index) => {
          const fileName = this.translationFiles[index].replace('.json', '');
          mergedTranslations[fileName] = response;
        });

        return mergedTranslations;
      })
    );
  }

  /**
   * Load a specific translation file for a language
   * @param language - Language code
   * @param fileName - Name of the JSON file (without .json extension)
   */
  loadSpecificTranslation(language: string, fileName: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${language}/${fileName}.json`).pipe(
      catchError(error => {
        console.warn(`Failed to load ${fileName}.json for language ${language}:`, error);
        return of({});
      })
    );
  }

  /**
   * Get available languages from the repository
   */
  getAvailableLanguages(): string[] {
    return [
      'de',
      'en-US',
      'es',
      'fr-ca',
      'fr',
      'ja',
      'ko',
      'nl',
      'pt',
      'zh-cn',
      'zh-hk'
    ];
  }
}
