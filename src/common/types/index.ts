
export interface PageMsg {
  action: string;
  ext_from: string;
  data: any;
  callbackId: number;
}

export interface BackMsg {
  msg: string;
  data: any;
}