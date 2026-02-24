import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CourseService } from '../../services/course.service';
import { LanguageService } from '../../services/language.service';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, TranslateModule],
  templateUrl: './navbar.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NavbarComponent {
  courseService = inject(CourseService);
  langService = inject(LanguageService);
  layout = inject(LayoutService);
  searchQuery = '';
  notifications = 2;
}
