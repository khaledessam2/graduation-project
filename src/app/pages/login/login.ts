import { Component, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, TranslateModule],
  templateUrl: './login.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  langService = inject(LanguageService);

  role = '';
  nationalId = '';
  password = '';
  showPassword = false;
  errorMsg = signal('');
  loading = signal(false);

  roles = [
    { value: 'Student', key: 'ROLES.STUDENT' },
    { value: 'Admin',   key: 'ROLES.ADMIN'   },
  ];

  onSubmit(): void {
    if (!this.role || !this.nationalId || !this.password) {
      this.errorMsg.set(this.translate.instant('LOGIN.FILL_ALL_FIELDS'));
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    // TODO: Replace with real API call via AuthService
    const result = this.auth.login({
      role: this.role,
      nationalId: this.nationalId,
      password: this.password,
    });

    this.loading.set(false);

    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMsg.set(result.message);
    }
  }
}
