# record-comparison

> A TypeScript tool to compare array quickly and you can do something when matching, for browsers and NodeJS servers
>
> Via _Janden Ma_
>
> MIT LICENCE



[中文文档（Simplified Chinese）](https://github.com/rinxun/record-comparison/blob/master/README_zh.md)

### First of all

If you use this tool to compare arrays, you need to specify one of those as the master array, so others are detail array(s). 

When you call `compare()` function, this tool will generate a master pointer for master array and detail pointer for detail array. 

If master item and detail item have finished matching, you need to call `detailMoveNext()`  to move detail pointer to next detail item for next comparison.

If master item and detail item can't matched, you need to call `masterMoveNext()`  to move master pointer to next master item for next comparison.



### Installation

- npm

  ```bash
  npm install @rinxun/record-comparison -S 
  ```

- yarn

  ```bash
  yarn add @rinxun/record-comparison --save
  ```



### Quick Example

- Single comparison 

  ```javascript
  // if NodeJS server
  const RecordComparison = require("@rinxun/record-comparison");
  // if browsers
  // import RecordComparison from "@rinxun/record-comparison";
  
  const rc = new RecordComparison(
    [
      { name: "Lucy", age: 28, amount: 10 },
      { name: "Yuki", age: 20, amount: 20 },
      { name: "Tommy", age: 26, amount: 30 },
      { name: "Ben", age: 29, amount: 40 }
    ],
    [
      { name: "Tommy", age: 28, amount: 109 },
      { name: "Joey", age: 23, amount: 200 },
      { name: "Lucy", age: 27, amount: 101 },
      { name: "Andy", age: 30, amount: 38 },
      { name: "Yuki", age: 22, amount: 59 },
      { name: "Ben", age: 29, amount: 8 }
    ]
  );
  
  rc.masterFields = [{ field: "name", order: "DESC" }];
  rc.detailFields = [{ field: "name", order: "DESC" }];
  
  while (rc.masterEof) {
    while (rc.compare()) {
      rc.currentRow["amount"] = rc.currentRow["amount"] + rc.detailRow["amount"];
      rc.detailMoveNext();
    }
    rc.masterMoveNext();
  }
  
  console.log(rc.master);
  /**
  [
    { name: 'Yuki', age: 20, amount: 79 },
    { name: 'Tommy', age: 26, amount: 139 },
    { name: 'Lucy', age: 28, amount: 111 },
    { name: 'Ben', age: 29, amount: 48 }
  ]
  **/
  ```

- Multiple comparison

  ```javascript
  // if NodeJS server
  const RecordComparison = require("@rinxun/record-comparison");
  // if browsers
  // import RecordComparison from "@rinxun/record-comparison";
  
  const rc = new RecordComparison(
    [
      { name: "Lucy", age: 28, amount: 10 },
      { name: "Yuki", age: 20, amount: 20 },
      { name: "Tommy", age: 26, amount: 30 },
      { name: "Ben", age: 29, amount: 40 }
    ],
    [
      [
      	{ name: "Tommy", age: 28, amount: 109 },
      	{ name: "Joey", age: 23, amount: 200 },
      	{ name: "Lucy", age: 27, amount: 101 },
      	{ name: "Andy", age: 30, amount: 38 },
      	{ name: "Yuki", age: 22, amount: 59 },
      	{ name: "Ben", age: 29, amount: 8 }
      ],
      [
      	{ name: "Joey", age: 23, amount: 30 },
      	{ name: "Yuki", age: 22, amount: 12 },
      	{ name: "Lucy", age: 27, amount: 20 },
      ]
    ]
  );
  
  rc.masterFields = [{ field: "name", order: "DESC" }];
  rc.detailFieldsArr = [
    [{ field: "name", order: "DESC" }],
    [{ field: "name", order: "DESC" }]
  ];
  
  while (rc.masterEof) {
    while (rc.compare(0)) {
      rc.currentRow["amount"] = rc.currentRow["amount"] + rc.detailRow["amount"];
      rc.detailMoveNext(0);
    }
    while (rc.compare(1)) {
      rc.currentRow["amount"] = rc.currentRow["amount"] - rc.detailRow["amount"];
      rc.detailMoveNext(1);
    }
    rc.masterMoveNext();
  }
  
  console.log(rc.master);
  /**
  [
    { name: 'Yuki', age: 20, amount: 67 },
    { name: 'Tommy', age: 26, amount: 139 },
    { name: 'Lucy', age: 28, amount: 91 },
    { name: 'Ben', age: 29, amount: 48 }
  ]
  **/
  ```



### Usage

1. Import library package

   ```javascript
   import RecordComparison from '@rinxun/record-comparison'
   // or
   const RecordComparison = require('@rinxun/record-comparison')
   ```

2. Instantiate `RecordComparison`

   ```javascript
   const rc = new RecordComparison(masterArray, detailArray); 
   ```

   - masterArray:
     - The master array, which will be operated when comparing
     - Type: `Array<Record<string, any>>`
   - detailArray:
     - The detail array, as references when comparing
     - Type: 
       - Single comparison: `Array<Record<string, any>>`
       - Multiple comparison: `Array<Array<Record<string, any>>>`

3. API

   - master
     - get the master array
     - Type: `Array<Record<string, any>>`
   - details
     - get the detail array
     - Type: 
       - Single comparison: `Array<Record<string, any>>`
       - Multiple comparison: `Array<Array<Record<string, any>>>`
   - currentRow
     - get the current item in master array
     - Type: `Record<string, any>`
   - detailRow
     - get the current item in detail array, if multiple comparison, will return that one which is comparing (according to the `index` parameter in `compare()`)
     - Type: `Record<string, any>`
   - masterFields
     - the sort fields for master array, should be included in the item of master array, you need to set it
     - Type: `Array<{ field: string, order?: 'ASC' | 'DESC' }> | null`
     - `field` is the field name
     - `order` is the ordering rule, default  `'ASC'` for `ascending` 
   - detailFields
     - the sort fields for detail array, should be included in the item of detail array, you need to set it for single comparison
     - Type: `Array<{ field: string, order?: 'ASC' | 'DESC' }> | null`
     - `field` is the field name
     - `order` is the ordering rule, default  `'ASC'` for `ascending` 
   - detailFieldsArr
     - the sort fields for detail arrays, should be included in the item of detail arrays, you need to set it for multiple comparison
     - Type: `Array<Array<{ field: string; order?: 'ASC' | 'DESC' }>> | null`
     - `field` is the field name
     - `order` is the ordering rule, default  `'ASC'` for `ascending` 
   - masterEof
     - if book mark is greater than the length of master array, return `false` that means finish comparing
     - Type: `boolean` 
   - isSorted
     - if you have sorted arrays in outer function, you should set it `true` to ensure the performance
   - compare(index?: number)
     - the core function for comparison
     - Type: `Function`
     - Parameter:
       - index: `number`, for multiple comparison, default `0`
     - Returns
       - `True` for matching, or `False` 
   - getMasterBookMark()
     - get the current book mark for master array, that means the index of the master pointer right now (start from `0`).
     - Returns: `number`
   - getDetailBookMark(index?: number)
     - get the current book mark for detail array, that means the index of the detail pointer right now (start from `0`).
     - Parameter:
       - index: `number`, for multiple comparison, default `0`
     - Returns: `number`
   - masterMoveNext()
     - if master item and detail item can't be matched, you need to move master pointer to next item
   - detailMoveNext(index?: number)
     - if master item and detail item have finished matching, you need to move detail pointer to next item for next comparison
     - Parameter:
       - index: `number`, for multiple comparison, default `0`



<h2>Changelog</h2>

If you have recently updated, please read the [changelog](https://github.com/rinxun/record-comparison/releases) for details of what has changed.
