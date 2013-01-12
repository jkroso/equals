var should = require('chai').should()
  , equal = require('../src')

describe('Object strucures', function () {
	it('when structures match', function () {
		equal(
			{ a : [ 2, 3 ], b : [ 4 ] },
			{ a : [ 2, 3 ], b : [ 4 ] }
		).should.be.true
	})

   it('when structures don\'t match', function () {
		equal(
			{ x : 5, y : [6] },
			{ x : 5, y : 6 }
		).should.be.false
   })

   it('should handle nested nulls', function () {
   	equal([ null, null, null ], [ null, null, null ]).should.be.true
   	equal([ null, null, null ], [ null, 'null', null ]).should.be.false
   })

   it('should handle nested NaNs', function () {
   	equal([ NaN, NaN, NaN ], [ NaN, NaN, NaN ]).should.be.true
   	equal([ NaN, NaN, NaN ], [ NaN, 'NaN', NaN ]).should.be.false
   })
})

describe('export.object(a,b)', function () {
	it('should work just the same as equal for objects', function () {
		equal.object(
			{ a : [ 2, 3 ], b : [ 4 ] },
			{ a : [ 2, 3 ], b : [ 4 ] }
		).should.be.true

		equal.object(
			{0:'first', 1: 'second'},
			['first', 'second']
		).should.be.true
	})
})

describe('Numbers', function () {
	it('should not coerce strings', function () {
		equal('1', 1).should.equal(false)
	})
	it('-0 should equal +0', function () {
		equal(-0, +0).should.be.true
	})
	describe('NaN', function () {
		it('should equal Nan', function () {
			equal(NaN, NaN).should.be.true
		})
		it('NaN should not equal undefined', function () {
			equal(NaN, undefined).should.be.false
		})
		it('NaN should not equal null', function () {
			equal(NaN, null).should.be.false
		})
		it('NaN should not equal empty string', function () {
			equal(NaN, '').should.be.false
		})
		it('should not equal zero', function () {
			equal(NaN, 0).should.be.false
		})
	})
})

describe('Strings', function () {
	it('should be case sensitive', function () {
		equal('hi', 'Hi').should.equal(false)
		equal('hi', 'hi').should.equal(true)
	})
	it('empty string should equal empty string', function () {
		equal('', "").should.be.true
	})
})

describe('undefined', function () {
	it('should equal only itself', function () {
		equal(undefined, null).should.be.false
		equal(undefined, '').should.be.false
		equal(undefined, 0).should.be.false
		equal(undefined, []).should.be.false
		equal(undefined, undefined).should.be.true
		equal(undefined, NaN).should.be.false
	})
})

describe('null', function () {
	it('should equal only itself', function () {
		equal(null, undefined).should.be.false
		equal(null, '').should.be.false
		equal(null, 0).should.be.false
		equal(null, []).should.be.false
		equal(null, null).should.be.true
		equal(null, NaN).should.be.false
	})
})

describe('Cyclic structures', function () {
	it('should not go into an infinite loop', function () {
		var a = {}
		var b = {}
		a.self = a
		b.self = b
		equal(a, b).should.equal(true)
	})
	it('should handle functions', function () {
		equal.object(function () {}, function () {}).should.be.true
	})
})

describe('functions', function () {
	it('should fail if they have different names', function () {
		equal(function a() {}, function b() {}).should.be.false
	})
	it('should pass if they are both anonamous', function () {
		equal(function () {}, function () {}).should.be.true
	})
	it.skip('handle the case where they have different argument names', function () {
		equal(function (b) {return b}, function (a) {return a}).should.be.true
	})
	it('should compare them as objects', function () {
		var a = function () {}
		var b = function () {}
		a.title = 'sometitle'
		equal(a, b).should.be.false
	})
	it('should be true if they have equal methods', function () {
		equal(
			{
				noop: function () {}
			},
			{
				noop: function () {}
			}
		).should.be.true
	})
	it('should be false if they have different methods', function () {
		equal(
			{
				noop: function (a) {}
			},
			{
				noop: function () {}
			}
		).should.be.false
	})
})

describe('equal.all(...)', function () {
	it('should handle no values', function () {
		equal.all().should.equal(true)
	})
	it('should handle one value', function () {
		equal.all({}).should.equal(true)
	})
	it('should handle many values', function () {
		var vals = []
		for (var i = 0; i < 1000; i++) {
			vals.push({1:'I', 2:'am', 3:'equal'})
		}
		equal.all.apply(null, vals).should.equal(true)
	})
})

if (global.Buffer) {
	describe('Buffer', function () {
		it('should pass if they contain the same bytes', function () {
			equal(new Buffer('abc'), new Buffer('abc')).should.be.true
		})
		it('should fail otherwise', function () {
			equal(new Buffer('a'), new Buffer('b')).should.be.false
		})
	})
}
