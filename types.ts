export interface AttendanceRecord {
  id: string;
  startDate: string;
  startTime: string;
  document: string; // CPF or CNPJ
  name: string; // Nome or Razão Social
  theme: string;
  subtheme: string;
  description: string;
  emailGuidance: string;
}

export interface Client {
  document: string; // CPF or CNPJ (Primary Key)
  type: 'CPF' | 'CNPJ';
  name: string; // Nome or Razão Social
  fantasyName?: string; // Nome Fantasia
  email: string;
  phone: string;
  address: string;
  city: string;
  uf: string;
}

export interface ThemeOption {
  id: string;
  label: string;
  subthemes: string[];
}

export interface SimulationResponse {
  name: string;
  isValid: boolean;
  type: 'CPF' | 'CNPJ' | 'UNKNOWN';
}

export interface GuidanceResponse {
  description: string;
  emailTemplate: string;
}