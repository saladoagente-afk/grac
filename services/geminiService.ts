import { GoogleGenAI, Type } from "@google/genai";
import { SimulationResponse, GuidanceResponse } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Simulates fetching a person or company from a database based on CPF/CNPJ.
 * In a real app, this would hit a SQL DB or Govt API. Here we use Gemini to hallucinate realistic data for the demo.
 */
export const fetchEntityData = async (document: string): Promise<SimulationResponse> => {
  if (!document) return { name: '', isValid: false, type: 'UNKNOWN' };

  const prompt = `
    Analyze this document string: "${document}".
    1. Determine if it looks like a Brazilian CPF or CNPJ format.
    2. If it looks valid, generate a FICTIONAL but realistic "Nome" (if CPF) or "Razão Social" (if CNPJ).
    3. If it's a CNPJ, use a realistic company name format (e.g., Silva Comércio LTDA).
    4. If it's a CPF, use a realistic full name.
    
    Return JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            type: { type: Type.STRING, enum: ["CPF", "CNPJ", "UNKNOWN"] },
            name: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as SimulationResponse;
  } catch (error) {
    console.error("Error fetching entity:", error);
    return { name: '', isValid: false, type: 'UNKNOWN' };
  }
};

/**
 * Simulates fetching standard text descriptions and email templates from a "Knowledge Base".
 */
export const fetchGuidance = async (theme: string, subtheme: string, entityName: string): Promise<GuidanceResponse> => {
  const prompt = `
    Context: A municipal "Sala do Empreendedor" service center.
    Task: Generate a standard database record for a service attendance.
    
    Inputs:
    - Theme: ${theme}
    - Subtheme: ${subtheme}
    - Client Name: ${entityName}

    Output (JSON):
    1. description: A formal, short summary of what this service usually entails (e.g., "Atendimento realizado para orientação sobre..."). Use passive voice or "Realizado atendimento...".
    2. emailTemplate: A professional, polite email draft to send to the citizen with instructions or confirming the service. Start with "Prezado(a) ${entityName},".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            emailTemplate: { type: Type.STRING }
          }
        }
      }
    });

     const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as GuidanceResponse;
  } catch (error) {
    console.error("Error generating guidance:", error);
    return { description: "Erro ao buscar dados.", emailTemplate: "Erro ao buscar dados." };
  }
};