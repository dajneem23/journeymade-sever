export enum DATA_SOURCE {
  DEBANK_BALANCES = 'debank:balances',
  DEBANK_PROJECTS = 'debank:projects',
  
  BINANCE = 'binance',
  DEXSCREENER = 'dexscreener'
}

export enum CRON_TASK_STATUS {
  running = 'running',
  done = 'done',
  crashed = 'crashed',
}
