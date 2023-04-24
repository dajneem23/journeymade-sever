export interface IRawTx {
  tx_hash: string,
  block_number: number,
  chain: string,
  chain_id: number,
  from: string,
  to: string,
  logs: any[],
  type?: string,
}
