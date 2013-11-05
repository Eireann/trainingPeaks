requirejs(
["jquery", "framework/ajaxCaching"],
function($, ajaxCaching)
{

    // cache has been disabled in the app
    describe("Sync Caching", function()
    {

        it("Should have an initialize method", function()
        {
            expect(typeof ajaxCaching.initialize).to.equal("function");
        });

        describe("sync", function()
        {

            it("Should call Backbone.sync if request type is not read", function()
            {
                var ret = {};
                sinon.stub(ajaxCaching, 'backboneSync').returns(ret);
                var method = 'update';
                var model = {};
                var settings = {};
                var returnedValue = ajaxCaching.sync(method, model, settings);
                expect(ajaxCaching.backboneSync).to.have.been.calledWith(method, model, settings);
                expect(returnedValue).to.equal(ret);
            });

            it("Should call Backbone.sync if model is not cacheable", function()
            {
                var ret = {};
                sinon.stub(ajaxCaching, 'backboneSync').returns(ret);
                var method = 'read';
                var model = {};
                var settings = {};
                var returnedValue = ajaxCaching.sync(method, model, settings);
                expect(ajaxCaching.backboneSync).to.have.been.calledWith(method, model, settings);
                expect(returnedValue).to.equal(ret);
            });

            describe("read", function()
            {
                var deferredSpy;
                var settings;
                 
                beforeEach(function()
                {
                    deferredSpy = createSpyObj("deferred spy", ["done"]);
                    sinon.stub(ajaxCaching, "addCachingDeferred").returns(deferredSpy);
                    settings = {
                        type: "read",
                        success: function() { }
                    };
                });

                afterEach(function()
                {
                });

                it("Should call addCachingDeferred if request type is read and model is cacheable", function()
                {
                    var method = 'read';
                    var model = {
                        cacheable: true,
                        url: 'some/url'
                    };
                    var settings = {};
                    ajaxCaching.sync(method, model, settings);
                    expect(ajaxCaching.addCachingDeferred).to.have.been.calledWith(method, model, settings, ajaxCaching.backboneSync);
                });

                it("Should call deferred.done with Backbone's settings.success", function()
                {
                    var method = 'read';
                    var model = {
                        cacheable: true,
                        url: 'some/url'

                    };
                    var settings = {
                        success: function() { }
                    };
                    ajaxCaching.sync(method, model, settings);
                    expect(deferredSpy.done).to.have.been.calledWith(settings.success);
                });

                it("Should return a deferred", function()
                {
                    var method = 'read';
                    var model = {
                        cacheable: true,
                        url: 'some/url'
                    };
                    var settings = {};
                    var returnedValue = ajaxCaching.sync(method, model, settings);
                    expect(returnedValue).to.equal(deferredSpy);
                });

            });
            
        });

        describe("addCachingDeferred", function()
        {
            var settings;
            var jQueryXhrDeferredSpy;
            var cachingDeferredSpy;

            beforeEach(function()
            {
                jQueryXhrDeferredSpy = createSpyObj("deferred spy", ["always", "done", "fail", "pipe", "progress", "then"]);
                cachingDeferredSpy = createSpyObj("deferred spy", ["always", "done", "fail", "pipe", "progress", "then"]);
                sinon.stub(ajaxCaching, "backboneSync").returns(jQueryXhrDeferredSpy);
                sinon.stub($, "Deferred").returns(cachingDeferredSpy);
                settings = {
                    type: "read",
                    success: function() { }
                };
            });

            it("Should return jquery's deferred xhr", function()
            {
                var method = 'read';
                var model = {
                    cacheable: true,
                    url: 'some/url'
                };
                var settings = {};
                var ret = ajaxCaching.addCachingDeferred(method, model, settings, ajaxCaching.backboneSync);
                expect(ret).to.equal(jQueryXhrDeferredSpy);
            });

        });

        describe("Wrapped Deferreds", function()
        {
            var settings;
            var jQueryXhrDeferred;
            var cachingDeferred;

            beforeEach(function()
            {
                jQueryXhrDeferred = new $.Deferred();
                cachingDeferred = new $.Deferred();
                sinon.stub(ajaxCaching, "backboneSync").returns(jQueryXhrDeferred);
                sinon.stub($, "Deferred").returns(cachingDeferred);
                settings = {
                    type: "read",
                    success: function() { }
                };
            });

            it("Should add ajaxCachingDeferred to settings", function()
            {
                var method = 'read';
                var model = {
                    cacheable: true,
                    url: 'some/url'
                };
                var settings = {};
                ajaxCaching.addCachingDeferred(method, model, settings, ajaxCaching.backboneSync);
                expect(settings.hasOwnProperty("ajaxCachingDeferred")).to.equal(true);
                expect(settings.ajaxCachingDeferred).to.equal(cachingDeferred);
            });

            it("Should call inner deferred's methods", function()
            {
                var method = 'read';
                var model = {
                    cacheable: true,
                    url: 'some/url'
                };
                var settings = {};
                var deferredFunctionNames = ["done", "fail", "progress", "then"];
                var jqXhr = ajaxCaching.addCachingDeferred(method, model, settings, ajaxCaching.backboneSync);
                expect(jqXhr).to.equal(jQueryXhrDeferred);
                _.each(deferredFunctionNames, function(methodName)
                {
                    sinon.stub(cachingDeferred[methodName], 'apply').returns(cachingDeferred);
                    var callback = sinon.stub();
                    jqXhr[methodName](callback);
                    expect(cachingDeferred[methodName].apply).to.have.been.calledWith(cachingDeferred, [callback]);
                    expect(callback).to.not.have.been.called;
                });
            });

        });

        describe("Save response to local storage", function()
        {

            var settings = { url: 'some/url' };
            var xhr;

            beforeEach(function()
            {
                xhr = createSpyObj("XHR Response Spy", ["getResponseHeader"]);
                sinon.stub(ajaxCaching, "writeCache");
            });

            afterEach(function()
            {
            });

            it("Should not call ajaxCaching.writeCache if status is notmodified", function()
            {
                ajaxCaching.saveResponseToLocalStorage("", "notmodified", xhr, settings);
                expect(ajaxCaching.writeCache).to.not.have.been.called;
            });

            it("Should not call ajaxCaching.writeCache if status is not success", function()
            {
                ajaxCaching.saveResponseToLocalStorage("", "notfound", xhr, settings);
                expect(ajaxCaching.writeCache).to.not.have.been.called;
            });

            it("Should call ajaxCaching.writeCache if status is success", function()
            {
                ajaxCaching.saveResponseToLocalStorage("", "success", xhr, settings);
                expect(ajaxCaching.writeCache).to.have.been.called;
            });

            it("Should include the request url in the cache key", function()
            {
                ajaxCaching.saveResponseToLocalStorage("something", "success", xhr, settings);
                expect(ajaxCaching.writeCache).to.have.been.called;
                expect(ajaxCaching.writeCache.lastCall.args[0].indexOf(settings.url) >= 0).to.equal(true);
            });

            it("Should include the response data in cached object", function()
            {
                var response = "{some: 'json data'}";
                ajaxCaching.saveResponseToLocalStorage(response, "success", xhr, settings);
                expect(ajaxCaching.writeCache).to.have.been.called;
                expect(ajaxCaching.writeCache.lastCall.args[1].data).to.equal(response);
            });

            it("Should include the last modified date in cached object", function()
            {
                var lastModified = "2013-01-01T00:00:00";
                xhr.getResponseHeader.returns(lastModified);
                ajaxCaching.saveResponseToLocalStorage("", "success", xhr, settings);
                expect(ajaxCaching.writeCache).to.have.been.called;
                expect(ajaxCaching.writeCache.lastCall.args[1].lastModifiedDate).to.equal(lastModified);
            });

        });

        describe("Check Cache", function()
        {

            var cachedObject;
            var settings;
            var xhr;

            beforeEach(function()
            {
                cachedObject = {
                    storageDate: +new Date(),
                    lastModifiedDate: "2013-01-01T00:00:00",
                    data: "some response data"
                };
                settings = { url: 'some/url' };
                xhr = {};

                sinon.stub(ajaxCaching, "resolveRequestWithCachedData");
                sinon.stub(ajaxCaching, "addRequestCacheHeaders");

            });

            afterEach(function()
            {
            });

            it("Should check cache", function()
            {
                sinon.stub(ajaxCaching, "readCache");
                ajaxCaching.checkCache(xhr, settings);
                expect(ajaxCaching.readCache).to.have.been.called;
            });

            it("Should resolve request if we have cached data", function()
            {
                sinon.stub(ajaxCaching, "readCache").returns(cachedObject);
                ajaxCaching.checkCache(xhr, settings);
                expect(ajaxCaching.resolveRequestWithCachedData).to.have.been.calledWith(xhr, settings, cachedObject.data);
            });

            it("Should add request headers if we have cached data", function()
            {
                sinon.stub(ajaxCaching, "readCache").returns(cachedObject);
                ajaxCaching.checkCache(xhr, settings);
                expect(ajaxCaching.addRequestCacheHeaders).to.have.been.calledWith(xhr, cachedObject.lastModified);
            });

        });

        describe("Resolve request with cached data", function()
        {

            it("Should resolve the ajaxCaching deferred", function()
            {
                var xhr = {};
                var settings = {
                    ajaxCachingDeferred: new $.Deferred()
                };
                sinon.spy(settings.ajaxCachingDeferred, "resolveWith");
                sinon.stub(ajaxCaching, "saveResponseToLocalStorage");
                var cachedData = "some data";

                var doneWasCalled = false;

                var theCallback = sinon.spy(function()
                {
                    doneWasCalled = true;
                });

                settings.ajaxCachingDeferred.done(theCallback);

                runs(function()
                {
                    ajaxCaching.resolveRequestWithCachedData(xhr, settings, cachedData);
                });

                waitsFor(function()
                {
                    return doneWasCalled;
                }, "The callback should have been called", 100);

                runs(function()
                {
                    expect(settings.ajaxCachingDeferred.resolveWith).to.have.been.calledWith(settings, [cachedData, "success", xhr]);
                    expect(theCallback).to.have.been.calledWith(cachedData, "success", xhr);
                    expect(ajaxCaching.saveResponseToLocalStorage).to.not.have.been.called;
                });

            });


        });

        describe("Resolve request from server", function()
        {
            var ajaxCachingDeferred;

            beforeEach(function()
            {
                ajaxCachingDeferred = new $.Deferred();
                sinon.stub(ajaxCaching, "backboneSync").returns(new $.Deferred());
                sinon.stub($, "Deferred").returns(ajaxCachingDeferred);
            });

            it("Should not resolve the sync deferred", function()
            {
                var method = 'read';
                var model = {
                    cacheable: true,
                    url: 'some/url'
                };
                var settings = {};
                var ret = ajaxCaching.addCachingDeferred(method, model, settings, ajaxCaching.backboneSync);
                sinon.spy(ajaxCachingDeferred, "resolveWith");
                sinon.spy(ajaxCachingDeferred, "resolve");
                sinon.stub(ajaxCaching, "saveResponseToLocalStorage");

                var cachedData = "some data";
                ret.resolveWith(settings, [cachedData, 'success', ret]);
                expect(ajaxCachingDeferred.resolveWith).to.not.have.been.called;
                expect(ajaxCachingDeferred.resolve).to.not.have.been.called;

            });

            it("Should call saveResponseToLocalStorage", function()
            {
                var method = 'read';
                var model = {
                    cacheable: true,
                    url: 'some/url'
                };
                var settings = {};
                var ret = ajaxCaching.addCachingDeferred(method, model, settings, ajaxCaching.backboneSync);
                sinon.spy(ret, "resolveWith");
                sinon.stub(ajaxCaching, "saveResponseToLocalStorage");
                var cachedData = "some data";

                var doneWasCalled = false;

                var theCallback = sinon.spy(function()
                {
                    doneWasCalled = true;
                });

                ret.done(theCallback);

                runs(function()
                {
                    ret.resolveWith(settings, [cachedData, 'success', ret]);
                });

                waitsFor(function()
                {
                    return doneWasCalled;
                }, "The callback should have been called", 100);

                runs(function()
                {
                    expect(theCallback).to.have.been.calledWith(cachedData, "success", ret);
                    expect(ajaxCaching.saveResponseToLocalStorage).to.have.been.called;
                });

            });


        });
    });

});
