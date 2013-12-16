define(
[
    "jquery",
    "underscore",
    "backbone",
    "moment",
    "TP",
    "framework/identityMap"
], function(
    $,
    _,
    Backbone,
    moment,
    TP,
    IdentityMap
    )
{

    var DataManager = function(options)
    {
        this.identityMap = options && options.identityMap || new IdentityMap();
        this.resetPatterns = options && options.resetPatterns ? options.resetPatterns : [];
        this.ignoreResetPatterns = options && options.ignoreResetPatterns ? options.ignoreResetPatterns : [];
        this.user = options && options.user ? options.user : theMarsApp.user;
        this._resolvedRequests = {};
        this._pendingRequests = {};
    };

    _.extend(DataManager.prototype, Backbone.Events);
    
    _.extend(DataManager.prototype, {

        reset: function(modelUrl)
        {
            if(this._shouldReset(modelUrl))
            {
                this.forceReset();
            }
        },

        forceReset: function()
        {
            this._resolvedRequests = {};
            this._pendingRequests = {};
            this.identityMap.reset();
            this.trigger("reset");
        },

        loadCollection: function(klass, options)
        {
            var self = this;
            var temporaryCollection = new klass([], options);
            var collection = new klass([], options);

            var deferred = $.Deferred();
            var promise = deferred.promise();
            this.fetchModel(temporaryCollection, options).then(function() {
                var models = temporaryCollection.map(_.bind(self.identityMap.updateSharedInstance, self.identityMap));
                collection.set(models);
                deferred.resolve.apply(deferred, arguments);
            }, _.bind(deferred.reject, deferred));

            promise.collection = collection;

            return promise;
        },

        loadModel: function(klass, attributes, options)
        {
            var model = new klass(attributes, options);
            var sharedModel = this.identityMap.getSharedInstance(model);

            var promise;

            if (model === sharedModel)
            {
                // Identity map did not have this model
                promise = this.fetchModel(sharedModel, options);
            }
            else
            {
                // Identity map had a shared version of this model
                promise = new $.Deferred().resolve().promise();
            }

            promise.model = sharedModel;
            return promise;
        },

        fetchAjax: function(requestSignature, options)
        {
            if(this._hasResolvedData(requestSignature))
            {
                return this._resolveAjaxRequestWithExistingData(requestSignature, new $.Deferred());
            }
            else
            {
                return this._requestAjaxData(requestSignature, options);
            }
        },

        fetchModel: function(modelOrCollection, options)
        {
            var requestSignature = _.result(modelOrCollection, "url");

            if(this._hasResolvedData(requestSignature))
            {
                return this._resolveRequestOnModelWithExistingData(requestSignature, modelOrCollection, new $.Deferred());
            }
            else
            {
                return this._requestDataOnModel(requestSignature, modelOrCollection, options);
            }
        },

        _shouldReset: function(modelUrl)
        {
            if(!modelUrl)
            {
                return true;
            }

            var ignoreable = _.any(this.ignoreResetPatterns, function(matcher)
            {
                return matcher.test(modelUrl);
            });

            var resettable = _.any(this.resetPatterns, function(matcher)
            {
                return matcher.test(modelUrl);
            });

            return resettable && !ignoreable;
        },

        _hasResolvedData: function(requestSignature)
        {
            return this._resolvedRequests.hasOwnProperty(requestSignature);
        },

        _resolveAllPendingRequests: function(requestSignature)
        {
            var requests = this._pendingRequests[requestSignature];
            delete this._pendingRequests[requestSignature];
            _.each(requests, function(request)
            {
                if(request.modelOrCollection)
                {
                    this._resolveRequestOnModelWithExistingData(requestSignature, request.modelOrCollection, request.deferred); 
                }
                else
                {
                    this._resolveAjaxRequestWithExistingData(requestSignature, request.deferred);
                }
            }, this);
        },

        _rejectAllPendingRequests: function(requestSignature, response)
        {
            var requests = this._pendingRequests[requestSignature];
            delete this._pendingRequests[requestSignature];
            _.each(requests, function(request)
            {
                this._rejectRequest(requestSignature, request.deferred, response);
            }, this);
        },

        _resolveRequestOnModelWithExistingData: function(requestSignature, modelOrCollection, deferred)
        {
            modelOrCollection.set(_.clone(this._resolvedRequests[requestSignature]));
            deferred.resolve();
            return deferred;
        },

        _rejectRequest: function(requestSignature, deferred, response)
        {
            deferred.reject(response);
        },

        _requestDataOnModel: function(requestSignature, modelOrCollection, options)
        {

            var deferred = new $.Deferred();
            var request = {
                modelOrCollection: modelOrCollection,
                deferred: deferred
            };

            if(!this._pendingRequests.hasOwnProperty(requestSignature))
            {
                this._pendingRequests[requestSignature] = [];
                this._pendingRequests[requestSignature].push(request);
                var self = this;
                options = _.extend({}, options);
                var originalSuccess = options.success ? options.success : null;

                options.success = function(modelOrCollection, response, options)
                {
                    var parsedData = modelOrCollection.parse(response);
                    self._resolvedRequests[requestSignature] = _.clone(parsedData);

                    if(originalSuccess)
                    {
                        originalSuccess(modelOrCollection, response, options);
                    }

                    self._resolveAllPendingRequests(requestSignature);
                }; 

                var originalErrorHandler = options.error ? options.error : null;

                options.error = function(modelOrCollection, response, options)
                {
                    if(originalErrorHandler)
                    {
                        originalErrorHandler(modelOrCollection, response, options);
                    }

                    self._rejectAllPendingRequests(requestSignature, response);
                }; 

                modelOrCollection.fetch(options);
            } else {
                this._pendingRequests[requestSignature].push(request);
            }

            return deferred;
        },

        _resolveAjaxRequestWithExistingData: function(requestSignature, deferred)
        {
            var data = this._resolvedRequests[requestSignature];
            deferred.resolve(data);
            return deferred;
        },

        _requestAjaxData: function(requestSignature, options)
        {
            var deferred = new $.Deferred();
            var request = {
                options: options,
                deferred: deferred
            };

            if(!this._pendingRequests.hasOwnProperty(requestSignature))
            {
                this._pendingRequests[requestSignature] = [];
                this._pendingRequests[requestSignature].push(request);
                var self = this;
                Backbone.ajax(options).done(function(data)
                {
                    self._resolvedRequests[requestSignature] = data;
                    self._resolveAllPendingRequests(requestSignature);
                }); 

            } else {
                this._pendingRequests[requestSignature].push(request);
            }

            return deferred;
        },

        // Reporting Methods

        fetchReport: function(reportName, startDate, endDate, postData)
        {

            if (!startDate || !endDate)
            {
                throw new Error("startDate & endDate needed for ReportFetcher");
            }

            var athleteId = this.user.getCurrentAthleteId();
            var url = theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/reporting/" + reportName;
            url += "/" +  moment(startDate).format(TP.utils.datetime.shortDateFormat);
            url += "/" +  moment(endDate).format(TP.utils.datetime.shortDateFormat);

            if(postData)
            {
                return this.fetchAjax(this._buildUrlSignature(url, postData), {
                    url: url,
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(postData)
                });
            }
            else
            {
                return this.fetchAjax(url, { url: url, type: "GET" });
            }
        },

        fetchMetrics: function(startDate, endDate)
        {
            if (!startDate || !endDate)
            {
                throw new Error("startDate & endDate needed for ReportFetcher");
            }

            var athleteId = this.user.getCurrentAthleteId();
            var url = theMarsApp.apiRoot + "/metrics/v1/athletes/" + athleteId + "/timedmetrics";
            url += "/" +  moment(startDate).format(TP.utils.datetime.shortDateFormat);
            url += "/" +  moment(endDate).format(TP.utils.datetime.shortDateFormat);

            return this.fetchAjax(url, { url: url, type: "GET" });
        },

        _buildUrlSignature: function(url, postData)
        {
            var parts = [];
            _.each(postData, function(value, key)
            {
                parts.push(key + "=" + value);
            });
            parts.sort();
            return url + "/" + parts.join("/");
        }

    });

    DataManager.extend = TP.extend;
    return DataManager;

});
