import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'landing',
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div class="card text-center w-300px mx-auto">
        <div class="card-body">
          <h5 class="card-title">Choose an App</h5>
          <a [routerLink]="['/resume-builder']" class="btn btn-outline-dark"
            >Resume Builder</a
          >
          <a
            [routerLink]="['/cover-letter-generator']"
            class="btn btn-outline-dark"
            >Cover Letter Generator</a
          >
          <a [routerLink]="['/ats-assesment']" class="btn btn-outline-dark"
            >ATS Assesment</a
          >
        </div>
      </div>
    </div>
  `,
  imports: [RouterModule],
  standalone: true,
})
export class AppLanding {
  constructor() {}
}
