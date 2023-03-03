import model from '@/models/tag.model';

export const deleteTag = async (id: string) => {
  return await model.findOneAndDelete({ id: id }).lean();
};
