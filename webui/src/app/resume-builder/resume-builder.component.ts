import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AppService } from '../service/app.service';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  EducationHistory,
  Resume,
  SkillSet,
  WorkHistory,
} from '../models/resume-types';
import { FaCoffee } from 'react-icons/fa'; // or any other icon set (e.g. 'react-icons/md')
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TrimPipe } from '../pipes/trim-pipe';
import { debounceTime, fromEvent, map, Subscription } from 'rxjs';
import { PDFUtil } from '../utils/pdf-util';

@Component({
  selector: 'resume-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './resume-builder.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [TrimPipe],
})
export class ResumeBuilderComponent implements OnInit, OnDestroy {

  constructor(
    private appService: AppService,
    private fb: FormBuilder,
    private rtr: Router,
    private rt: ActivatedRoute
  ) {}

  private _subs = new Subscription();

  resumeSelectForm = new FormGroup({
    selectedResume: new FormControl<Resume>({} as any),
  });

  resumeForm = new FormGroup({
    id: new FormControl(''),
    headerStatement: new FormControl('', Validators.required),
    targetRole: new FormControl('', Validators.required),
    contact: new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', Validators.email),
      phone: new FormControl(
        '',
        Validators.pattern('^[0-9]{3}-[0-9]{3}-[0-9]{4}$')
      ),
    }),
    currentWorkAc: new FormControl(''),
    currentSkillSetSkill: new FormControl(''),
    workHistory: new FormArray([]),
    educationHistory: new FormArray([]),
    skills: new FormArray([]),
  });

  faCoffee = 'faCoffee';
  showWorkHistAc = false;
  resumes: Array<Resume> = [];

  ngOnInit(): void {
    this.loadResumes();
    this._subs.add(
      this.resumeSelectForm.get('selectedResume')?.valueChanges.subscribe({
        next: (nextSelectedRes) => {
          if (nextSelectedRes) {
            console.log(nextSelectedRes);
            this.initializeComponentData(nextSelectedRes);
          } else {
            this.resumeForm.reset();
            this.workHistory.clear();
            this.educationHistory.clear();
            this.skills.clear();
          }
        },
      })
    );
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  get workHistory(): FormArray {
    return this.resumeForm.get('workHistory') as FormArray;
  }

  get educationHistory(): FormArray {
    return this.resumeForm.get('educationHistory') as FormArray;
  }

  get skills(): FormArray {
    return this.resumeForm.get('skills') as FormArray;
  }

  loadResumes(id? :string) {
    this.appService.listResume().subscribe({
      next: (resumes) => {
        this.resumes = resumes;
        if(id != null && id.length > 0) {
          this.resumeSelectForm.get('selectedResume')?.patchValue(resumes.find(r => r.id === id) ?? {} as any)
        }
      },
    });
  }
  addWorkHistory(): void {
    const workHistory = new FormGroup({
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl(''),
      jobTitle: new FormControl('', Validators.required),
      companyName: new FormControl('', Validators.required),
      summary: new FormControl('', Validators.required),
      achievements: new FormControl([], Validators.required),
    });
    this.workHistory.push(workHistory);
  }

  removeWorkHistory(index: number): void {
    this.workHistory.removeAt(index);
  }
  removeWorkHistoryAchievement(i: number, j: number) {
    const achievements = this.workHistory.at(i)?.get('achievements');
    if (achievements) {
      const strings = achievements.value as string[];
      achievements.setValue([
        ...(strings || []).filter((_: string, index: number) => index !== j),
      ]);
      console.log(achievements.value);
    }
  }

  saveAcState(i: number, j: number, $event: any) {
    const wkHistCtl = this.workHistory.at(i);
    const achievements = wkHistCtl?.get('achievements');

    fromEvent($event.target, 'input')
      .pipe(
        debounceTime(300), // debounce for 500ms
        map((event: any) => (event.target as HTMLElement).innerText)
      )
      .subscribe((data: string) => {
        if (achievements && data && data.length) {
          const strings = achievements.value as string[];
          if (strings[j]) {
            strings[j] = data;
          }
        }
      });
  }

  collapseWorkHist() {
    this.showWorkHistAc = this.showWorkHistAc == false ? true : false;
  }

  addWorkHistoryAc(i: number) {
    const wkHistCtl = this.workHistory.at(i);
    const achievements = wkHistCtl?.get('achievements');
    const data = this.resumeForm.get('currentWorkAc')?.value;
    if (achievements && data && data.length) {
      const strings = achievements.value as string[];
      achievements.setValue([...strings, data]);
      this.resumeForm.get('currentWorkAc')?.setValue('');
    }
  }

  addSkillSetSkill(i: number) {
    const wkHistCtl = this.skills.at(i);
    const achievements = wkHistCtl?.get('skills');
    const data = this.resumeForm.get('currentSkillSetSkill')?.value;
    if (achievements && data && data.length) {
      const strings = achievements.value as string[];
      achievements.setValue([...strings, data]);
      this.resumeForm.get('currentSkillSetSkill')?.setValue('');
    }
  }

  addEducationHistory(): void {
    const educationHistory = new FormGroup({
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl(''),
      schoolName: new FormControl('', Validators.required),
      degree: new FormControl('', Validators.required),
      achievements: new FormControl('', Validators.required),
    });
    this.educationHistory.push(educationHistory);
  }

  removeEducationHistory(index: number): void {
    this.educationHistory.removeAt(index);
  }

  addSkill(): void {
    const skill = new FormGroup({
      skillSetName: new FormControl('', Validators.required),
      skills: new FormControl([], Validators.required),
    });
    this.skills.push(skill);
  }

  removeSkill(index: number): void {
    this.skills.removeAt(index);
  }

  removeSkillSetSkill(i: number, j: number): void {
    const skills = this.skills.at(i).get('skills');
    const strings = skills?.value as string[];
    skills?.setValue([
      ...(strings || []).filter((_: string, index: number) => index !== j),
    ]);
  }

  pdf(): void {
    const resume: Resume = this.resumeForm.value as Resume;
    this.appService.getPdfBytes(resume).subscribe({
      next: (pdfBytes) => {
        PDFUtil.downloadPdfBytes(pdfBytes);
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  save(): void {
    let res: any = {};
    const setId = this.resumeForm.get('id')?.value
    const foundResume = this.resumes.find(
      (r) => r.id == setId
    );
    res = {
      ...foundResume,
      ...this.resumeForm.value,
    } || { ...this.resumeForm.value };

    if(!setId || setId == null) {
      res.id = this.randomGuid()
      
      this.initializeComponentData(res)
    }

    delete res.currentSkillSetSkill;
    delete res.currentWorkAc;

    console.log(this.resumeForm)
    this.appService.saveResumeToGCloud(res as Resume).subscribe({
      next: () => {
        this.loadResumes(res.id ?? "");
      },
    });
  }

  dropResume() {
    this.appService
      .deleteResume(
        this.resumeSelectForm.get('selectedResume')?.value?.id ?? ''
      )
      .subscribe(() => {
        this.loadResumes();
        this.resumeSelectForm.reset();
      });
  }

  cloneResume() {
    let current = this.resumeSelectForm.get("selectedResume")?.value
    let clone = {...current}
    clone.id = this.randomGuid();
    this.resumes.push(clone as Resume)
    this.initializeComponentData(clone as Resume)
    this.resumeSelectForm.patchValue({selectedResume : clone as Resume})
  }

  initializeComponentData(res: Resume) {
    this.resumeForm.patchValue(res as any);
    this.resumeForm.get('currentWorkAc')?.setValue('');
    this.resumeForm.get('currentSkillSetSkill')?.setValue('');
    this.workHistory.clear()
    this.educationHistory.clear()
    this.skills.clear()

    res.workHistory?.forEach((w: WorkHistory) =>
      this.workHistory.push(
        new FormGroup({
          startDate: new FormControl(w.startDate, Validators.required),
          endDate: new FormControl(w.endDate),
          jobTitle: new FormControl(w.jobTitle, Validators.required),
          companyName: new FormControl(w.companyName, Validators.required),
          summary: new FormControl(w.summary, Validators.required),
          achievements: new FormControl(w.achievements, Validators.required),
        })
      )
    );

    res.educationHistory.forEach((e: EducationHistory) =>
      this.educationHistory.push(
        new FormGroup({
          startDate: new FormControl(e.startDate, Validators.required),
          endDate: new FormControl(e.endDate),
          schoolName: new FormControl(e.schoolName, Validators.required),
          degree: new FormControl(e.degree, Validators.required),
          achievements: new FormControl(e.achievements, Validators.required),
        })
      )
    );

    res.skills.forEach((s: SkillSet) =>
      this.skills.push(
        new FormGroup({
          skillSetName: new FormControl(s.skillSetName, Validators.required),
          skills: new FormControl(s.skills, Validators.required),
        })
      )
    );
  }

  private randomGuid = () =>
    [...Array(12)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')
      .toUpperCase();
}
