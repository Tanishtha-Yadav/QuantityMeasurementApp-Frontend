export interface Unit {
  value: number;
  unit: string;
}

export interface QuantityDTO {
  value: number;
  unit: string;
}

export interface QuantityInputDTO {
  thisQuantityDTO: QuantityDTO;
  thatQuantityDTO: QuantityDTO;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserInfo;
}

export interface UserRegistrationDTO {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface HistoryRecord {
  id?: number;
  type: string;
  action: string;
  expression: string;
  result: string;
  timestamp?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp?: string;
}

export interface ConversionRequest {
  value: number;
  fromUnit: string;
  toUnit: string;
}

export interface ComparisonRequest {
  value1: number;
  unit1: string;
  value2: number;
  unit2: string;
}

export interface ArithmeticRequest {
  value1: number;
  unit1: string;
  value2: number;
  unit2: string;
  operator: '+' | '-' | '*' | '/';
}

export interface RefreshTokenRequest {
  token: string;
}

export type MeasurementType = 'LENGTH' | 'WEIGHT' | 'TEMPERATURE' | 'VOLUME';
export type ActionType = 'COMPARISON' | 'CONVERSION' | 'ARITHMETIC';
export type Operator = '+' | '-' | '*' | '/';

export interface MeasurementState {
  selectedType: MeasurementType;
  selectedAction: ActionType;
  value1: number | null;
  unit1: string | null;
  value2: number | null;
  unit2: string | null;
  operator: Operator | null;
  result: string | null;
  isLoading: boolean;
  error: string | null;
}
