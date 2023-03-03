export type CronLog = {
  job_name: string,
  crawl_id: number,
  data?: {
    raw_count?: number,
    result_count?: number,
  },
  job_count: number;
  job_status?: {
    completed?: number,
    failed?: number,
    wait?: number,
  }
}