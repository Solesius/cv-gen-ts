export interface WorkHistory {
    startDate: Date,
    endDate: Date,
    jobTitle: string,
    companyName: string,
    summary: string,
    achievments: string[]
}

export interface EducationHistory {
    startDate: Date,
    endDate: Date,
    jobTitle: string,
    schoolName: string,
    degree: string,
}

export interface Contact {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
}

export interface SkillSet {
    skillSetName: string, 
    skills:  string[]
}

export interface Resume {
    id : String, 
    headerStatement : string, 
    targetRole: string,
    contact: Contact, 
    workHistory : WorkHistory[],
    educationHistory : EducationHistory[],
    skills: SkillSet[] 
}

