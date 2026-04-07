import { Component, inject, signal, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-login',
  imports: [FormsModule, TranslateModule, Select],
  templateUrl: './login.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginComponent implements OnInit, OnDestroy {
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

  roles: { value: string; label: string }[] = [];
  private langSub!: Subscription;

  ngOnInit(): void {
    this.buildRoles();
    this.langSub = this.translate.onLangChange.subscribe(() => this.buildRoles());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private buildRoles(): void {
    this.roles = [
      { value: 'Student', label: this.translate.instant('ROLES.STUDENT') },
      { value: 'Admin',   label: this.translate.instant('ROLES.ADMIN')   },
    ];
  }

  onSubmit(): void {
    if (!this.role || !this.nationalId || !this.password) {
      this.errorMsg.set(this.translate.instant('LOGIN.FILL_ALL_FIELDS'));
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.nationalId, this.password).subscribe((result) => {
      this.loading.set(false);
      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMsg.set(result.message);
      }
    });
  }
}
