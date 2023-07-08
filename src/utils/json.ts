export const isJson = (str: string) => {
  try {
    const json = JSON.parse(str);
    return json;
  } catch (error) {
    return false;
  }
};

export const getJsonRegex = (str: string) => {
  try {
    const jsonfromstring = JSON.parse(str.match(/\[(.*)\]/)?.[0]);
    return jsonfromstring;
  } catch (error) {
    return false;
  }
};
