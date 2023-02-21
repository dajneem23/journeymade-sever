import model from '@/models/top-holders-statistics.model';

export const countDocuments = async ({
  crawl_id,
}) => {
  return await model.countDocuments({ crawl_id: crawl_id }).exec();
};
