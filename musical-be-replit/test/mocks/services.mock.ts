export class Servicemock {
  pattern: string;
  payload: any;

  public sendMessage(pattern: string, payload: any) {
    this.pattern = pattern;
    this.payload = payload;
  }
}
