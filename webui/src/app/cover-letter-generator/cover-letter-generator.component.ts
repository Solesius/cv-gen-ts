import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppService } from '../service/app.service';
import { PDFUtil } from '../utils/pdf-util';
import { Resume } from '../models/resume-types';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  selector: 'app-cover-letter-generator',
  templateUrl: `./cover-letter-generator.component.html`,
  styleUrl: `./cover-letter-generator.component.scss`,
})
export class CoverLetterGeneratorComponent implements OnInit {
  isLoading = false;
  errorState = false;
  coverLetterForm: FormGroup = this.fb.group({
    jobDescription: new FormControl<string>(''),
    resume: new FormControl<string>(''),
    output: new FormControl<string>(''),
    selectedResume: new FormControl<Resume>({} as any)
  });

  resumes: Array<Resume> = []
  selectedResume: Resume = new Resume();
  subscriptions = new Subscription()

  constructor(
    private fb: FormBuilder,
    private rtr: Router,
    private rt: ActivatedRoute,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.appService.listResume().subscribe({
      next : (resumes) =>  this.resumes = resumes
    })

    this.coverLetterForm.get("selectedResume")?.valueChanges.subscribe({
      next : (option) => {
        if(option) 
        {
          console.log(option)
          this.coverLetterForm.get("resume")?.patchValue(JSON.stringify(option,null,2), {emitChanges : false})
        } else {
          this.coverLetterForm.get("resume")?.patchValue('', {emitChanges : false})
        }
      }
    })
  }

  get jobDescription() {
    return this.coverLetterForm.get('jobDescription') as FormControl;
  }

  get resume() {
    return this.coverLetterForm.get('resume') as FormControl;
  }

  get output() {
    return this.coverLetterForm.get('output') as FormControl;
  }

  goBack() {
    this.rtr.navigate(['../resume-builder'], { relativeTo: this.rt });
  }

  downloadPdf() {
    this.isLoading = true;
    this.appService.getCoverLetterPdf(this.output.value).subscribe({
      next: (pdfBytes) => {
        PDFUtil.downloadPdfBytes(pdfBytes);
        this.isLoading = false;
      },
      error: (e) => {
        console.log(e);
        this.isLoading = false;
      },
    });
  }

  generateCoverLetter() {
    this.isLoading = true;
    this.errorState = false;
    const resume = {
      resume: this.resume.value,
      jobDescription: this.jobDescription.value,
    };

    this.appService.getCoverLetter(resume).subscribe({
      next: (coverLetter) => {
        this.output.setValue(coverLetter?.response);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorState = true;
        this.isLoading = false;
      },
    });
  }
}
