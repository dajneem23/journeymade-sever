import dynamicModel from '@/models/user-portfolios-by-crawlId.model';

export const countDocuments = async ({
  crawl_id,
  filter = {}
}) => {
  const model = dynamicModel(crawl_id);
  if (!model) {
    throw console.error('no collection', crawl_id);
  }

  return await model.countDocuments(filter).exec();
};
