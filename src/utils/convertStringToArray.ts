export const convertStringToArray = function(text: string, splitChar = ',') {
  return text.split(splitChar).map((item) => item.trim());
};