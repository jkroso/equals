import eql from '..'

describe('Object strucures', () => {
  it('when structures match', () => {
    eql(
      { a : [ 2, 3 ], b : [ 4 ] },
      { a : [ 2, 3 ], b : [ 4 ] }
    ).should.be.true
  })

   it('when structures don\'t match', () => {
    eql(
      { x : 5, y : [6] },
      { x : 5, y : 6 }
    ).should.be.false
   })

   it('should handle nested nulls', () => {
    eql([ null, null, null ], [ null, null, null ]).should.be.true
    eql([ null, null, null ], [ null, 'null', null ]).should.be.false
   })

   it('should handle nested NaNs', () => {
    eql([ NaN, NaN, NaN ], [ NaN, NaN, NaN ]).should.be.true
    eql([ NaN, NaN, NaN ], [ NaN, 'NaN', NaN ]).should.be.false
   })

   it('custom equal methods', function(){
     eql({equal: function(){ return true }}, {}).should.be.true
     eql({equal: function(){ return false }}, {}).should.be.false
   })
})

describe('Comparing arguments', () => {
  var a = (function a(a,b,c) {return arguments}(1,2,3))
  var b = (function b(a,b,c) {return arguments}(1,2,3))
  var c = (function c(a,b,c) {return arguments}(2,2,3))

  it('should not consider the callee', () => {
    eql(a,b).should.be.true
    eql(a,c).should.be.false
  })

  it('should be comparable to an Array', () => {
    eql(a,[1,2,3]).should.be.true
    eql(a,[1,2,4]).should.be.false
    eql(a,[1,2]).should.be.false
  })

  it('should be comparable to an Object', () => {
    eql(a, {0:1,1:2,2:3,length:3}).should.be.true
    eql(a, {0:1,1:2,2:3,length:4}).should.be.false
    eql(a, {0:1,1:2,2:4,length:3}).should.be.false
    eql(a, {0:1,1:2,length:2}).should.be.false
  }).skip()
})

describe('Numbers', () => {
  it('should not coerce strings', () => {
    eql('1', 1).should.equal(false)
  })
  it('-0 should equal +0', () => {
    eql(-0, +0).should.be.true
  })
  describe('NaN', () => {
    it('should equal Nan', () => {
      eql(NaN, NaN).should.be.true
    })
    it('NaN should not equal undefined', () => {
      eql(NaN, undefined).should.be.false
    })
    it('NaN should not equal null', () => {
      eql(NaN, null).should.be.false
    })
    it('NaN should not equal empty string', () => {
      eql(NaN, '').should.be.false
    })
    it('should not equal zero', () => {
      eql(NaN, 0).should.be.false
    })
  })
})

describe('Strings', () => {
  it('should be case sensitive', () => {
    eql('hi', 'Hi').should.equal(false)
    eql('hi', 'hi').should.equal(true)
  })

  it('empty string should equal empty string', () => {
    eql('', "").should.be.true
  })
})

describe('undefined', () => {
  it('should equal only itself', () => {
    eql(undefined, null).should.be.false
    eql(undefined, '').should.be.false
    eql(undefined, 0).should.be.false
    eql(undefined, []).should.be.false
    eql(undefined, undefined).should.be.true
    eql(undefined, NaN).should.be.false
  })
})

describe('null', () => {
  it('should equal only itself', () => {
    eql(null, undefined).should.be.false
    eql(null, '').should.be.false
    eql(null, 0).should.be.false
    eql(null, []).should.be.false
    eql(null, null).should.be.true
    eql(null, NaN).should.be.false
  })
})

describe('Cyclic structures', () => {
  it('should not go into an infinite loop', () => {
    var a = {}
    var b = {}
    a.self = a
    b.self = b
    eql(a, b).should.equal(true)
  })
})

describe('functions', () => {
  it('should fail if they have different names', () => {
    eql(function a() {}, function b() {}).should.be.false
  })

  it('should pass if they are both anonamous', () => {
    eql(() => {}, () => {}).should.be.true
  })

  it('handle the case where they have different argument names', () => {
    eql(function (b) {return b}, function (a) {return a}).should.be.true
  }).skip()

  it('should compare them as objects', () => {
    var a = () => {}
    var b = () => {}
    a.title = 'sometitle'
    eql(a, b).should.be.false
  })

  it('should compare their prototypes', () => {
    var a = function(){}
    var b = function(){}
    a.prototype.a = 1
    eql(a,b).should.be.false
  })

  it('should be able to compare object methods', () => {
    eql(
      {noop: () => {}},
      {noop: () => {}}
    ).should.be.true
    eql(
      {noop: function (a) {}},
      {noop: () => {}}
    ).should.be.false
  })
})

describe('Buffer', () => {
  it('should compare on content', () => {
    eql(new Buffer('abc'), new Buffer('abc')).should.be.true
    eql(new Buffer('a'), new Buffer('b')).should.be.false
    eql(new Buffer('a'), new Buffer('ab')).should.be.false
  })

  it('should fail against anything other than a buffer', () => {
    eql(new Buffer('abc'), [97,98,99]).should.be.true
    eql(new Buffer('abc'), {0:97,1:98,2:99,length:3}).should.be.false
    eql([97,98,99], new Buffer('abc')).should.be.true
    eql({0:97,1:98,2:99,length:3}, new Buffer('abc')).should.be.false
  })
}).skip(typeof Buffer == 'undefined')

describe('possible regressions', () => {
  it('should handle objects with no constructor property', () => {
    var a = Object.create(null)
    eql(a, {}).should.be.true
    eql({}, a).should.be.true
    eql(a, {a:1}).should.be.false
    eql({a:1}, a).should.be.false
  })

  it('when comparing primitives to composites', () => {
    eql({}, undefined).should.be.false
    eql(undefined, {}).should.be.false

    eql(new String, {}).should.be.false
    eql({}, new String).should.be.false

    eql({}, new Number).should.be.false
    eql(new Number, {}).should.be.false

    eql(new Boolean, {}).should.be.false
    eql({}, new Boolean).should.be.false

    eql(new Date, {}).should.be.false
    eql({}, new Date).should.be.false

    eql(new RegExp, {}).should.be.false
    eql({}, new RegExp).should.be.false
  })
})
