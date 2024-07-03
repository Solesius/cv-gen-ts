import { CoverLetterRequest } from "../models/cover-letter-request.model.ts";
import { GemmaResponse, Prediction } from "../models/replicate/replicate-models.ts";

export class ReplicateClient {
    private baseUrl: string = "https://api.replicate.com/v1";
    private defaultTimeoutMillis: number = 45_000;

    constructor() { }

    buildCoverLetterPromptTemplate(request: CoverLetterRequest) {
        return `
            <start_of_turn>user                   
          task = Tailored cover letter in a professional style, tailored to the provided job description, utilizing the provided candidate info. 

          cv_length = 3 paragraphs 

          job_description = 
          { ${request.jobDescription} } 

          candidate_profile = 
          { ${request.resume} }
          <end_of_turn><start_of_turn>model
        `;
    }

    public buildaAtsMatchPromptTemplate(request: CoverLetterRequest) {
        return `  
                <start_of_turn>user                   
                task = [ 
                        Your task is as follows; to Operate as an Applicant Tracking System
                        Given the provided input data below of job_description and candidate_profile, 
                        Provide a highly detailed, section by section breakdown of the candidate_profile,
                        Then perform a 6 paragraph breakdown assesment fit to the job_description. The report should give us enough to make a second call.
                        Also provide a personality fit and assesment, based on writing style and content. 
                        Finally provide a final 0-100 score, and reccomendation to increase alignment with the tole, such as missing keywords
    
                        output format  should be
    
                          CANDIDATE_OVERVIEW :
                              bRIEF DESC OF CANDIDATE CAPABILITITES
                          JOB_FIT :
                              How well do they algiwn with the provided role, and why
                              detailed breakdown into categories and score each cateogry for why
                              it aligns well with the outlined job criteria
                          Personality_fit:
                              WQhats the culture fit and what does res say about personality
                          FINAL_SCORE:
                              0-100 score based on all previous knowledge comnbined. 
                        
                          provide a short set of 4 interview questions.
                      ]
    
                job_description = 
                { ${request.jobDescription} } 
    
                candidate_profile = 
                { ${request.resume} }
                <end_of_turn><start_of_turn>model
           `;
    }

    public async getPredictionBase(id: string): Promise<Prediction> {
        const p = await fetch(
            this.baseUrl.concat("/predictions/").concat(id),
            this._defaultReqInit()
        );
        const consumedBody = p.json();

        return consumedBody as Prediction;
    }

    public async pollPredictionComplete(id: string): Promise<boolean> {
        const start = new Date().getTime();
        const timeout = this.defaultTimeoutMillis ?? 45000; // Default timeout in milliseconds

        // in JS, you need to return terminal case in a recursive function otherwise, proper signal valusn't returnd
        const poll = async (): Promise<boolean> => {
            const currentTime = new Date().getTime();

            if (currentTime > start + timeout) {
                return false; // Timeout reached
            } else {
                try {
                    const prediction = await this.getPredictionBase(id);
                    if (prediction?.status?.includes("succeeded")) {
                        return true; // Prediction succeeded
                    } else {
                        await new Promise((resolve) => setTimeout(resolve, 180));
                        return poll(); // Retry polling
                    }
                } catch (error) {
                    console.error("Error fetching prediction:", error);
                    return false; // Handle error scenario
                }
            }
        };

        return await poll();
    }

    public async generateBase(input: string): Promise<GemmaResponse> {
        const emptyResponse: GemmaResponse = { response: "" };

        const payload = {
            input: {
                prompt: input,
                top_k: 50,
                top_p: 0.95,
                temperature: 0.73,
                repitition_penalty: 1.2,
                max_new_tokens: 2048,
            },
            version:
                "dff94eaf770e1fc211e425a50b51baa8e4cac6c39ef074681f9e39d778773626",
        };

        const reqUrl = this.baseUrl.concat("/predictions");
        const newPrediction = (await (
            await fetch(reqUrl, {
                ...this._defaultReqInit(),
                method: "POST",
                body: JSON.stringify(payload),
            })
        ).json()) as Prediction;

        if (newPrediction.id) {
            const predictionReady = await this.pollPredictionComplete(
                newPrediction.id
            );
            if (predictionReady) {
                const finalPrediction = await this.getPredictionBase(newPrediction.id);
                console.log(finalPrediction);
                if (finalPrediction) {
                    return {
                        response: finalPrediction.output?.reduce((a, b) => a + b, "") ?? "",
                    };
                } else {
                    return emptyResponse;
                }
            } else {
                return emptyResponse;
            }
        } else {
            throw new Error("asdsad");
        }
    }

    public async generateCoverLetter(request: CoverLetterRequest) {
        return await this.generateBase(
            this.buildCoverLetterPromptTemplate(request)
        );
    }

    public generateAtsMatch(request: CoverLetterRequest) {
        return this.generateBase(this.buildaAtsMatchPromptTemplate(request));
    }

    public async generateHeartBeat() {
        const val = await this.generateBase("what is 2+4");
        return val.response.length > 0;
    }

    private _defaultReqInit() {
        const apiKey = Deno.env.get("REPLICATE_API_KEY");
        const headers = new Headers();
        headers.set("Authorization", "Bearer " + apiKey);
        return {
            method: "GET",
            headers: headers,
        };
    }
}
