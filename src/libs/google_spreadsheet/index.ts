/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { chartTimeFrames } from '../../config/vars.0';

// const creds = await import(
//   './../configs/private/trading-376401-0c04491b3921.json',
//   {
//     assert: { type: 'json' },
//   }
// );

import creds from '../../config/private/trading-376401-0c04491b3921.json'

const fileID = '1q4pkATL6p0kgWaRMyXSU0WlRkl1IKaZiIqEDVfrl8K0';
const sheets = []
const sheetIdx = {
  1: 0,
  5: 1,
  15: 2,
  60: 3,
  240: 4
}

export const initGoogleSpreadsheetService = async () => {
  const doc = new GoogleSpreadsheet(fileID);
  await doc.useServiceAccountAuth(creds);

  await doc.loadInfo(); // loads document properties and worksheets

  chartTimeFrames.forEach((tf, index) => {
    sheets.push(doc.sheetsByIndex[sheetIdx[tf]])
  })

  // console.log("🚀 ~ file: index.ts:23 ~ chartTimeFrames.forEach ~ sheets", sheets)
};

export const clearRows = async (tf, options = {}) => {
  const index = chartTimeFrames.findIndex(v => v == tf);
  if (index < 0) return;

  return await sheets[index].clearRows(options);
};


export const addRows = async (tf, values = [], options = {}) => {
  const index = chartTimeFrames.findIndex(v => v == tf);
  if (index < 0) return;

  return await sheets[index].addRows(values, options);
};

export const getRows = async (tf) => {
  const index = chartTimeFrames.findIndex(v => v === Number(tf));
  if (index < 0) return;

  return await sheets[index].getRows();
};
