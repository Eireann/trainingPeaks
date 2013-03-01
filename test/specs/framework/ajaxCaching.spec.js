requirejs(
["jquery", "localStorage", "framework/ajaxCaching"],
function($, localStorage, ajaxCaching)
{

    describe("Ajax Caching", function()
    {

        it("Should have an initialize method", function()
        {
            expect(typeof ajaxCaching.initialize).toBe("function");
        });

        describe("ajax", function()
        {
            it("Should call $.ajax if request type is not GET", function()
            {
                var ret = {};
                spyOn($, 'ajax').andReturn(ret);
                var settings = {
                    type: "POST"
                };
                var returnedValue = ajaxCaching.ajax(settings);
                expect($.ajax).toHaveBeenCalledWith(settings);
                expect(returnedValue).toBe(ret);
            });

            describe("GET", function()
            {
                var deferredSpy;
                var settings;
                 
                beforeEach(function()
                {
                    deferredSpy = jasmine.createSpyObj("deferred spy", ["done"]);
                    spyOn(ajaxCaching, "addCachingDeferred").andReturn(deferredSpy);
                    settings = {
                        type: "GET",
                        success: function() { }
                    };
                });

                it("Should call addCachingDeferred if request type is GET", function()
                {
                    ajaxCaching.ajax(settings);
                    expect(ajaxCaching.addCachingDeferred).toHaveBeenCalledWith(settings, $.ajax);
                });

                it("Should call deferred.done with Backbone's settings.success", function()
                {
                    ajaxCaching.ajax(settings);
                    expect(deferredSpy.done).toHaveBeenCalledWith(settings.success);
                });

                it("Should return a deferred", function()
                {
                    var returnedValue = ajaxCaching.ajax(settings);
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
                spyOn($, "ajax").andReturn(jQueryXhrDeferredSpy);
                spyOn($, "Deferred").andReturn(cachingDeferredSpy);
                settings = {
                    type: "GET",
                    success: function() { }
                };
            });

            it("Should return jquery's deferred xhr", function()
            {
                var ret = ajaxCaching.addCachingDeferred(settings, $.ajax);
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
                spyOn($, "ajax").andReturn(jQueryXhrDeferred);
                spyOn($, "Deferred").andReturn(cachingDeferred);
                settings = {
                    type: "GET",
                    success: function() { }
                };
            });

            it("Should add ajaxCachingDeferred to settings", function()
            {
                ajaxCaching.addCachingDeferred(settings, $.ajax);
                expect(settings.hasOwnProperty("ajaxCachingDeferred")).toBe(true);
                expect(settings.ajaxCachingDeferred).toBe(cachingDeferred);
            });

            it("Should call inner deferred's methods", function()
            {
                var deferredFunctionNames = ["done", "fail", "progress", "then"];
                var jqXhr = ajaxCaching.addCachingDeferred(settings, $.ajax);
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
                settings = { url: 'some/url', type: 'GET' };
                xhr = {};

                spyOn(ajaxCaching, "resolveRequestWithCachedAjaxData");
                spyOn(ajaxCaching, "addRequestCacheHeaders");
            });

            it("Should not check localStorage if request type is not GET", function()
            {
                spyOn(localStorage, "getItem");
                settings.type = 'POST';
                ajaxCaching.checkCache({}, xhr, settings);
                expect(localStorage.getItem).not.toHaveBeenCalled();
            });

            it("Should check localStorage if request type is GET", function()
            {
                spyOn(localStorage, "getItem").andReturn(null);
                ajaxCaching.checkCache({}, xhr, settings);
                expect(localStorage.getItem).toHaveBeenCalled();
            });

            it("Should resolve request if we have cached data", function()
            {
                spyOn(localStorage, "getItem").andReturn(JSON.stringify(cachedObject));
                ajaxCaching.checkCache({}, xhr, settings);
                expect(ajaxCaching.resolveRequestWithCachedAjaxData).toHaveBeenCalledWith(xhr, settings, cachedObject.data);
            });

            it("Should add request headers if we have cached data", function()
            {
                spyOn(localStorage, "getItem").andReturn(JSON.stringify(cachedObject));
                ajaxCaching.checkCache({}, xhr, settings);
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
                    ajaxCaching.resolveRequestWithCachedAjaxData(xhr, settings, cachedData);
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
                spyOn($, "ajax").andReturn(new $.Deferred());
                spyOn($, "Deferred").andReturn(ajaxCachingDeferred);
            });

            it("Should not resolve the ajax deferred", function()
            {
                var settings = {};
                var ret = ajaxCaching.addCachingDeferred(settings, $.ajax);
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
                var settings = {};
                var ret = ajaxCaching.addCachingDeferred(settings, $.ajax);
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