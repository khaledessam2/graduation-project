import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './interceptors/api.interceptor';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

const LightPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#e8eef5',
      100: '#c5d3e6',
      200: '#9eb6d4',
      300: '#7799c2',
      400: '#5a83b5',
      500: '#3d6ea8',
      600: '#2d5a8e',
      700: '#1a3a5c',  // --color-primary
      800: '#122845',
      900: '#0a1a2e',
      950: '#050d17',
    },
    colorScheme: {
      light: {
        surface: {
          0:   '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
    },
  },
  components: {
    select: {
      root: {
        borderRadius: '0.75rem',
        paddingX: '1rem',
        paddingY: '0.75rem',
        background: '#ffffff',
        borderColor: '#cbd5e1',
        color: '#334155',
        placeholderColor: '#94a3b8',
        focusBorderColor: '#64748b',
        shadow: 'none',
      },
    },
  },
});

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideTranslateService({ defaultLanguage: 'ar' }),
    provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    providePrimeNG({ theme: { preset: LightPreset, options: { darkModeSelector: 'none' } } }),
    ConfirmationService,
    MessageService,
  ],
};
