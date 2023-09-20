import type { TRow, TRows, Order, TComparingFields } from "./types";

export function isNil(val: any) {
  return val === null || val === undefined;
}

export function isEmpty(val: string | Array<any>) {
  return val.length === 0;
}

function isObject(val: any) {
  return val.constructor === Object;
}

function isObjectArray(val: Array<any>) {
  return val.filter(v => isObject(v)).length === val.length;
}

export function verifyRows(
  masterArray: TRows,
  detailArray: Array<TRows> | TRows
): boolean {
  if (!Array.isArray(masterArray)) {
    throw new Error('"masterArray" is invalid');
  } else if (!isObjectArray(masterArray)) {
    throw new Error('"masterArray" is invalid');
  }
  if (!Array.isArray(detailArray)) {
    throw new Error('"detailArray" is invalid');
  }
  if (detailArray.length > 0 && Array.isArray(detailArray[0])) {
    detailArray.forEach(a => {
      if (!isObjectArray(a as TRows)) {
        throw new Error('"detailArray" is invalid');
      }
    });
  } else if (!isObjectArray(detailArray)) {
    throw new Error('"detailArray" is invalid');
  }
  return true;
}

export function verifyFields<T extends TRow>(
  masterFields: TComparingFields<T>,
  detailFields: TComparingFields<TRow>
): boolean {
  for (let i = 0, l = masterFields.length; i < l; i += 1) {
    const masterField = masterFields[i];
    const detailField = detailFields[i];
    const { field: masterFieldName, order: masterOrder = "ASC" } = masterField;
    const { field: detailFieldName, order: detailOrder = "ASC" } = detailField;
    if (masterOrder !== detailOrder) {
      throw Error(
        `order is different between ${
          masterFieldName as string
        } and ${detailFieldName}`
      );
    }
  }
  return true;
}

export function SortByProps<T extends TRow>(
  item1: T,
  item2: T,
  props: TComparingFields<T>
): 0 | 1 | -1 {
  const cps: Array<0 | 1 | -1> = []; // store results
  let asc = true; // order
  // if there is not any field, return original items
  if (props.length === 0) {
    cps.push(0);
  } else {
    for (let i = 0, l = props.length; i < l; i += 1) {
      const prop = props[i];
      const { field, order = "ASC" } = prop;
      asc = order === "ASC";
      const a = item1[field];
      const b = item2[field];
      // if type of items is different, skipped
      if (typeof a !== typeof b) {
        cps.push(0);
      }
      // if type of items is number or string
      else if (typeof a === "number" && typeof b === "number") {
        if (a < b) {
          cps.push(asc ? -1 : 1);
        } else if (a > b) {
          cps.push(asc ? 1 : -1);
        } else {
          cps.push(0);
        }
      } else if (typeof a === "string" && typeof b === "string") {
        let aTemp: string | number = a.toUpperCase();
        let bTemp: string | number = b.toUpperCase();
        if (!Number.isNaN(Number(a)) && !Number.isNaN(Number(b))) {
          aTemp = Number(a);
          bTemp = Number(b);
        }
        if (aTemp < bTemp) {
          cps.push(asc ? -1 : 1);
        } else if (aTemp > bTemp) {
          cps.push(asc ? 1 : -1);
        } else {
          cps.push(0);
        }
      } else {
        cps.push(0);
      }
    }
  }
  for (let j = 0, l = cps.length; j < l; j += 1) {
    if (cps[j] === 1 || cps[j] === -1 || cps[j] === 0) {
      return cps[j];
    } else {
      return 0;
    }
  }
  return 0;
}

export function SortArrayByFields<T extends TRow>(
  arr: Array<T>,
  fields: TComparingFields<T>
): Array<T> {
  return arr.sort((a, b) => SortByProps(a, b, fields));
}
