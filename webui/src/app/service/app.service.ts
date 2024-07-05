import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Resume } from '../models/resume-types';
import { tap } from 'rxjs';

type GemmaResponse = { response: string };
@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private http: HttpClient) {}

  getCoverLetter(resume: {
    resume: string;
    jobDescription: string;
  }): Observable<GemmaResponse> {
    return this.http.post<GemmaResponse>(
      'cv-api/cover-letter-generate',
      resume,
      { responseType: 'json' }
    );
  }

  getAtsBreakdown(resume: {
    resume: string;
    jobDescription: string;
  }): Observable<GemmaResponse> {
    return this.http.post<GemmaResponse>(
      'cv-api/ats-predict',
      resume,
      { responseType: 'json' }
    );
  }

  getCoverLetterPdf(letterText: string): Observable<ArrayBuffer> {
    return this.http.post(
      'cv-api/cover-letter-pdf',
      { letterText },
      { responseType: 'arraybuffer' }
    );
  }

  getPdfBytes(resume: Resume): Observable<ArrayBuffer> {
    return this.http.post('cv-api/resume-pdf', resume, {
      responseType: 'arraybuffer',
    });
  }

  saveResumeToGCloud(resume: Resume): Observable<ArrayBuffer> {
    return this.http.post('cv-api/resume', resume, {
      responseType: 'arraybuffer',
    });
  }

  listResume(): Observable<Array<Resume>> {
    return this.http.get<Array<Resume>>(
      'cv-api/list-resume'
    ).pipe(tap(c => console.log(c)));
  }

  deleteResume(blobId : string) : Observable<void> {
    const options = new HttpParams().append("blobId",blobId)
    return this.http.delete<void>('cv-api/resume',{params : options})
  }
}
