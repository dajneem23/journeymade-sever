import model from '@/models/top-holders-statistics.model';

export const saveTopHoldersStatistics = async (data) => {
  const updateOne = {
    updateOne: {
      filter: {
        id: data.id,
      },
      update: {
        $set: data,
      },
      upsert: true,
    },
  };

  return await model.bulkWrite([updateOne]);
};
