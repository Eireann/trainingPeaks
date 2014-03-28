

suite('lazy', function() {

  //setup is called after load, so doing setup here
  var called;
  $.lazy(function() { called = true; });

  setup(function() {
    $.lazy.reset();
  });

  test('$.lazy exists', function() {
    assert(typeof $.lazy, 'function');
  });

  test('calling $.lazy() returns queue', function() {
    var queue = $.lazy();
    assert.equal(typeof queue, 'object');
    assert.ok(queue.load instanceof Array);
    assert.ok(queue.mouse instanceof Array);
    assert.ok(queue.scroll instanceof Array);
  });

  test('pushes an object with priority and fn', function() {
    var fn = function() {};
    $.lazy(fn, 'load', 5);
    var queue = $.lazy();
    assert.equal(queue.load.length, 1);
    assert.equal(queue.load[0].priority, 5);
    assert.equal(queue.load[0].fn, fn);
  });

  test('$.lazy.reset() will reset queue', function() {
    var fn = function() {};
    $.lazy(fn, 'load', 5);
    var queue = $.lazy();
    assert.equal(queue.load.length, 1);
    $.lazy.reset();
    queue = $.lazy();
    assert.equal(queue.load.length, 0);
  });

  test('defaults to on load', function() {
    $.lazy(function() {
      console.log('load');
    });
    var queue = $.lazy();
    assert.equal(queue.load.length, 1);
    assert.equal(queue.mouse.length, 0);
    assert.equal(queue.scroll.length, 0);
  });


  test('defaults to priority of 1', function() {
    $.lazy(function() {
      console.log('load');
    });
    var queue = $.lazy();
    assert.equal(queue.load[0].priority, 1);
  });

  test('can pass priority without type', function() {
    $.lazy(function() {
      console.log('load');
    }, 5);
    var queue = $.lazy();
    assert.equal(queue.load[0].priority, 5);
  });

  test('run on load', function() {
    assert.ok(called);
  });

  test('manually run', function(done) {
    $.lazy(done);
    $.lazy.runQueue('load');
  });

  test('manually run, default to load', function(done) {
    $.lazy(done);
    $.lazy.runQueue();
  });

  test('run after load already called');

  test('grab script if callback is a string', function(done) {
    window.fixtureLoaded = done;
    $.lazy('fixtures/test.js');
    $.lazy.runQueue();
  });

  test('run in specific order', function(done) {
    var data = [];
    $.lazy(function() {
      data.push(2);
    }, 2);

    $.lazy(function() {
      data.push(1);
    }, 1);

    $.lazy(function() {
      assert.deepEqual(data, [1, 2]);
      done();
    }, 3);

    $.lazy.runQueue();
  });

  test('run on scroll', function(done) {
    $.lazy(done, 'scroll');
    $(window).trigger('scroll');
  });

  test('run on mouse move', function(done) {
    $.lazy(done, 'mouse');
    $('body').trigger('mousemove');
  });
});

