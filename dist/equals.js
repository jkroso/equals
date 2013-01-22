!function (context, definition) {
	if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
		module.exports = definition()
	} else if (typeof define === 'function' && typeof define.amd  === 'object') {
		define(definition)
	} else {
		context['equal'] = definition()
	}
}(this, function () {
	/**	
	 * Require the given path.	
	 *	
	 * @param {String} path   Full path to the required file	
	 * @param {String} parent The file which this call originated from	
	 * @return {Object} module.exports	
	 */	
		
	function require (path, parent){	
		// Determine the correct path	
		var fullpath = resolve(parent, path)	
		  , module = modules[fullpath]	
		
		if (module == null) throw new Error('failed to require "'+path+'" from '+parent)	
		
		// It hasn't been loaded before	
		if (typeof module === 'string') {	
			var code = module	
			module = {	
				src: code,	
				exports: {}	
			}	
			modules[fullpath] = module	
			Function(	
				'module',	
				'exports',	
				'require',	
				// Eval prevents the function wrapper being visible	
				// The source allows the browser to present this module as if it was a normal file	
				"eval("+JSON.stringify(code+'\n//@ sourceURL='+encodeURI(fullpath))+")"	
				// module	
			).call(module.exports, module, module.exports,	
				// Relative require function	
				function (rp) {	
					return require('.' === rp[0] ? join(dirname(fullpath), rp) : rp, fullpath)	
				}	
			)	
		}	
		return module.exports	
	}	
		
	/**	
	 * Figure out what the full path to the module is	
	 *	
	 * @param {String} base, the current directory	
	 * @param {String} path, what was inside the call to require	
	 * @return {String}	
	 * @api private	
	 */	
		
	function resolve (base, path) {	
		if (path.match(/^\/|(?:[a-zA-Z]+:)/)) {	
			return modules[path] && path	
				|| modules[path+'.js'] && path+'.js'	
				|| modules[path+'.json'] && path+'.json'	
				|| modules[path+'index.js'] && path+'index.js'	
				|| modules[path+'/index.js'] && path+'/index.js'	
		}	
		else {	
			while (true) {	
				for ( var i = 0, len = checks.length; i < len; i++ ) {	
					var res = checks[i](base, path, modules)	
					if (res != null) return res	
				}	
				if (base === '/') break	
				base = dirname(base)	
			}	
		}	
	}	
		
	function dirname (path) {	
		if (path[path.length - 1] === '/') path = path.slice(0, -1)	
		return path.split('/').slice(0,-1).join('/') || '/'	
	}	
		
	function normalize (path) {	
		var isAbsolute = path[0] === '/'	
		  , res = []	
		path = path.split('/')	
		
		for (var i = 0, len = path.length; i < len; i++) {	
			var seg = path[i]	
			if (seg === '..') res.pop()	
			else if (seg && seg !== '.') res.push(seg)	
		}	
		
		return (isAbsolute ? '/' : '') + res.join('/')	
	}	
		
	function join () {	
		return normalize(slice(arguments).filter(function(p) {	
			return p	
		}).join('/'))	
	}	
		
	function slice (args) {	
		return Array.prototype.slice.call(args)	
	}	
	
	function node_modules (dir, name, hash) {
		var match = nodeishVariants(dir, name).filter(function (p) {
			return !!hash[p]
		})[0]
	
		if (match) return match
	
		if (dir === '/' && hash['/node_modules/'+name+'.js'])
			// Note: we always add ".js" at the end since node won't interpret those as core modules
			return '/node_modules/'+name+'.js'
	}
	function nodeishVariants(dir, path) {
		// Is it a full path already
		if (path.match(/\.js(?:on)?$/)) {
			path = [path]
		}
		// A directory
		else if (path.match(/\/$/)) {
			path = [
				path+'index.js',
				path+'index.json',
				path+'package.json'
			]
		}
		// could be a directory or a file
		else {
			path = [
				path+'.js',
				path+'.json',
				path+'/index.js',
				path+'/index.json',
				path+'/package.json'
			]
		}
	
		return path.map(function (name) {
			return join(dir, 'node_modules', name)
		})
	}
	function components (dir, name, hash) {
		return componentVariants(dir, name).filter(function (p) {
			return !!hash[p]
		})[0]
	}
	function componentVariants(dir, path) {
		return [
			// Check for an alias...
			path,
			// ...and a real component
			path+'/component.json'
		].map(function (name) {
			return join(dir, 'components', name)
		})
	}
	var modules = {"/index.js":"exports = module.exports = deepEqual\n\n// Get a local reference to Buffer. This prevents errors being thrown if we are in a browser\nvar Buffer = global.Buffer\n\n/**\n * Values are considered equal if they could be swapped without consequence\n *\n *   equal(\n *     { a : [ 2, 3 ], b : [ 4 ] },\n *     { a : [ 2, 3 ], b : [ 4 ] }\n *   ) // => true\n *   \n *   equal(\n *     { x : 5, y : [6] },\n *     { x : 5, y : 6 }\n *   ) // => false\n *   \n * Some possible gotchas:\n * \n * - null is __not__ equal to undefined\n * - NaN __is__ equal to NaN (normally not the case in JS)\n * - -0 is equal to +0\n * - Strings will __not__ coerce to numbers\n * - Non enumerable properties will not be checked. (They can't be)\n * - Arguments objects may differ on callee. Slice them first if you don't want to consider that\n */\n\nfunction deepEqual (a, b, memos) {\n\t// All identical values are equivalent\n\tif (a === b) return true\n\n\tswitch (typeof a) {\n\t\tcase 'object': break\n\t\t\n\t\tcase 'function': \n\t\t\t// an identical 'prototype' property.\n\t\t\tif (typeof b !== 'function') return false \n\t\t\tif (a.length !== b.length) return false\n\t\t\t// TODO: fix argument names problem \n\t\t\tif (a.toString() !== b.toString()) return false\n\t\t\tif (!deepEqual(a.prototype, b.prototype)) return false\n\t\t\t// Functions can act as objects but perhaps we shouldn't compare on that basis\n\t\t\treturn objEquiv(a, b)\n\t\t\n\t\tcase 'number':\n\t\t\t// Check for NaN since NaN === NaN // => false\n\t\t\t// Note: we don't need to check a is NaN here since the very first check would \n\t\t\t// have returned true if it was anything else\n\t\t\treturn b !== b\n\t\t// string\n\t\t// boolean\n\t\t// undefined\n\t\t// must be false since otherwise the first check would of passed\n\t\tdefault: return false\n\t}\n\n\t// Null is considered an object\n\tif (a === null) return b === null\n\t// At this point we know that both a and b are objects\n\n\t// TODO: perhaps types should be relevant \n\t// if (typeA !== typeB) return false\n\n\t// Handle objects which should be treated differently\n\tswitch (a.constructor) {\n\t\tcase Date:\n\t\t\treturn b instanceof Date && +a === +b\n\t\tcase RegExp:\n\t\t\treturn a.toString() === b.toString()\n\t\t// Note: Buffers do not exist in browsers but that shouldn't cause problems easilly\n\t\tcase Buffer:\n\t\t\t// Fast buffer equality check\n\t\t\tif (a.length != b.length) return false\n\t\t\tfor (var i = 0; i < a.length; i++) {\n\t\t\t\tif (a[i] !== b[i]) return false\n\t\t\t}\n\t\t\treturn true\n\t}\n\n\t// compare as a map of properties to values\n\treturn objEquiv(a, b, memos)\n}\n\n\n/**\n * If you already know the two things you are comparing are Object instances\n * you can save processing time by calling this function directly. It doesn't \n * matter what the objects contain internally as per the main function.\n *\n *   equal.object(\n *     {0:'first', 1: 'second'},\n *     ['first', 'second']\n *   ) // => true\n * \n * For objects equivalence is determined by having the same number of \n * enumerable properties, the same set of keys, and equivalent values for \n * every key.\n * Note: this accounts for both named and indexed properties on Arrays.\n * \n * @param {Object|Array} a\n * @param {Object|Array} b\n * @param {Array} [memos] uses internally to keep track of visited objects\n * @return {Boolean}\n */\n\nexports.object = objEquiv\nfunction objEquiv(a, b, memos) {\n\t// check if we have already compared a and b\n\tif (memos) {\n\t\tvar i = memos.length, memo\n\t\twhile (memo = memos[--i]) {\n\t\t\tif (memo[0] === a && memo[1] === b)\n\t\t\t\treturn true\n\t\t}\n\t} else {\n\t\tmemos = []\n\t}\n\n\tvar ka = getEnumerableProperties(a)\n\t  , kb = getEnumerableProperties(b)\n\n\ti = ka.length\n\t// having the same number of properties\n\tif (i !== kb.length) return false\n\n\t//the same set of keys (although not necessarily the same order),\n\tka.sort()\n\tkb.sort()\n\t// cheap key test\n\twhile (i--) {\n\t\tif (ka[i] !== kb[i]) return false\n\t}\n\n\t// remember objects we have compared to guard against circular references\n\tmemos.push([a, b])\n\n\t// equivalent values for every corresponding key, and\n\t// possibly expensive deep test\n\ti = ka.length\n\twhile (i--) {\n\t\tvar key = ka[i]\n\t\tif (!deepEqual(a[key], b[key], memos)) return false\n\t}\n\n\treturn true\n}\n\n/**\n * Check that a sequence of values are equal\n *\n *   equal.all(1,1,1,1) // => true\n *\n * @param {Any} ... any number of args from 0 to memory blows up\n * @return {Boolean}\n */\n\nexports.all = allEqual\nfunction allEqual () {\n\tvar i = arguments.length\n\twhile (i > 1) {\n\t\tif (!deepEqual(arguments[--i], arguments[--i])) return false\n\t}\n\treturn true\n}\n\n/*!\n * Extract all enumerable keys whether on the object or its prototype chain\n *\n * @param {Object} object\n * @return {Array}\n */\n\nfunction getEnumerableProperties (object) {\n\tvar result = []\n\tfor (var name in object) {\n\t\tresult.push(name)\n\t}\n\treturn result\n}"}
	var checks = [node_modules, components]
	return require("/index.js")
})