export class OylTransactionError extends Error {
  public successTxIds: string[] // The IDs of the transactions that were successful before the error occurred

  constructor(message: string, successTxIds?: string[]) {
    super(message)
    this.name = 'OylTransactionError'
    this.successTxIds = successTxIds || []
  }
}
