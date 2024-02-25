import { Competitions } from "@/utils/enums";

export interface MatchTable {
  id: number;
  home: string;
  away: string;
  date: Date;
  competition: Competitions;
  season: number;
  has_changed: boolean;
  last_updated: Date;
}

export interface ExecutionTable {
  id: number;
  script_name: string;
  date: Date;
  success?: boolean;
  error?: string;
}

export interface EventTable {
  calendar_id: string;
  home: string;
  away: string;
  date: Date;
  competition: string;
  season: number;
}