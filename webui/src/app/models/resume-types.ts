// Define interfaces/classes for Resume structure
export interface WorkHistory {
  startDate: string;
  endDate?: string;
  jobTitle: string;
  companyName: string;
  summary: string;
  achievements: string[];
}

export interface EducationHistory {
  startDate: string;
  endDate?: string;
  schoolName: string;
  degree: string;
  achievements: string;
}

export interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface SkillSet {
  skillSetName: string;
  skills: string[];
}

export class Resume {
  id: string = '';
  headerStatement: string = '';
  targetRole: string = '';
  contact: Contact = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  };
  workHistory: WorkHistory[] = [];
  educationHistory: EducationHistory[] = [];
  skills: SkillSet[] = [];
  constructor() {}
}
