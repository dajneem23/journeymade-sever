import model from '@/models/tag.model';

export const getAllTags = async ({ offset = 0, limit = 100 }) => {
  return await model.find().skip(offset).limit(limit).lean();
};

export const getTagsByIds = async ({ ids = [] }) => {
  return await model.find({ id: { $in: ids } }).lean();
};
