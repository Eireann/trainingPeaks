define(
[
    "underscore",
    "backbone",
    "setImmediate"
],
function(_, Backbone, setImmediate)
{

    return {

        // does nothing, just makes this testable while i refactor ...
        backboneSync: function()
        {
            return new $.Deferred();
        },

        // Lawnchair cache in localStorage 
        //lawnchair: lawnchair({ adapter: 'dom' }, function() { }),

        initialize: function(app)
        {
            this.backboneSync = Backbone.sync;
            Backbone.sync = _.bind(this.sync, this);
            return this;
        },

        sync: function(method, model, options)
        {
            if (!model.cacheable)
            {
                return this.backboneSync(method, model, options);
            }

            if (method !== "read")
            {
                this.clearCache();
                return this.backboneSync(method, model, options);
            }

            // if no url was passed in, build one from the model
            if (!options.url)
                options.url = _.result(model, 'url');

            // fire backbone sync to get a jquery xhr deferred, and wrap it with our own deferred
            var ajaxDeferred = this.addCachingDeferred(method, model, options, this.backboneSync);

            // this is what actually triggers Backbone models/collections to sync,
            // and is added in Backbone.sync
            if(options.success)
                ajaxDeferred.done(options.success);

            // check cache
            this.checkCache(ajaxDeferred, options);

            return ajaxDeferred;
        },

        clearCache: function()
        {
            _.each(_.keys(localStorage), function(key)
            {
                if(key.indexOf("ajaxCache") === 0) {
                    localStorage.removeItem(key);
                }
            });
            //theMarsApp.logger.debug("AjaxCaching: Cleared Cache");
        },

        addCachingDeferred: function(method, model, options, backboneSync)
        {
            options.ajaxCachingDeferred = new $.Deferred();
            var jqXhr = backboneSync(method, model, options);
            jqXhr.ajaxCachingDeferred = options.ajaxCachingDeferred;

            // save response to local storage only on xhr resolution, not on resolution from cache
            var ajaxCaching = this;
            jqXhr.done(function(data, status, xhr)
            {
                ajaxCaching.saveResponseToLocalStorage(data, status, xhr, options);
            });

            var deferredFunctionNames = ["always", "done", "fail", "pipe", "progress", "then"];

            _.each(deferredFunctionNames, function(methodName) {
                var originalJqMethod = jqXhr[methodName];
                var ajaxDeferredMethod = options.ajaxCachingDeferred[methodName];
                jqXhr[methodName] = function()
                {
                    // apply on our cached data first
                    ajaxDeferredMethod.apply(options.ajaxCachingDeferred, arguments);

                    // then apply on our server data
                    originalJqMethod.apply(jqXhr, arguments);

                    return this;
                };
            }, this);

            return jqXhr;
        },

        saveResponseToLocalStorage: function(response, status, xhr, options)
        {
            if (status === "notmodified")
            {
                //theMarsApp.logger.debug("AjaxCaching Not Modified: " + options.url);
                return;
            }

            if (status !== "success")
            {
                //theMarsApp.logger.debug("AjaxCaching Invalid Response Status: " + status + ", " + options.url);
                return;
            }


            var lastModifiedDate = xhr.getResponseHeader("Last-Modified");
            var objectKey = this.getCacheKey(options.url);
            var objectToStore =
            {
                key: objectKey,
                lastModifiedDate: lastModifiedDate,
                data: response
            };

            this.writeCache(objectKey, objectToStore);
            //this.lawnchair.save(objectToStore);

            //theMarsApp.logger.debug("AjaxCaching Loaded from server: " + options.url);
        },

        writeCache: function(key, value)
        {
            try
            {
                localStorage.setItem(key, typeof value !== "string" ? JSON.stringify(value) : value);
            } catch (err)
            {
                //theMarsApp.logger.debug(err);
                this.clearCache();
            }
        },

        readCache: function(key)
        {
            return JSON.parse(localStorage.getItem(key));
        },

        getCacheKey: function(url)
        {
            return "ajaxCache_" + theMarsApp.session.get("access_token") + "_" + url.replace(theMarsApp.apiRoot, '');
        },

        checkCache: function(xhr, options)
        {

            var ajaxCaching = this;

            // Check localStorage for cached object
            // Use REQUEST URI + OAUTH Token as storage key.
            var key = ajaxCaching.getCacheKey(options.url);
            var cachedObject = this.readCache(key);

            if (cachedObject)
            {
                ajaxCaching.resolveRequestWithCachedData(xhr, options, cachedObject.data);
                ajaxCaching.addRequestCacheHeaders(xhr, cachedObject.lastModified);
            }
            /*
            this.lawnchair.get(key, function(cachedObject)
            {
                if (cachedObject)
                {
                    ajaxCaching.resolveRequestWithCachedData(xhr, options, cachedObject.data);
                    ajaxCaching.addRequestCacheHeaders(xhr, cachedObject.lastModified);
                }
            });
            */
        },

        resolveRequestWithCachedData: function(xhr, options, cachedData)
        {
            var status = "success";
            if (options.ajaxCachingDeferred)
            {

                // start it in a 'nextTick', so the browser can finish painting the results of this thread first
                setImmediate(function()
                {
                    options.ajaxCachingDeferred.resolveWith(options, [cachedData, status, xhr]);
                    theMarsApp.logger.debug("AjaxCaching Loaded from cache: " + options.url);
                });
            }
        },

        addRequestCacheHeaders: function(xhr, lastModified)
        {
            xhr.setRequestHeader("If-Modified-Since", lastModified);
        }

    };

});