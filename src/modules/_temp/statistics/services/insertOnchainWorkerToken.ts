import model from '@/models/onchain-worker-tokens.model';

export const insertOnchainWorkerToken = async (list) => {
  const updated = list.map(row => {
    return {
      updateOne: {
        filter: {
          _id: row._id,
        },
        update: {
          $set: row,
        },
        upsert: true,
      },
    }
  })

  return await model.bulkWrite(updated);
};
