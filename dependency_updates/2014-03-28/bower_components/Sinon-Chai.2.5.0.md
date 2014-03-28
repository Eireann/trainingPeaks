
<!-- saved from url=(0069)https://raw.githubusercontent.com/domenic/sinon-chai/master/README.md -->
<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body><pre style="word-wrap: break-word; white-space: pre-wrap;"># Sinon.JS Assertions for Chai

**Sinon–Chai** provides a set of custom assertions for using the [Sinon.JS][] spy, stub, and mocking framework with the
[Chai][] assertion library. You get all the benefits of Chai with all the powerful tools of Sinon.JS.

Instead of using Sinon.JS's assertions:

```javascript
sinon.assertCalledWith(mySpy, "foo");
```

or awkwardly trying to use Chai's `should` or `expect` interfaces on spy properties:

```javascript
mySpy.calledWith("foo").should.be.ok;
expect(mySpy.calledWith("foo")).to.be.ok;
```

you can say

```javascript
mySpy.should.have.been.calledWith("foo");
expect(mySpy).to.have.been.calledWith("foo");
```

## Assertions

All of your favorite Sinon.JS assertions made their way into Sinon–Chai. We show the `should` syntax here; the `expect`
equivalent is also available.

&lt;table&gt;
    &lt;thead&gt;
        &lt;tr&gt;
            &lt;th&gt;Sinon.JS property/method&lt;/th&gt;
            &lt;th&gt;Sinon–Chai assertion&lt;/th&gt;
        &lt;/tr&gt;
    &lt;/thead&gt;
    &lt;tbody&gt;
        &lt;tr&gt;
            &lt;td&gt;called&lt;/td&gt;
            &lt;td&gt;spy.should.have.been.called&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;callCount&lt;/td&gt;
            &lt;td&gt;spy.should.have.callCount(n)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;calledOnce&lt;/td&gt;
            &lt;td&gt;spy.should.have.been.calledOnce&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;calledTwice&lt;/td&gt;
            &lt;td&gt;spy.should.have.been.calledTwice&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;calledThrice&lt;/td&gt;
            &lt;td&gt;spy.should.have.been.calledThrice&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;calledBefore&lt;/td&gt;
            &lt;td&gt;spy1.should.have.been.calledBefore(spy2)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;calledAfter&lt;/td&gt;
            &lt;td&gt;spy1.should.have.been.calledAfter(spy2)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;calledWithNew&lt;/td&gt;
            &lt;td&gt;spy.should.have.been.calledWithNew&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;alwaysCalledWithNew&lt;/td&gt;
            &lt;td&gt;spy.should.always.have.been.calledWithNew&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;calledOn&lt;/td&gt;
            &lt;td&gt;spy.should.have.been.calledOn(context)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;alwaysCalledOn&lt;/td&gt;
            &lt;td&gt;spy.should.always.have.been.calledOn(context)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;calledWith&lt;/td&gt;
            &lt;td&gt;spy.should.have.been.calledWith(...args)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;alwaysCalledWith&lt;/td&gt;
            &lt;td&gt;spy.should.always.have.been.calledWith(...args)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;calledWithExactly&lt;/td&gt;
            &lt;td&gt;spy.should.have.been.calledWithExactly(...args)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;alwaysCalledWithExactly&lt;/td&gt;
            &lt;td&gt;spy.should.always.have.been.calledWithExactly(...args)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;calledWithMatch&lt;/td&gt;
            &lt;td&gt;spy.should.have.been.calledWithMatch(...args)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;alwaysCalledWithMatch&lt;/td&gt;
            &lt;td&gt;spy.should.always.have.been.calledWithMatch(...args)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;returned&lt;/td&gt;
            &lt;td&gt;spy.should.have.returned(returnVal)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;alwaysReturned&lt;/td&gt;
            &lt;td&gt;spy.should.have.always.returned(returnVal)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;threw&lt;/td&gt;
            &lt;td&gt;spy.should.have.thrown(errorObjOrErrorTypeStringOrNothing)&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;alwaysThrew&lt;/td&gt;
            &lt;td&gt;spy.should.have.always.thrown(errorObjOrErrorTypeStringOrNothing)&lt;/td&gt;
        &lt;/tr&gt;
    &lt;/tbody&gt;
&lt;/table&gt;

For more information on the behavior of each assertion, see
[the documentation for the corresponding spy methods][spymethods]. These of course work on not only spies, but
individual spy calls, stubs, and mocks as well.

## Examples

Using Chai's `should`:

```javascript
"use strict";
var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

function hello(name, cb) {
    cb("hello " + name);
}

describe("hello", function () {
    it("should call callback with correct greeting", function () {
        var cb = sinon.spy();

        hello("foo", cb);

        cb.should.have.been.calledWith("hello foo");
    });
});
```

Using Chai's `expect`:

```javascript
"use strict";
var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

function hello(name, cb) {
    cb("hello " + name);
}

describe("hello", function () {
    it("should call callback with correct greeting", function () {
        var cb = sinon.spy();

        hello("foo", cb);

        expect(cb).to.have.been.calledWith("hello foo");
    });
});
```

## Installation and Usage

### Node

Do an `npm install sinon-chai` to get up and running. Then:

```javascript
var chai = require("chai");
var sinonChai = require("sinon-chai");

chai.use(sinonChai);
```

You can of course put this code in a common test fixture file; for an example using [Mocha][], see
[the Sinon–Chai tests themselves][fixturedemo].

### AMD

Sinon–Chai supports being used as an [AMD][] module, registering itself anonymously (just like Chai). So, assuming you
have configured your loader to map the Chai and Sinon–Chai files to the respective module IDs `"chai"` and
`"sinon-chai"`, you can use them as follows:

```javascript
define(function (require, exports, module) {
    var chai = require("chai");
    var sinonChai = require("sinon-chai");

    chai.use(sinonChai);
});
```

### `&lt;script&gt;` tag

If you include Sinon–Chai directly with a `&lt;script&gt;` tag, after the one for Chai itself, then it will automatically plug
in to Chai and be ready for use. Note that you'll want to get the latest browser build of Sinon.JS as well:

```html
&lt;script src="chai.js"&gt;&lt;/script&gt;
&lt;script src="sinon-chai.js"&gt;&lt;/script&gt;
&lt;script src="sinon.js"&gt;&lt;/script&gt;
```

### Ruby on Rails

Thanks to [Cymen Vig][], there's now [a Ruby gem][] of Sinon–Chai that integrates it with the Rails asset pipeline!


[Sinon.JS]: http://sinonjs.org/
[Chai]: http://chaijs.com/
[spymethods]: http://sinonjs.org/docs/#spies-api
[Mocha]: http://visionmedia.github.com/mocha/
[fixturedemo]: https://github.com/domenic/sinon-chai/tree/master/test/
[AMD]: https://github.com/amdjs/amdjs-api/wiki/AMD
[Cymen Vig]: https://github.com/cymen
[a Ruby gem]: https://github.com/cymen/sinon-chai-rails
</pre></body></html>