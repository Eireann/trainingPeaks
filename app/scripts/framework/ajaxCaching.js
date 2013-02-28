﻿define(
[
],
function()
{

    return {

        originalAjax: null,

        ajaxWithCaching: function(settings)
        {
            if (settings.type !== "GET")
                return this.originalAjax(settings);

            settings.success = this.buildSuccessHandler(settings);
            return this.addCachingDeferred(settings);
        },

        addCachingDeferred: function(settings)
        {
            settings.ajaxCachingDeferred = new $.Deferred();
            var jqXhr = this.originalAjax(settings);

            jqXhr.jqXhrDone = jqXhr.done;
            jqXhr.done = function()
            {
                // apply on our cached data first
                settings.ajaxCachingDeferred.done.apply(this.ajaxCachingDeferred, arguments);

                // then apply on our server data
                this.jqXhrDone.apply(jqXhr, arguments);
            };

            return jqXhr;
        },

        buildSuccessHandler: function(settings)
        {
            settings.backboneSuccess = settings.success;
            var ajaxCaching = this;
            return function(innerResponse, innerStatus, xhr)
            {
                if (innerStatus === "notmodified")
                {
                    theMarsApp.logger.debug("AjaxCaching Not Modified: " + settings.url);
                    return;
                }

                var newLastModifiedDate = xhr.getResponseHeader("Last-Modified");
                var objectKey = ajaxCaching.getCacheKey(settings.url);
                var objectToStore =
                {
                    storageDate: +new Date(),
                    lastModifiedDate: newLastModifiedDate,
                    data: innerResponse
                };

                localStorage.setItem(objectKey, JSON.stringify(objectToStore));

                if (settings.backboneSuccess)
                    settings.backboneSuccess(innerResponse, innerStatus, xhr);

                theMarsApp.logger.debug("AjaxCaching Loaded from server: " + settings.url);
            };

        },

        getCacheKey: function(url)
        {
            return theMarsApp.session.get("access_token") + url;
        },

        checkCacheOnAjaxSend: function(event, xhr, settings)
        {
            if (settings.type !== "GET")
                return;

            // Check localStorage for cached object
            // Use REQUEST URI + OAUTH Token as storage key.
            var key = this.getCacheKey(settings.url);
            var cachedObject = localStorage.getItem(key);

            if (cachedObject)
            {
                cachedObject = JSON.parse(cachedObject);
                this.resolveRequestWithCachedAjaxData(xhr, settings, cachedObject.data);
                this.addRequestCacheHeaders(xhr, cachedObject.lastModified);
                theMarsApp.logger.debug("AjaxCaching Loaded from cache: " + settings.url);
            } else
            {
                theMarsApp.logger.debug("AjaxCaching key not found: " + settings.url);
            }
        },

        resolveRequestWithCachedAjaxData: function(xhr, settings, cachedData)
        {
            var status = "success";
            if (settings.ajaxCachingDeferred)
            {
                settings.ajaxCachingDeferred.done(settings.backboneSuccess);
                settings.ajaxCachingDeferred.resolveWith(settings, [cachedData, status, xhr]);
            } else if (settings.backboneSuccess)
            {
                settings.backboneSuccess(cachedData, status, xhr);
            }
        },

        addRequestCacheHeaders: function(xhr, lastModified)
        {
            xhr.setRequestHeader("If-Modified-Since", lastModified);
        },

        initialize: function(app)
        {
            this.originalAjax = $.ajax;
            _.bindAll(this, "ajaxWithCaching", "checkCacheOnAjaxSend");
            $.ajax = this.ajaxWithCaching;
            $(document).ajaxSend(this.checkCacheOnAjaxSend);
        }
    };

});