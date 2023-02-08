const chalk = require('chalk');

export const infoLog = (text) => {
  console.log(chalk.cyan(text));
};

export const highlightLog = (text) => {
  console.log(chalk.bgGrey(text));
};
