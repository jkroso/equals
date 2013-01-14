exports = module.exports = deepEqual

// Get a local reference to Buffer. This prevents errors being thrown if we are in a browser
var Buffer = global.Buffer

/**
 * Values are considered equal if they could be swapped without consequence
 *
 *   equal(
 *     { a : [ 2, 3 ], b : [ 4 ] },
 *     { a : [ 2, 3 ], b : [ 4 ] }
 *   ) // => true
 *   
 *   equal(
 *     { x : 5, y : [6] },
 *     { x : 5, y : 6 }
 *   ) // => false
 *   
 * Some possible gotchas:
 * 
 * - null is __not__ equal to undefined
 * - NaN __is__ equal to NaN (normally not the case in JS)
 * - -0 is equal to +0
 * - Strings will __not__ coerce to numbers
 * - Non enumerable properties will not be checked. (They can't be)
 * - Arguments objects may differ on callee. Slice them first if you don't want to consider that
 */

function deepEqual (a, b, memos) {
	// All identical values are equivalent
	if (a === b) return true

	switch (typeof a) {
		case 'object': break
		
		case 'function': 
			// an identical 'prototype' property.
			if (typeof b !== 'function') return false 
			if (a.length !== b.length) return false
			// TODO: fix argument names problem 
			if (a.toString() !== b.toString()) return false
			if (!deepEqual(a.prototype, b.prototype)) return false
			// Functions can act as objects but perhaps we shouldn't compare on that basis
			return objEquiv(a, b)
		
		case 'number':
			// Check for NaN since NaN === NaN // => false
			// Note: we don't need to check a is NaN here since the very first check would 
			// have returned true if it was anything else
			return b !== b
		// string
		// boolean
		// undefined
		// must be false since otherwise the first check would of passed
		default: return false
	}

	// Null is considered an object
	if (a === null) return b === null
	// At this point we know that both a and b are objects

	// TODO: perhaps types should be relevant 
	// if (typeA !== typeB) return false

	// Handle objects which should be treated differently
	switch (a.constructor) {
		case Date:
			return b instanceof Date && +a === +b
		case RegExp:
			return a.toString() === b.toString()
		// Note: Buffers do not exist in browsers but that shouldn't cause problems easilly
		case Buffer:
			// Fast buffer equality check
			if (a.length != b.length) return false
			for (var i = 0; i < a.length; i++) {
				if (a[i] !== b[i]) return false
			}
			return true
	}

	// compare as a map of properties to values
	return objEquiv(a, b, memos)
}


/**
 * If you already know the two things you are comparing are Object instances
 * you can save processing time by calling this function directly. It doesn't 
 * matter what the objects contain internally as per the main function.
 *
 *   equal.object(
 *     {0:'first', 1: 'second'},
 *     ['first', 'second']
 *   ) // => true
 * 
 * For objects equivalence is determined by having the same number of 
 * enumerable properties, the same set of keys, and equivalent values for 
 * every key.
 * Note: this accounts for both named and indexed properties on Arrays.
 * 
 * @param {Object|Array} a
 * @param {Object|Array} b
 * @param {Array} [memos] uses internally to keep track of visited objects
 * @return {Boolean}
 */

exports.object = objEquiv
function objEquiv(a, b, memos) {
	// check if we have already compared a and b
	if (memos) {
		var i = memos.length, memo
		while (memo = memos[--i]) {
			if (memo[0] === a && memo[1] === b)
				return true
		}
	} else {
		memos = []
	}

	var ka = getEnumerableProperties(a)
	  , kb = getEnumerableProperties(b)

	i = ka.length
	// having the same number of properties
	if (i !== kb.length) return false

	//the same set of keys (although not necessarily the same order),
	ka.sort()
	kb.sort()
	// cheap key test
	while (i--) {
		if (ka[i] !== kb[i]) return false
	}

	// remember objects we have compared to guard against circular references
	memos.push([a, b])

	// equivalent values for every corresponding key, and
	// possibly expensive deep test
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

exports.all = allEqual
function allEqual () {
	var i = arguments.length
	while (i > 1) {
		if (!deepEqual(arguments[--i], arguments[--i])) return false
	}
	return true
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
		result.push(name)
	}
	return result
}