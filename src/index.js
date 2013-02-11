exports = module.exports = deepEqual
exports.object = objEquiv
exports.all = allEqual

/*!
 * Get a local reference to Buffer since otherwise if we are in a browser 
 * and the lookup goes all the way to the top without a hit we crash
 */

var Buffer = (function(){return this}()).Buffer || {}

/**
 * Primitive types are equal if they represent the same value. 
 * While composite types, i.e. Objects and Arrays, are considered
 * equal if their structure is the same, i.e. they have the same set of 
 * properties, and the primitive type bound to each property has the 
 * same value. Composite structures can be nested preactically as deep 
 * as you like and circular references are fine
 *
 * Same structure:
 *   equal(
 *     { a : [ 2, 3 ], b : [ 4 ] },
 *     { a : [ 2, 3 ], b : [ 4 ] }
 *   ) // => true
 * 
 * Different Structure:
 *   equal(
 *     { x : 5, y : [6] },
 *     { x : 5, y : 6 }
 *   ) // => false
 *
 * Same structure, different values:
 *   equal(
 *     { a: [ 1, 2 ], b : [ 4 ]},
 *     { a: [ 2, 3 ], b : [ 4 ]}
 *   ) // => false
 *
 * Same values:
 *   equal(new Date(0), new Date(0)) // => true
 *   
 * Some possible gotchas:
 * - null is __not__ equal to undefined  
 * - NaN __is__ equal to NaN (normally not the case in JS)  
 * - -0 is equal to +0  
 * - Strings will __not__ coerce to numbers  
 * - Non enumerable properties will not be checked. (They can't be) Though 
 *  special exceptions are made for `length` and `constructor` properties
 *  since many common patterns make these normally non-enumerable properties 
 *  enumerable  
 * - Arguments objects may differ on callee though this property is 
 *  non-enumerable so will not be considered. Usually this is the desired 
 *  behavior though so no special case has been made for it.  
 */

function deepEqual (a, b, memos) {
	// All identical values are equivalent
	if (a === b) return true
	// Null and undefined are proper primitives so have no constructor
	if (a === null || a === undefined) return false

	// I'm using the constructor to figure out their type since `typeof`
	// is unreliable for primitives e.g `typeof new Number === 'object'`
	switch (a.constructor) {
		case Number:
			// Check for NaN since NaN === NaN // => false
			// Note: we don't need to check a is NaN here since the very first check would 
			// have returned true if it was anything else
			return b !== b
		case Function: 
			if (typeof b !== 'function') return false 
			if (a.toString() !== b.toString()) return false
			// Functions can act as objects and often have class methods
			// bound to them so we compare them as Objects also
			return objEquiv(a, b) 
				// `prototype` is non enumerable so needs to be compared seperately
				&& a.prototype
				&& b.prototype
				&& objEquiv(a.prototype, b.prototype)
		case Date:
			return b instanceof Date && +a === +b
		case RegExp:
			return b instanceof RegExp && a.toString() === b.toString()
		case String:
		case Boolean:
			return false
		case Buffer:
			if (!(b instanceof Buffer)) return false
			// reusing the `memos` var here as an index
			if ((memos = a.length) !== b.length) return false
			while (memos--) {
				if (a[memos] !== b[memos]) return false
			}
			return true
		default:
			return objEquiv(a, b, memos)
	}
}


/**
 * If you already know your values are non-primitive you can save 
 * processing time by calling `equal.object` directly.
 *
 *   equals.object(
 *     {0:'first', 1: 'second', length:2},
 *     ['first', 'second']
 *   ) // => true
 * 
 * For objects equivalence is determined by having the same number of 
 * enumerable properties, the same set of keys, and equivalent values for 
 * every key.
 * 
 * Note: `length` is always checked even if it isn't enumerable while 
 * `constructor` is never checked:
 * 
 *   equals([], {length:0}) // => true`
 *   equals([], {}) // => false`
 *
 * Also note that inherited properties are compared
 * 
 * @param {Object|Array} a
 * @param {Object|Array} b
 * @param {Array} [memos] used internally to keep track of visited objects
 * @return {Boolean}
 */

function objEquiv(a, b, memos) {
	// length is a special case we care about even if it isn't enumerable
	if (a.length !== b.length) return false
	// check if we have already compared a and b
	if (memos) {
		var i = memos.length, memo
		while (memo = memos[--i]) {
			if (memo[0] === a && memo[1] === b) return true
		}
	} else {
		memos = []
	}

	var ka = getEnumerableProperties(a)
	  , kb = getEnumerableProperties(b)

	// having the same number of properties
	if ((i = ka.length) !== kb.length) return false

	//the same set of keys (although not necessarily the same order)
	ka.sort()
	kb.sort()
	// cheap key test
	while (i--) {
		if (ka[i] !== kb[i]) return false
	}

	// remember objects we have compared to guard against circular references
	memos.push([a, b])

	// iterate again this time doing a thorough check
	i = ka.length
	while (i--) {
		var key = ka[i]
		if (!deepEqual(a[key], b[key], memos)) return false
	}

	return true
}

/**
 * Check that a sequence of values are equal
 *
 *   equal.all(1,1,1,1) // => true
 *
 * @param {Any} ... any number of args from 0 to memory blows up
 * @return {Boolean}
 */

function allEqual () {
	var i = arguments.length
	while (i > 1) {
		if (!deepEqual(arguments[--i], arguments[--i])) return false
	}
	return true
}

/*!
 * A list of properties which are sometimes enumerable
 * so should be ignored
 */

var ignore = {
	// because `fn.prototype = {}` is a common pattern
	constructor: true,
	// because `[]` should be considered equivalent to `{length:0}`
	length: true
}

/*!
 * Extract all enumerable keys whether on the object or its prototype chain
 *
 * @param {Object} object
 * @return {Array}
 */

function getEnumerableProperties (object) {
	var result = []
	for (var name in object) {
		if (!ignore[name]) result.push(name)
	}
	return result
}
