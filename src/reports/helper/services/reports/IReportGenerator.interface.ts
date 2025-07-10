export interface Report {
  uniqueId: string;
  type: string;
  data: any;
}

export interface GenericReport<T> extends Report {
  type: 'generic';
  data: T;
}

export interface ListReport<T> extends Report {
  type: 'list';
  data: T[];
}

export interface GroupedReport<T> extends Report {
  type: 'grouped';
  data: {
    groups: T[];
  };
}

export interface IReportGenerator<T extends Report> {
  get uniqueId(): string;
  get name(): string;
  get type(): T['type'];
  create(...args: any[]): this;
  generateReport(): Promise<T>;
}
