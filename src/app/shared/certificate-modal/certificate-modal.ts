import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { Student } from '../../models/student/student.model';

const DEPT_NAMES: Record<string, string> = {
  CS: 'Computer Science',
  IS: 'Information Systems',
  SE: 'Software Engineering',
};

@Component({
  selector: 'app-certificate-modal',
  imports: [DecimalPipe, SlicePipe],
  templateUrl: './certificate-modal.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CertificateModalComponent {
  @Input() student: Student | null = null;
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  getDeptName(code: string | undefined): string {
    if (!code) return '—';
    return DEPT_NAMES[code.toUpperCase()] ?? code;
  }

  close(): void {
    this.closeModal.emit();
  }

  print(): void {
    const s = this.student;
    if (!s) return;

    const logoUrl = `${window.location.origin}/assets/images/logo.png`;
    const deptName = this.getDeptName(s.department);
    const gradDate = s.graduationDate ? s.graduationDate.slice(0, 10) : '—';
    const gpa = s.gpa.toFixed(2);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Graduation Certificate</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, 'Segoe UI', sans-serif;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .cert { width: 680px; border: 4px solid #b8860b; padding: 6px; background: white; }
    .cert-inner { border: 1.5px solid #075392; padding: 30px 38px 26px; }
    .cert-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
    .university-name { color: #075392; font-weight: bold; font-size: 14px; line-height: 1.4; }
    .faculty-name { color: #555; font-size: 11px; margin-top: 2px; }
    .logo { width: 58px; height: 58px; object-fit: contain; }
    .rtl { text-align: right; direction: rtl; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 14px 0; }
    .cert-title { text-align: center; margin-bottom: 18px; }
    .cert-title-ar { color: #b8860b; font-weight: bold; font-size: 34px; direction: rtl; margin-bottom: 4px; }
    .cert-title-en { color: #075392; font-weight: 600; letter-spacing: 0.22em; font-size: 12px; text-transform: uppercase; }
    .cert-body { text-align: center; color: #666; font-size: 13px; margin-bottom: 14px; }
    .student-name { text-align: center; color: #075392; font-size: 22px; font-weight: bold; margin-bottom: 22px; }
    .cert-info { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center; margin-bottom: 22px; }
    .info-label { font-size: 10px; color: #94a3b8; margin-bottom: 4px; }
    .info-value { font-size: 13px; font-weight: 600; color: #1e293b; }
    .cert-footer { display: flex; align-items: flex-end; justify-content: space-between; }
    .grad-date { font-size: 12px; color: #555; }
    .dean-section { text-align: right; direction: rtl; }
    .dean-title { font-size: 11px; color: #075392; font-weight: 600; margin-bottom: 28px; }
    .sig-line { width: 120px; border-top: 1px solid #64748b; margin-left: auto; }
    @page { size: A4; margin: 12mm; }
    @media print { body { padding: 0; min-height: auto; } }
  </style>
</head>
<body>
  <div class="cert">
    <div class="cert-inner">
      <div class="cert-header">
        <div>
          <div class="university-name">Tanta University</div>
          <div class="faculty-name">Faculty of Computers and Information</div>
        </div>
        <div style="text-align:center">
          <img src="${logoUrl}" alt="Seal" class="logo" />
        </div>
        <div class="rtl">
          <div class="university-name">جامعة طنطا</div>
          <div class="faculty-name">كلية الحاسبات والمعلومات</div>
        </div>
      </div>
      <hr />
      <div class="cert-title">
        <div class="cert-title-ar">شهادة تخرج</div>
        <div class="cert-title-en">GRADUATION CERTIFICATE</div>
      </div>
      <div class="cert-body">
        This is to certify that student / تشهد الكلية بأن الطالب
      </div>
      <div class="student-name">${s.name}</div>
      <div class="cert-info">
        <div>
          <div class="info-label">Student ID / رقم القيد</div>
          <div class="info-value">${s.studentId}</div>
        </div>
        <div>
          <div class="info-label">Department / القسم</div>
          <div class="info-value">${deptName}</div>
        </div>
        <div>
          <div class="info-label">Cumulative GPA / المعدل التراكمي</div>
          <div class="info-value">${gpa}</div>
        </div>
      </div>
      <hr />
      <div class="cert-footer">
        <div class="grad-date">Graduation Date: ${gradDate}</div>
        <div class="dean-section">
          <div class="dean-title">Dean of Faculty / عميد الكلية</div>
          <div class="sig-line"></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=800,height=650');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  }
}
