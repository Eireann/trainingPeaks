define(
[
    "underscore"
], function(
    _
    )
{

    var DataManager = function()
    {
        this.reset();
    };

    _.extend(DataManager.prototype, {
        reset: function(modelUrl)
        {
            if(this.shouldReset(modelUrl))
            {
                this.resolvedRequests = {};
                this.pendingRequests = {};
            }
        },

        shouldReset: function(modelUrl)
        {
            if(!modelUrl)
            {
                return true;
            }

            var matchers = [/fitness/g];

            return _.any(matchers, function(matcher)
            {
                return matcher.test(modelUrl);
            });
        },

        fetch: function(modelOrCollection, options)
        {
            var requestUrl = _.result(modelOrCollection, "url");

            if(this.hasResolvedData(requestUrl))
            {
                return this.resolveRequestWithExistingData(requestUrl, modelOrCollection, new $.Deferred());
            }
            else
            {
                return this.requestData(requestUrl, modelOrCollection, options);
            }
        },

        hasResolvedData: function(requestUrl)
        {
            return this.resolvedRequests.hasOwnProperty(requestUrl);
        },

        resolveRequestWithExistingData: function(requestUrl, modelOrCollection, deferred)
        {
            modelOrCollection.set(this.resolvedRequests[requestUrl]);
            deferred.resolve();
            return deferred;
        },

        resolveAllPendingRequests: function(requestUrl)
        {
            var requests = this.pendingRequests[requestUrl];
            delete this.pendingRequests[requestUrl];
            _.each(requests, function(request)
            {
                this.resolveRequestWithExistingData(requestUrl, request.modelOrCollection, request.deferred); 
            }, this);
        },

        requestData: function(requestUrl, modelOrCollection, options)
        {

            var deferred = new $.Deferred();
            var request = {
                modelOrCollection: modelOrCollection,
                deferred: deferred
            };

            if(!this.pendingRequests.hasOwnProperty(requestUrl))
            {
                this.pendingRequests[requestUrl] = [];
                this.pendingRequests[requestUrl].push(request);
                var self = this;
                options = _.extend({}, options);
                var originalSuccess = options.success ? options.success : null;
                options.success = function(modelOrCollection, response, options)
                {
                    var parsedData = modelOrCollection.parse(response);
                    self.resolvedRequests[requestUrl] = parsedData;

                    if(originalSuccess)
                    {
                        originalSuccess(modelOrCollection, response, options);
                    }

                    self.resolveAllPendingRequests(requestUrl);
                }; 
                modelOrCollection.fetch(options);
            } else {
                this.pendingRequests[requestUrl].push(request);
            }

            return deferred;
        }

    });

    return DataManager;

});