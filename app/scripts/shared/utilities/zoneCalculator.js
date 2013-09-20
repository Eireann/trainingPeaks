define(
[
    "underscore",
    "backbone",
    "TP"
],
function(
    _,
    Backbone,
    TP
)
{

    function ZoneCalculator(definition)
    {
        this.definition = definition;
    }

    ZoneCalculator.extend = TP.extend;

    _.extend(ZoneCalculator.prototype,
    {

        update: function(values)
        {
            var endpoint = theMarsApp.apiRoot + "/zonescalculator/v1/" + this.zoneType;
            var data = this.formatRequest(values);

            var promise = Backbone.ajax(
            {
                url:  endpoint,
                method: "POST",
                data: data,
                success: _.bind(this._success, this)
            });

            return promise;
        },

        apply: function(model)
        {
            model.set(this.results);
        },

        calculate: function(model)
        {
            var promise = this.update(model.attributes);
            var self = this;
            promise.done(function(){
                self.apply(model); 
            });
            return promise;
        },

        formatRequest: function(values)
        {
            return values;
        },

        parseResponse: function(data)
        {
            var results = {};

            _.each(data, function(v, k)
            {
                if(v !== null && v !== undefined)
                {
                    results[k] = v;
                }
            });

            return results;
        },

        _success: function(data)
        {
            this.results = this.parseResponse(data);
        }

    });

    ZoneCalculator.HeartRate = ZoneCalculator.extend({

        zoneType: "heartrate",

        formatRequest: function(values)
        {
            return {
                lactateThreshold: values.threshold,
                maxHR: values.maximumHeartRate,
                restingHR: values.restingHeartRate,
                zoneType: this.definition.id
            };
        },

        parseResponse: function(data)
        {
            var results =
            {
                threshold: data.lactateThreshold,
                maximumHeartRate: data.maxHR,
                restingHeartRate: data.restingHR,
                zones: data.zones
            };
            return ZoneCalculator.prototype.parseResponse(results);
        }

    });

    return ZoneCalculator;

});
