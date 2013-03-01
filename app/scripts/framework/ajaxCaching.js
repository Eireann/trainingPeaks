define(
[
    "backbone"
],
function(Backbone)
{

    return {

        initialize: function(app)
        {
            Backbone.ajax = _.bind(this.ajax, this);
            $(document).ajaxSend(_.bind(this.checkCache, this));
        },

        ajax: function(settings)
        {
            if (settings.type !== "GET")
                return $.ajax(settings);

            var ajaxDeferred = this.addCachingDeferred(settings, $.ajax);

            // this is what actually triggers Backbone models/collections to sync,
            // and is added in Backbone.sync
            ajaxDeferred.done(settings.success);

            return ajaxDeferred;
        },

        addCachingDeferred: function(settings, jqueryAjax)
        {
            settings.ajaxCachingDeferred = new $.Deferred();
            var jqXhr = jqueryAjax(settings);

            // save response to local storage only on xhr resolution, not on resolution from cache
            var ajaxCaching = this;
            jqXhr.done(function(data, status, xhr)
            {
                ajaxCaching.saveResponseToLocalStorage(data, status, xhr, settings);
            });

            var deferredFunctionNames = ["always", "done", "fail", "pipe", "progress", "then"];

            _.each(deferredFunctionNames, function(methodName) {
                var originalJqMethod = jqXhr[methodName];
                var ajaxDeferredMethod = settings.ajaxCachingDeferred[methodName];
                jqXhr[methodName] = function()
                {
                    // apply on our cached data first
                    ajaxDeferredMethod.apply(settings.ajaxCachingDeferred, arguments);

                    // then apply on our server data
                    originalJqMethod.apply(jqXhr, arguments);
                };
            }, this);

            return jqXhr;
        },

        saveResponseToLocalStorage: function(response, status, xhr, settings)
        {
            if (status === "notmodified")
            {
                //theMarsApp.logger.debug("AjaxCaching Not Modified: " + settings.url);
                return;
            }

            if (status !== "success")
            {
                //theMarsApp.logger.debug("AjaxCaching Invalid Response Status: " + status + ", " + settings.url);
                return;
            }

            var lastModifiedDate = xhr.getResponseHeader("Last-Modified");
            var objectKey = this.getCacheKey(settings.url);
            var objectToStore =
            {
                storageDate: +new Date(),
                lastModifiedDate: lastModifiedDate,
                data: response
            };

            localStorage.setItem(objectKey, JSON.stringify(objectToStore));

            theMarsApp.logger.debug("AjaxCaching Loaded from server: " + settings.url);
        },

        getCacheKey: function(url)
        {
            return theMarsApp.session.get("access_token") + url;
        },

        checkCache: function(event, xhr, settings)
        {
            if (settings.type !== "GET")
                return;

            var ajaxCaching = this;

            // Check localStorage for cached object
            // Use REQUEST URI + OAUTH Token as storage key.
            var key = ajaxCaching.getCacheKey(settings.url);
            var cachedObject = localStorage.getItem(key);

            if (cachedObject)
            {
                cachedObject = JSON.parse(cachedObject);

                ajaxCaching.resolveRequestWithCachedAjaxData(xhr, settings, cachedObject.data);
                ajaxCaching.addRequestCacheHeaders(xhr, cachedObject.lastModified);
            }
        },

        resolveRequestWithCachedAjaxData: function(xhr, settings, cachedData)
        {
            var status = "success";
            if (settings.ajaxCachingDeferred)
            {

                // start it in a 'nextTick', so the browser can finish painting the results of this thread first
                setTimeout(function()
                {
                    settings.ajaxCachingDeferred.resolveWith(settings, [cachedData, status, xhr]);
                    theMarsApp.logger.debug("AjaxCaching Loaded from cache: " + settings.url);
                }, 1);
            }
        },

        addRequestCacheHeaders: function(xhr, lastModified)
        {
            xhr.setRequestHeader("If-Modified-Since", lastModified);
        }

    };

});