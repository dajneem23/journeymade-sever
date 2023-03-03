import model from '@/models/cron-logs.model';
export const get = async () => {
  return await model.find({}).sort({ crawl_id: -1 }).limit(100);
};
