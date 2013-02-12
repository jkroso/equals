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
  - [make()](#make)

## deepEqual()

  Primitive types are equal if they represent the same value. 
  While composite types, i.e. Objects and Arrays, are considered
  equal if their structure is the same, i.e. they have the same set of 
  properties, and the primitive type bound to each property has the 
  same value. Composite structures can be nested preactically as deep 
  as you like and circular references are fine
  
  Same structure:
```js
equal(
  { a : [ 2, 3 ], b : [ 4 ] },
  { a : [ 2, 3 ], b : [ 4 ] }
) // => true
```

  
  Different Structure:
```js
equal(
  { x : 5, y : [6] },
  { x : 5, y : 6 }
) // => false
```

  
  Same structure, different values:
```js
equal(
  { a: [ 1, 2 ], b : [ 4 ]},
  { a: [ 2, 3 ], b : [ 4 ]}
) // => false
```

  
  Same values:
```js
equal(new Date(0), new Date(0)) // => true
```

    
  Some possible gotchas:
  - null is __not__ equal to undefined  
  - NaN __is__ equal to NaN (normally not the case in JS)  
  - -0 is equal to +0  
  - Strings will __not__ coerce to numbers  
  - Non enumerable properties will not be checked. (They can't be) Though 
   special exceptions are made for `length` and `constructor` properties
   since many common patterns make these normally non-enumerable properties 
   enumerable  
  - Arguments objects may differ on callee though this property is 
   non-enumerable so will not be considered. Usually this is the desired 
   behavior though so no special case has been made for it.

## objEquiv()

  If you already know your values are non-primitive you can save 
  processing time by calling `equal.object` directly.
  
```js
equals.object(
  {0:'first', 1: 'second', length:2},
  ['first', 'second']
) // => true
```

  
  For objects equivalence is determined by having the same number of 
  enumerable properties, the same set of keys, and equivalent values for 
  every key.
  
  Note: `length` is always checked even if it isn't enumerable while 
  `constructor` is never checked:
  
```js
equals([], {length:0}) // => true`
equals([], {}) // => false`
```

  
  Also note that inherited properties are compared

## allEqual()

  Check that a sequence of values are equal
  
```js
equal.all(1,1,1,1) // => true
```

## make()

  Create a custom version of this module
  properties matching `regex` will be excluded

## Contributing
As with all my work this is both a work in progress and a thought in progress. Feel free to chip in in any way you can. Optimisations are welcome so long as they are supported with benchmarks.

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
