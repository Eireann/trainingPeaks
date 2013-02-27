define(
[
],
function()
{
    return function(app)
    {
        var originalAjax = $.ajax;
        $.ajax = function(settings)
        {
            if (settings.type !== "GET")
                return originalAjax(settings);

            var existingHandler = settings.success;
            settings.backboneSuccess = existingHandler;
            settings.success = function (innerResponse, innerStatus, xhr)
            {
                if (innerStatus === "notmodified")
                {
                    console.log("Not Modified: " + settings.url);
                    return;
                }

                var newLastModifiedDate = xhr.getResponseHeader("Last-Modified");
                var objectKey = app.session.get("access_token") + settings.url;
                var objectToStore =
                {
                    storageDate: +new Date(),
                    lastModifiedDate: newLastModifiedDate,
                    data: innerResponse
                };

                localStorage.setItem(objectKey, JSON.stringify(objectToStore));

                if (existingHandler)
                    existingHandler(innerResponse, innerStatus, xhr);
                console.log("loaded " + settings.url + " from server");
            };

            settings.ajaxCachingDeferred = new $.Deferred();
            var jqXhr = originalAjax(settings);

            jqXhr.jqXhrDone = jqXhr.done;
            jqXhr.done = function()
            {
                // apply on our cached data first
                settings.ajaxCachingDeferred.done.apply(this.ajaxCachingDeferred, arguments);

                // then apply on our server data
                this.jqXhrDone.apply(jqXhr, arguments);
            };
            
            return jqXhr;
        };

        $(document).ajaxSend(function(event, xhr, settings)
        {
            if (settings.type !== "GET")
                return;

            // Check localStorage for cached object
            // Use REQUEST URI + OAUTH Token as storage key.
            var key = app.session.get("access_token") + settings.url;
            var cachedObject = localStorage.getItem(key);

            if (cachedObject)
            {
                cachedObject = JSON.parse(cachedObject);
                var status = "success";
                var response = cachedObject.data;
                var lastModified = cachedObject.lastModified;

                if (settings.backboneSuccess)
                    settings.backboneSuccess(response, status, xhr);

                if (settings.ajaxCachingDeferred)
                    settings.ajaxCachingDeferred.resolveWith(settings, [settings.backboneSuccess, status, xhr]);

                console.log("loaded " + settings.url + " from cache");
                xhr.setRequestHeader("If-Modified-Since", lastModified);
            }
        });
    };
});