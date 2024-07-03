export interface Input {}

export interface GemmaResponse {
  response : string
}
export interface Metrics {
  predict_time: number;
}

export interface Urls {
  cancel: string;
  get: string;
}

export interface Prediction {
  id?: string;
  model?: string;
  version?: string;
  input?: Input;
  logs?: string;
  error?: string;
  status?: string;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  output?: string[];
  urls?: Urls;
  metrics?: Metrics;
}