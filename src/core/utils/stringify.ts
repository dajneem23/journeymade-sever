export const stringifyObjectMsg = (obj) => {
  let msg = ''
  Object.keys(obj).forEach((key) => {
    msg += `\n\t - ${key}: ${obj[key]}`;
  });

  return msg
}