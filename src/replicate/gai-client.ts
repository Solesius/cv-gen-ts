import { GoogleGenerativeAI }  from "https://esm.sh/@google/generative-ai@0.14.1"
const ai =  new GoogleGenerativeAI("AIzaSyDRBvJsnzjYhC0ZFxtPaMDwGP_nLNg563Q")
const gemini = ai.getGenerativeModel({model : "gemini-1.5-flash"})

const start = new Date().getTime()
export const go = () => gemini.generateContent("write a 3 paragraph cover letter for a .Net developer").then(c => console.log(c.response.text(),new Date().getTime() - start))
console.log()



