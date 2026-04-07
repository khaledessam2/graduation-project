import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [TranslateModule],
  templateUrl: './profile.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfileComponent implements OnInit {
  profileService = inject(ProfileService);
  student = this.profileService.profile;
  loading = this.profileService.loading;

  ngOnInit(): void {
    this.profileService.loadProfile().subscribe();
  }
}
