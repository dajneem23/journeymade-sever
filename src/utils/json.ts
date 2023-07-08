export const isJson = (str: string) => {
  try {
    const json = JSON.parse(str);
    return json;
  } catch (error) {
    return false;
  }
};
