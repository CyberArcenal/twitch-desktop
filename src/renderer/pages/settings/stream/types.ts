export interface IngestServer {
  id: string;
  name: string;
  url_template: string;
  default: boolean;
  availability: number;
}