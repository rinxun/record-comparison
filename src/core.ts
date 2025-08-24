import { checkEqual } from "@rinxun/check-equal";
import {
  isNil,
  verifyRows,
  verifyFields,
  SortArrayByFields,
} from "./utils";
import type { TComparingFields, TRow, TRows, TRowsArray } from "./types";

class RecordComparison<T extends TRow> {
  //#region constructor
  constructor(masterArray: Array<T>, detailArray: TRowsArray | TRows) {
    if (isNil(masterArray) || isNil(detailArray)) {
      throw new Error(
        `"masterArray" or "detailArray" cannot be null or undefined`
      );
    }

    if (verifyRows(masterArray, detailArray)) {
      const multiple: boolean =
        detailArray.length > 0 && Array.isArray(detailArray[0]);
      this._single = !multiple;
      this._master = masterArray;
      this._details = detailArray;
      this._masterEof = this._masterBookMark >= masterArray.length;
      this._masterBookMark = 0;
      this._detailBookMarks = !multiple ? [0] : detailArray.map(() => 0);
      this._currentRow = masterArray[0];
    }
  }
  //#endregion

  //#region private properties
  private _single: boolean = true;
  /** if you have sorted arrays in outer function, you should set it `true` to ensure the performance */
  private _isSorted: boolean = false;
  private _masterEof: boolean = false;
  private _master: Array<T> = [];
  private _details: TRowsArray | TRows = [];
  private _currentRow: T | null = null;
  private _detailRow: TRow | null = null;
  private _masterFields: TComparingFields<T> = [];
  private _detailFields: TComparingFields<TRow> = [];
  private _detailFieldsArr: Array<TComparingFields<TRow>> = [];
  private _masterBookMark: number = 0;
  private _detailBookMarks: Array<number> = [0];
  //#endregion

  private processComparing(
    masterRow: T,
    detailRow: TRow,
    masterFields: TComparingFields<T>,
    detailFields: TComparingFields<TRow>
  ): 0 | 1 | -1 {
    let ret: 0 | 1 | -1 = 0;
    masterFields.map((fields, index) => {
      const { field: masterField, order } = fields;
      const { field: detailField } = detailFields[index];

      if (verifyFields(masterFields, detailFields)) {
        const res = checkEqual(masterRow[masterField], detailRow[detailField]);
        if (!res) {
          if (masterRow[masterField] === detailRow[detailField]) {
            ret = 0;
          } else if (masterRow[masterField] > detailRow[detailField]) {
            ret = order === "ASC" ? 1 : -1;
          } else {
            ret = order === "ASC" ? -1 : 1;
          }
        }
      }
    });
    return ret;
  }

  //#region getters and setters
  /** if the `masterBookMark` is greater than the length of the master array, return `false` that means finish comparing */
  get masterEof() {
    return this._masterEof;
  }

  get master() {
    return this._master;
  }

  get details() {
    return this._details;
  }

  get currentRow() {
    return this._currentRow;
  }

  get detailRow() {
    return this._detailRow;
  }

  /** if you have sorted arrays before instantiating the class, you should set it to `true` to improve the performance */
  get isSorted() {
    return this._isSorted;
  }

  set isSorted(sorted: boolean) {
    this._isSorted = sorted;
  }

  get masterFields() {
    return this._masterFields;
  }

  set masterFields(arr: TComparingFields<T>) {
    this._masterFields = arr;
  }

  get detailFields() {
    return this._detailFields;
  }

  set detailFields(arr: TComparingFields<TRow>) {
    this._detailFields = arr;
  }

  get detailFieldsArr() {
    return this._detailFieldsArr;
  }

  set detailFieldsArr(arr: Array<TComparingFields<TRow>>) {
    this._detailFieldsArr = arr;
  }
  //#endregion

  //#region public methods
  public getMasterBookMark(): number {
    return this._masterBookMark;
  }

  public getDetailBookMark(index?: number): number | undefined {
    return this._detailBookMarks[index || 0];
  }

  public masterMoveNext(): void {
    this._masterBookMark += 1;
    this._masterEof = this._masterBookMark >= this._master.length;
    if (!this._masterEof) {
      this._currentRow = this._master[this._masterBookMark];
    } else {
      this._currentRow = null;
    }
  }

  public detailMoveNext(index?: number): void {
    this._detailBookMarks[index || 0] += 1;
    this._detailRow = this._single
      ? this._details[this._detailBookMarks[index || 0]]
      : (this._details as TRowsArray)[index || 0][
          this._detailBookMarks[index || 0]
        ];
  }

  public compare(index?: number): boolean {
    const _index: number = index || 0;
    if (
      this._detailBookMarks[_index] >=
      (this._single ? this._details.length : this._details[_index].length)
    ) {
      return false;
    }
    if (!this._isSorted) {
      this._master = SortArrayByFields(this._master, this._masterFields);
      if (this._single) {
        this._details = SortArrayByFields(this._details, this._detailFields);
      } else {
        this._details[_index] = SortArrayByFields(
          (this._details as TRowsArray)[_index],
          this.detailFieldsArr[_index]
        );
      }
    }
    this._currentRow = this._master[this._masterBookMark];
    this._detailRow = this._single
      ? this._details[this._detailBookMarks[_index]]
      : (this._details as TRowsArray)[_index][this._detailBookMarks[_index]];
    const res = this.processComparing(
      this._currentRow,
      this._detailRow,
      this._masterFields,
      this._single ? this._detailFields : this._detailFieldsArr[_index]
    );
    if (res === 1) {
      this._detailBookMarks[_index] += 1;
      return this.compare(_index);
    } else {
      return res === 0;
    }
  }
  //#endregion
}

export default RecordComparison;
