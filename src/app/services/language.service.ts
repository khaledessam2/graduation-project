import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  currentLang = signal<'ar' | 'en'>('ar');

  constructor(private translate: TranslateService) {
    const saved = localStorage.getItem('lang') as 'ar' | 'en' | null;
    const initial: 'ar' | 'en' = saved === 'en' ? 'en' : 'ar';
    this.currentLang.set(initial);
    this.translate.setDefaultLang('ar');
    this.translate.use(initial);
    this.applyDir(initial);
  }

  toggleLang(): void {
    const next: 'ar' | 'en' = this.currentLang() === 'ar' ? 'en' : 'ar';
    this.currentLang.set(next);
    this.translate.use(next);
    localStorage.setItem('lang', next);
    this.applyDir(next);
  }

  isRtl(): boolean {
    return this.currentLang() === 'ar';
  }

  private applyDir(lang: string): void {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }
}
