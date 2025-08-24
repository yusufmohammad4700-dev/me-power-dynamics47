export interface ConflictEvent {
  id: string;
  date: string;
  location: {
    country: string;
    region: string;
    coordinates: [number, number];
  };
  actors: {
    primary: string[]; // actor IDs
    secondary?: string[];
  };
  eventType: string; // ACLED/UCDP event types
  subEventType?: string;
  intensity: number; // 1-5 scale
  fatalities: number;
  description: string;
  descriptionTr: string;
  sources: string[];
  dataSource: 'ACLED' | 'UCDP' | 'GDELT';
  lastUpdated: string;
}

export interface ScenarioParameter {
  id: string;
  name: string;
  nameTr: string;
  type: 'slider' | 'select' | 'boolean';
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string; labelTr: string }[];
  defaultValue: any;
  currentValue: any;
  description: string;
  descriptionTr: string;
}

export interface Scenario {
  id: string;
