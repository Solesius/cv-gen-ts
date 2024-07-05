import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { AppService } from './service/app.service';
import { provideRouter } from '@angular/router';
import { ResumeBuilderComponent } from './resume-builder/resume-builder.component';

import { AppLanding } from './landing/landing-component';
import { CoverLetterGeneratorComponent } from './cover-letter-generator/cover-letter-generator.component';
import { AtsAssementComponent } from './ats-assesment/ats-assesment.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    AppService,
    provideRouter([
      { path: '', component: AppLanding }, // Default route
      { path: 'resume-builder', component: ResumeBuilderComponent },
      { path: 'ats-assesment', component: AtsAssementComponent },
      {
        path: 'cover-letter-generator',
        component: CoverLetterGeneratorComponent,
      },
      { path: '**', redirectTo: '', pathMatch: 'full' }, // Wildcard route redirects to default route
    ]),
  ],
};
