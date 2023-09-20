export type TRow = Record<string, any>;

export type TRows = Array<TRow>;

export type TRowsArray = Array<TRows>;

export type Order = "ASC" | "DESC";

type TComparingField<T extends TRow> = { field: keyof T; order?: Order };

export type TComparingFields<T extends TRow> = Array<TComparingField<T>>;
