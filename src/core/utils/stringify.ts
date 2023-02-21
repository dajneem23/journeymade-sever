export const stringifyObjectMsg = (obj, pre_text = ' - ') => {
  let msg = ''
  obj && Object.keys(obj).forEach((key) => {
    msg += `\n\t${pre_text}${key}: ${typeof obj[key] === 'object' ? stringifyObjectMsg(obj[key], '\t + ') : obj[key]}`;
  });

  return msg
}