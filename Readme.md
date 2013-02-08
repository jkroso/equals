# equals

Check if two values are equivalent. This is a deep equivalence check so if an object has other objects on it properties they must also be equivalent in order for the overall comparison to hold. 

## Getting Started

With component(1) 

`component install jkroso/equals --save`

In Node.js 

`npm install equals --save`

A pre-built browser version is also [available](https://raw.github.com/jkroso/equals/master/dist/equals.min.js). It exports the global variable equal. 

## API

```javascript
var equal = require('equals')
```
  - [deepEqual()](#deepequal)
  - [objEquiv()](#objequiv)
  - [allEqual()](#allequal)

## deepEqual()

  Values are considered equal if they could be swapped without consequence
  
```js
equal(
  { a : [ 2, 3 ], b : [ 4 ] },
  { a : [ 2, 3 ], b : [ 4 ] }
) // => true
```

    
```js
equal(
  { x : 5, y : [6] },
  { x : 5, y : 6 }
) // => false
```

    
  Some possible gotchas:
  
  - null is __not__ equal to undefined
  - NaN __is__ equal to NaN (normally not the case in JS)
  - -0 is equal to +0
  - Strings will __not__ coerce to numbers
  - Non enumerable properties will not be checked. (They can't be)
  - Arguments objects may differ on callee. Slice them first if you don't want to consider that

## objEquiv()

  If you already know the two things you are non-primitive you can save 
  processing time by calling this function directly.
  
```js
equals.object(
  {0:'first', 1: 'second', length:2},
  ['first', 'second']
) // => true
```

  
  For objects equivalence is determined by having the same number of 
  enumerable properties, the same set of keys, and equivalent values for 
  every key.
  Note: the indexed properties of Arrays are enumerable therefore their
  values will be compared. Also `length` is always considered enumerable
  for the purpose of this test therefore:
  
```js
equals([], {length:0}) // => true`
equals([], {}) // => false`
```

## allEqual()

  Check that a sequence of values are equal
  
```js
equal.all(1,1,1,1) // => true
```


## Contributing
As with all my work this is both a work in progress and a thought in progress. Feel free to chip in in any way you can.

## Release History
_(Nothing yet)_

## Credit
A large part of this code was taken from node's assert module

## License
Copyright (c) 2012 Jakeb Rosoman

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
