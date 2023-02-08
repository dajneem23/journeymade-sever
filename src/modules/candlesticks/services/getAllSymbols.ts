export const getAllSymbols = async (model) => {
  return await model.find().distinct('symbol');
}