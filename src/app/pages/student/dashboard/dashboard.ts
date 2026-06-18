import { Component, inject, computed, signal, effect, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { DashboardService } from '../../../services/student/dashboard.service';
import { GradesService } from '../../../services/student/grades.service';
import { Student } from '../../../models/student/student.model';
import { Grade } from '../../../models/student/grade.model';
import { DecimalPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { CertificateModalComponent } from '../../../shared/certificate-modal/certificate-modal';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, TranslateModule, ConfirmDialog, Toast, PaginationComponent, CertificateModalComponent],
  providers: [MessageService],
  templateUrl: './dashboard.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  dashboardService = inject(DashboardService);
  private gradesService = inject(GradesService);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  translate = inject(TranslateService);

  student = this.auth.currentUser;
  registeredCourses = this.dashboardService.registeredCourses;

  filteredCourses = computed(() => {
    const q = this.dashboardService.searchQuery().trim().toLowerCase();
    if (!q) return this.registeredCourses();
    return this.registeredCourses().filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  });

  readonly pageSize = 10;
  currentPage = signal(1);
  paginatedCourses = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredCourses().slice(start, start + this.pageSize);
  });

  private readonly _resetPage = effect(() => {
    this.dashboardService.searchQuery();
    this.currentPage.set(1);
  });

  ngOnInit(): void {
    this.dashboardService.loadDashboard().subscribe();
  }

  isGraduated = computed(() => this.student()?.status === 'GRADUATED');
  showCertificate = signal(false);

  usedHours = computed(() =>
    this.dashboardService.registeredCourses().reduce((sum, c) => sum + c.hours, 0)
  );

  remainingHours = computed(() => this.student()?.availableHours ?? 0);

  usedPercent = computed(() => {
    const total = this.remainingHours() + this.usedHours() || 1;
    return Math.min(100, Math.round((this.usedHours() / total) * 100));
  });

  deleteCourse(courseCode: string): void {
    this.confirmationService.confirm({
      message: this.translate.instant('DASHBOARD.DELETE_CONFIRM_MESSAGE'),
      header: this.translate.instant('DASHBOARD.DELETE_CONFIRM_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translate.instant('DASHBOARD.YES'),
      rejectLabel: this.translate.instant('DASHBOARD.NO'),
      accept: () => {
        this.dashboardService.deleteCourse(courseCode).subscribe((res) => {
          if (res !== null) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('DASHBOARD.DROP_SUCCESS_TITLE'),
              detail: this.translate.instant('DASHBOARD.DROP_SUCCESS_MSG'),
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('DASHBOARD.DROP_ERROR_TITLE'),
              detail: this.dashboardService.error() ?? this.translate.instant('DASHBOARD.DROP_ERROR_MSG'),
            });
          }
        });
      },
    });
  }

  downloadPdf(): void {
    window.print();
  }

  downloadTranscript(): void {
    const s = this.student();
    if (!s) return;

    this.gradesService.loadGrades('all', 'all').subscribe(() => {
      const grades = this.gradesService.grades();
      this.openTranscriptWindow(s, grades);
    });
  }

  private openTranscriptWindow(s: Student, grades: Grade[]): void {
    const DEPT_NAMES: Record<string, string> = {
      CS: 'Computer Science', IS: 'Information Systems', SE: 'Software Engineering',
    };
    const deptName = DEPT_NAMES[s.department?.toUpperCase()] ?? s.department ?? '—';
    const gradDate = s.graduationDate ? s.graduationDate.slice(0, 10) : '—';
    const logoUrl = `${window.location.origin}/assets/images/logo.png`;

    const rows = grades.map(g => `
      <tr>
        <td>${g.level ?? '—'}</td>
        <td>${g.term ?? '—'}</td>
        <td class="name">${g.courseName}</td>
        <td>${g.grade}</td>
        <td><span class="badge ${this.recognitionClass(g.recognition)}">${g.recognition}</span></td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Academic Transcript</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, 'Segoe UI', sans-serif; background: white; padding: 24px; color: #1e293b; }
    .cert { max-width: 750px; margin: 0 auto; border: 4px solid #b8860b; padding: 6px; }
    .cert-inner { border: 1.5px solid #075392; padding: 28px 36px 24px; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
    .uni-name { color: #075392; font-weight: bold; font-size: 13px; }
    .fac-name { color: #666; font-size: 11px; margin-top: 2px; }
    .logo { width: 54px; height: 54px; object-fit: contain; }
    .rtl { text-align: right; direction: rtl; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 12px 0; }
    .title { text-align: center; margin-bottom: 16px; }
    .title-ar { color: #b8860b; font-weight: bold; font-size: 22px; direction: rtl; margin-bottom: 2px; }
    .title-en { color: #075392; font-weight: 600; letter-spacing: 0.2em; font-size: 11px; text-transform: uppercase; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; margin-bottom: 16px; font-size: 12px; }
    .info-row { display: flex; gap: 6px; }
    .info-label { color: #94a3b8; min-width: 110px; }
    .info-value { font-weight: 600; }
    .gpa-box { text-align: center; margin: 12px 0; }
    .gpa-val { font-size: 28px; font-weight: bold; color: #075392; }
    .gpa-sub { font-size: 11px; color: #94a3b8; }
    .honors { display: inline-block; margin-top: 6px; padding: 3px 14px; border: 1.5px solid #b8860b; border-radius: 20px; color: #b8860b; font-size: 11px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
    thead tr { background: #075392; color: white; }
    th { padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
    tr:nth-child(even) td { background: #f8fafc; }
    td.name { font-weight: 500; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .green  { background: #dcfce7; color: #166534; }
    .emerald{ background: #d1fae5; color: #065f46; }
    .orange { background: #ffedd5; color: #9a3412; }
    .red    { background: #fee2e2; color: #991b1b; }
    .gray   { background: #f1f5f9; color: #475569; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #555; }
    .sig-line { width: 110px; border-top: 1px solid #64748b; margin-top: 28px; margin-left: auto; }
    @page { size: A4; margin: 12mm; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
<div class="cert">
  <div class="cert-inner">
    <div class="header">
      <div>
        <div class="uni-name">Tanta University</div>
        <div class="fac-name">Faculty of Computers and Information</div>
      </div>
      <div style="text-align:center"><img src="${logoUrl}" alt="Seal" class="logo"/></div>
      <div class="rtl">
        <div class="uni-name">جامعة طنطا</div>
        <div class="fac-name">كلية الحاسبات والمعلومات</div>
      </div>
    </div>
    <hr/>
    <div class="title">
      <div class="title-ar">كشف الدرجات الأكاديمي</div>
      <div class="title-en">Official Academic Transcript</div>
    </div>
    <div class="info-grid">
      <div class="info-row"><span class="info-label">Student / الطالب:</span><span class="info-value">${s.name}</span></div>
      <div class="info-row"><span class="info-label">Student ID / الرقم:</span><span class="info-value">${s.studentId}</span></div>
      <div class="info-row"><span class="info-label">Department / القسم:</span><span class="info-value">${deptName}</span></div>
      <div class="info-row"><span class="info-label">Graduation Date:</span><span class="info-value">${gradDate}</span></div>
    </div>
    <div class="gpa-box">
      <div class="gpa-val">${s.gpa.toFixed(2)}</div>
      <div class="gpa-sub">Cumulative GPA / المعدل التراكمي</div>
      ${s.honors ? `<div class="honors">${s.honors}</div>` : ''}
    </div>
    <hr/>
    <table>
      <thead>
        <tr>
          <th>Level</th><th>Term</th><th>Course</th><th>Grade</th><th>Recognition</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">
      <div>Total Courses: <strong>${grades.length}</strong></div>
      <div>
        <div style="font-size:11px;color:#075392;font-weight:600;margin-bottom:28px;">Dean of Faculty / عميد الكلية</div>
        <div class="sig-line"></div>
      </div>
    </div>
  </div>
</div>
</body></html>`;

    const win = window.open('', '_blank', 'width=850,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  }

  private recognitionClass(r: string): string {
    if (['A+','A','A-'].includes(r)) return 'green';
    if (['B+','B','B-'].includes(r)) return 'emerald';
    if (['C+','C','C-'].includes(r)) return 'orange';
    if (r === 'F') return 'red';
    return 'gray';
  }
}
