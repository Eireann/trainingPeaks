requirejs(
["jquery", "localStorage", "framework/ajaxCaching"],
function($, localStorage, ajaxCaching)
{

    describe("Sync Caching", function()
    {

        it("Should have an initialize method", function()
        {
            expect(typeof ajaxCaching.initialize).toBe("function");
        });

        describe("sync", function()
        {
            it("Should call Backbone.sync if request type is not read", function()
            {
                var ret = {};
                spyOn(ajaxCaching, 'backboneSync').andReturn(ret);
                var method = 'update';
                var model = {};
                var settings = {};
                var returnedValue = ajaxCaching.sync(method, model, settings);
                expect(ajaxCaching.backboneSync).toHaveBeenCalledWith(method, model, settings);
                expect(returnedValue).toBe(ret);
            });

            it("Should call Backbone.sync if model is not cacheable", function()
            {
                var ret = {};
                spyOn(ajaxCaching, 'backboneSync').andReturn(ret);
                var method = 'read';
                var model = {};
                var settings = {};
                var returnedValue = ajaxCaching.sync(method, model, settings);
                expect(ajaxCaching.backboneSync).toHaveBeenCalledWith(method, model, settings);
                expect(returnedValue).toBe(ret);
            });

            describe("read", function()
            {
                var deferredSpy;
                var settings;
                 
                beforeEach(function()
                {
                    deferredSpy = jasmine.createSpyObj("deferred spy", ["done"]);
                    spyOn(ajaxCaching, "addCachingDeferred").andReturn(deferredSpy);
                    settings = {
                        type: "read",
                        success: function() { }
                    };
                });

                it("Should call addCachingDeferred if request type is read and model is cacheable", function()
                {
                    var method = 'read';
                    var model = {
                        cacheable: true
                    };
                    var settings = {};
                    ajaxCaching.sync(method, model, settings);
                    expect(ajaxCaching.addCachingDeferred).toHaveBeenCalledWith(method, model, settings, ajaxCaching.backboneSync);
                });

                it("Should call deferred.done with Backbone's settings.success", function()
                {
                    var method = 'read';
                    var model = {
                        cacheable: true
                    };
                    var settings = {
                        success: function() { }
                    };
                    ajaxCaching.sync(method, model, settings);
                    expect(deferredSpy.done).toHaveBeenCalledWith(settings.success);
                });

                it("Should return a deferred", function()
                {
                    var method = 'read';
                    var model = {
                        cacheable: true
                    };
                    var settings = {};
                    var returnedValue = ajaxCaching.sync(method, model, settings);
                    expect(returnedValue).toBe(deferredSpy);
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
                jQueryXhrDeferredSpy = jasmine.createSpyObj("deferred spy", ["always", "done", "fail", "pipe", "progress", "then"]);
                cachingDeferredSpy = jasmine.createSpyObj("deferred spy", ["always", "done", "fail", "pipe", "progress", "then"]);
                spyOn(ajaxCaching, "backboneSync").andReturn(jQueryXhrDeferredSpy);
                spyOn($, "Deferred").andReturn(cachingDeferredSpy);
                settings = {
                    type: "read",
                    success: function() { }
                };
            });

            it("Should return jquery's deferred xhr", function()
            {
                var method = 'read';
                var model = {
                    cacheable: true
                };
                var settings = {};
                var ret = ajaxCaching.addCachingDeferred(method, model, settings, ajaxCaching.backboneSync);
                expect(ret).toBe(jQueryXhrDeferredSpy);
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
                spyOn(ajaxCaching, "backboneSync").andReturn(jQueryXhrDeferred);
                spyOn($, "Deferred").andReturn(cachingDeferred);
                settings = {
                    type: "read",
                    success: function() { }
                };
            });

            it("Should add ajaxCachingDeferred to settings", function()
            {
                var method = 'read';
                var model = {
                    cacheable: true
                };
                var settings = {};
                ajaxCaching.addCachingDeferred(method, model, settings, ajaxCaching.backboneSync);
                expect(settings.hasOwnProperty("ajaxCachingDeferred")).toBe(true);
                expect(settings.ajaxCachingDeferred).toBe(cachingDeferred);
            });

            it("Should call inner deferred's methods", function()
            {
                var method = 'read';
                var model = {
                    cacheable: true
                };
                var settings = {};
                var deferredFunctionNames = ["done", "fail", "progress", "then"];
                var jqXhr = ajaxCaching.addCachingDeferred(method, model, settings, ajaxCaching.backboneSync);
                expect(jqXhr).toBe(jQueryXhrDeferred);
                _.each(deferredFunctionNames, function(methodName)
                {
                    spyOn(cachingDeferred[methodName], 'apply').andReturn(cachingDeferred);
                    var callback = jasmine.createSpy("Some callback");
                    jqXhr[methodName](callback);
                    expect(cachingDeferred[methodName].apply).toHaveBeenCalledWith(cachingDeferred, [callback]);
                    expect(callback).not.toHaveBeenCalled();
                });
            });

        });

        describe("Save response to local storage", function()
        {

            var settings = { url: 'some/url' };
            var xhr;

            beforeEach(function()
            {
                xhr = jasmine.createSpyObj("XHR Response Spy", ["getResponseHeader"]);
                spyOn(localStorage, "setItem");
            });

            it("Should not call localStorage.setItem if status is notmodified", function()
            {
                ajaxCaching.saveResponseToLocalStorage("", "notmodified", xhr, settings);
                expect(localStorage.setItem).not.toHaveBeenCalled();
            });

            it("Should not call localStorage.setItem if status is not success", function()
            {
                ajaxCaching.saveResponseToLocalStorage("", "notfound", xhr, settings);
                expect(localStorage.setItem).not.toHaveBeenCalled();
            });

            it("Should call localStorage.setItem if status is success", function()
            {
                ajaxCaching.saveResponseToLocalStorage("", "success", xhr, settings);
                expect(localStorage.setItem).toHaveBeenCalled();
            });

            it("Should include the request url in the cache key", function()
            {
                ajaxCaching.saveResponseToLocalStorage("something", "success", xhr, settings);
                expect(localStorage.setItem).toHaveBeenCalled();
                expect(localStorage.setItem.mostRecentCall.args[0].indexOf(settings.url) >= 0).toBe(true);
            });

            it("Should include the response data in cached object", function()
            {
                var response = "{some: 'json data'}";
                ajaxCaching.saveResponseToLocalStorage(response, "success", xhr, settings);
                expect(localStorage.setItem).toHaveBeenCalled();
                expect(localStorage.setItem.mostRecentCall.args[1].indexOf(response)).toBeGreaterThan(0);
            });

            it("Should include the last modified date in cached object", function()
            {
                var lastModified = "2013-01-01T00:00:00";
                xhr.getResponseHeader.andReturn(lastModified);
                ajaxCaching.saveResponseToLocalStorage("", "success", xhr, settings);
                expect(localStorage.setItem).toHaveBeenCalled();
                expect(localStorage.setItem.mostRecentCall.args[1].indexOf(lastModified)).toBeGreaterThan(0);
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

                spyOn(ajaxCaching, "resolveRequestWithCachedData");
                spyOn(ajaxCaching, "addRequestCacheHeaders");
            });

            it("Should check localStorage", function()
            {
                spyOn(localStorage, "getItem").andReturn(null);
                ajaxCaching.checkCache(xhr, settings);
                expect(localStorage.getItem).toHaveBeenCalled();
            });

            it("Should resolve request if we have cached data", function()
            {
                spyOn(localStorage, "getItem").andReturn(JSON.stringify(cachedObject));
                ajaxCaching.checkCache(xhr, settings);
                expect(ajaxCaching.resolveRequestWithCachedData).toHaveBeenCalledWith(xhr, settings, cachedObject.data);
            });

            it("Should add request headers if we have cached data", function()
            {
                spyOn(localStorage, "getItem").andReturn(JSON.stringify(cachedObject));
                ajaxCaching.checkCache(xhr, settings);
                expect(ajaxCaching.addRequestCacheHeaders).toHaveBeenCalledWith(xhr, cachedObject.lastModified);
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
                spyOn(settings.ajaxCachingDeferred, "resolveWith").andCallThrough();
                spyOn(ajaxCaching, "saveResponseToLocalStorage");
                var cachedData = "some data";

                var doneWasCalled = false;

                var theCallback = jasmine.createSpy("the callback").andCallFake(function()
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
                    expect(settings.ajaxCachingDeferred.resolveWith).toHaveBeenCalledWith(settings, [cachedData, "success", xhr]);
                    expect(theCallback).toHaveBeenCalledWith(cachedData, "success", xhr);
                    expect(ajaxCaching.saveResponseToLocalStorage).not.toHaveBeenCalled();
                });

            });


        });

        describe("Resolve request from server", function()
        {
            var ajaxCachingDeferred;

            beforeEach(function()
            {
                ajaxCachingDeferred = new $.Deferred();
                spyOn(ajaxCaching, "backboneSync").andReturn(new $.Deferred());
                spyOn($, "Deferred").andReturn(ajaxCachingDeferred);
            });

            it("Should not resolve the sync deferred", function()
            {
                var method = 'read';
                var model = {
                    cacheable: true
                };
                var settings = {};
                var ret = ajaxCaching.addCachingDeferred(method, model, settings, ajaxCaching.backboneSync);
                spyOn(ajaxCachingDeferred, "resolveWith").andCallThrough();
                spyOn(ajaxCachingDeferred, "resolve").andCallThrough();
                spyOn(ajaxCaching, "saveResponseToLocalStorage");

                var cachedData = "some data";
                ret.resolveWith(settings, [cachedData, 'success', ret]);
                expect(ajaxCachingDeferred.resolveWith).not.toHaveBeenCalled();
                expect(ajaxCachingDeferred.resolve).not.toHaveBeenCalled();

            });

            it("Should call saveResponseToLocalStorage", function()
            {
                var method = 'read';
                var model = {
                    cacheable: true
                };
                var settings = {};
                var ret = ajaxCaching.addCachingDeferred(method, model, settings, ajaxCaching.backboneSync);
                spyOn(ret, "resolveWith").andCallThrough();
                spyOn(ajaxCaching, "saveResponseToLocalStorage");
                var cachedData = "some data";

                var doneWasCalled = false;

                var theCallback = jasmine.createSpy("the callback").andCallFake(function()
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
                    expect(theCallback).toHaveBeenCalledWith(cachedData, "success", ret);
                    expect(ajaxCaching.saveResponseToLocalStorage).toHaveBeenCalled();
                });

            });


        });
    });

});