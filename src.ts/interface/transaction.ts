export interface PrevOut {
  hash: string;
  index: number;
}

export interface Input {
  prevout: PrevOut;
  coin: {
    value: number;
  };
}

export interface Output {
  value: number;
  script: string;
  address: string;
}

export interface Transaction {
  inputs: Input[];
  outputs: Output[];
}
