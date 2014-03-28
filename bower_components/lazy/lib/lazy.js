(function($) {
  var queue;
  var resetQueue = function() {
    queue = {
      load: [],
      mouse: [],
      scroll: []
    };
  };
  var sortQueue = function(a, b) {
    return a.priority - b.priority;
  };

  var runQueue = function(q) {
    q.sort(sortQueue);
    for (var i = 0, c = q.length; i < c; i++) {
      run(q[i]);
    }
  };

  var run = function(obj) {
    var fn = obj.fn;
    if (typeof fn === 'string') {
      $.getScript(fn);
    } else {
      fn();
    }
  };

  resetQueue();
  $.lazy = function(fn, type, priority) {
    if (arguments.length === 0) {
      return queue;
    }

    if (typeof type === 'number') {
      priority = type;
      type = undefined;
    }

    if (typeof type === 'undefined') {
      type = 'load';
    }

    if (typeof priority === 'undefined') {
      priority = 1;
    }

    queue[type].push({
      priority: priority,
      fn: fn
    });
  };

  $.lazy.reset = function() {
    resetQueue();
  };

  $.lazy.runQueue = function(type) {
    type = type || 'load';
    runQueue(queue[type]);
  };

  $(window).on('load', function() {
    runQueue(queue.load);

    $(window).one('scroll', function() {
      runQueue(queue.scroll);
    });

    $('body').one('mousemove', function() {
      runQueue(queue.mouse);
    });
  });
})(jQuery);
