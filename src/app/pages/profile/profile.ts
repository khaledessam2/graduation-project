import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [TranslateModule],
  templateUrl: './profile.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfileComponent {
  auth = inject(AuthService);
  student = this.auth.currentUser;
}
