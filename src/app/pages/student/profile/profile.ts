import { Component, inject, computed, signal, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { ProfileService } from '../../../services/student/profile.service';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { CertificateModalComponent } from '../../../shared/certificate-modal/certificate-modal';

@Component({
  selector: 'app-profile',
  imports: [TranslateModule, SlicePipe, CertificateModalComponent],
  templateUrl: './profile.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfileComponent implements OnInit {
  profileService = inject(ProfileService);
  private auth = inject(AuthService);
  student = this.profileService.profile;
  loading = this.profileService.loading;

  isGraduated = computed(() => (this.student() ?? this.auth.currentUser())?.status === 'GRADUATED');
  showCertificate = signal(false);

  logout(): void {
    this.auth.logout();
  }

  ngOnInit(): void {
    this.profileService.loadProfile().subscribe();
  }
}
