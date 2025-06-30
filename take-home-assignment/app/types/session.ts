// global types

export interface Fields {
  name: string;
  email: string;
  phone: string;
  available: string;
  skills: string[];
}

export interface AdditionalQuestion {
  id: string;
  questionText: string;
  content?: string;
}

export interface SessionData {
  sessionId: string;
  fields: Fields;
  additionalQuestions: AdditionalQuestion[];
}
