export interface ObjectType {
  [key: string]: Record<string, string>;
}

export interface PathDataType {
  edges: object[];
  vertices: object[];
}

export interface OptionType {
  label: string;
  value: string | number;
}

export type Key = string | number;

export type Nullable<T> = T | null;

export type DataType<T> = T & { key: Key };
