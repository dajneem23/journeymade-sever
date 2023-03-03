import model from '@/models/tag.model';
import { ITag } from '@/types';

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

export const upsertTags = async (tags: ITag[]) => {
  const updateOps = tags.map((tag) =>
    updateOne(
      {
        id: tag.id,
      },
      tag,
    ),
  );

  return await model.bulkWrite([...updateOps]);
};
