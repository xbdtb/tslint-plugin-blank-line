# tslint-plugin-blank-line
require a blank line before code blocks

tslint.json
```javascript
{
  ...,
  "extends": [
    ...,
    "blank-line",
    ...
  ],
  ...,
  rules: [
    ...,
    "blank-line": true,
    ...
  ],
  ...
 }
```

the following code

```javascript
const a = 1;
const b = 2; // comment 1
// coment 2
function f1() {
  console.log('');
}
function f2() {
  console.log('');
}
class A {
  constructor() {
  }
  a = 1;
  b = 2;
  f1() {}
  f2() {}
  f3() {
    console.log('');
  }
  f4() {
    console.log('');
  }
  // some comments
  // some comments
  f5() {
    console.log('');
  }
}
```
will be fixed to (tslint --fix)
```javascript
const a = 1;
const b = 2; // comment 1

// coment 2
function f1() {
  console.log('');
}

function f2() {
  console.log('');
}

class A {
  constructor() {
  }

  a = 1;
  b = 2;

  f1() {}
  f2() {}

  f3() {
    console.log('');
  }

  f4() {
    console.log('');
  }

  // some comments
  // some comments
  f5() {
    console.log('');
  }
}
```
## Options
### Ignore import statements
```
...,
  rules: [
    ...,
    "blank-line": [true, "ignore-imports"],
    ...
  ],
  ...
  
```
This option disables the rule in import statements. This is helpful if you have multiline named import statements e.g.
```
import { A } from "libA";
import { 
  firstLongName,
  secondEvenLongerName,
  thirdNameThatIsTheLongest
} from "libB";
import { C } from "libC";
```
By default this is flagged as rule violation.