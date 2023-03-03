import portfoliosModel from '@/models/portfolios.model';
import { IPortfolios } from '../types/portfolios.type';

// Update function
function updateOne(filter, update) {
  return {
    updateOne: {
      filter,
      update: {
        $set: update,
      },
      upsert: true,
    },
  };
}

export const savePortfolios = async (crawl_date, portfolios: IPortfolios[]) => {
  const model = portfoliosModel(crawl_date);
  if (!model) {
    throw console.error('no collection', crawl_date);
  }

  const updateOps = portfolios.map((p) =>
    updateOne(
      {
        address: p.address,
        ref_id: p.ref_id,
      },
      p,
    ),
  );

  return await model.bulkWrite([...updateOps]);
};
