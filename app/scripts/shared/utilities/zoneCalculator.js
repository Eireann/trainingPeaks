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

            this.promise = new $.Deferred();

            var ajaxPromise = Backbone.ajax(
            {
                url:  endpoint,
                method: "POST",
                data: data,
                success: _.bind(this._success, this)
            });

            return this.promise;
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
            if(data)
            {
                this.results = this.parseResponse(data);
                this.promise.resolve();
            }
            else
            {
                this.promise.reject();
            }
        }

    });

    ZoneCalculator.HeartRate = ZoneCalculator.extend({

        zoneType: "heartrate",

        formatRequest: function(values)
        {
            return {
                LTHR: values.threshold,
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


    ZoneCalculator.Power = ZoneCalculator.extend({

        zoneType: "power",

        formatRequest: function(values)
        {
            return {
                LTPower: values.threshold,
                zoneType: this.definition.id
            };
        },

        parseResponse: function(data)
        {
            var results =
            {
                threshold: data.lactateThreshold,
                zones: data.zones
            };
            return ZoneCalculator.prototype.parseResponse(results);
        }

    });


    ZoneCalculator.Speed = ZoneCalculator.extend({

        zoneType: "speed",

        formatRequest: function(values)
        {
            return {
                speed: values.speed,
                distance: values.testDistance ? values.testDistance : 0,
                zoneType: this.definition.id
            };
        },

        parseResponse: function(data)
        {
            var results =
            {
                threshold: data.thresholdSpeed,
                zones: data.zones
            };
            return ZoneCalculator.prototype.parseResponse(results);
        }

    });
    return ZoneCalculator;

});
