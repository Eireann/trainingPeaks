define(
[
    "underscore",
    "TP",
    "shared/models/expandoPodSettingsModel"
],
function(
         _,
         TP,
         ExpandoPodSettingsModel
         )
{
    var ExpandoPodLayout = TP.BaseModel.extend({

        defaults: 
        {
            workoutTypeId: 0,
            pods: []            
        },

        getPodsCollection: function()
        {
            if(!this._podsCollection)
            {
                var podsCollection = new TP.Collection(this.get("pods"), { comparator: "index", model: ExpandoPodSettingsModel });
                this.listenTo(podsCollection, "add remove change", function()
                {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift("change");
                    this.trigger.apply(this, args);
                });
                this._podsCollection = podsCollection;
            }

            return this._podsCollection;
        },

        toJSON: function(options)
        {
            var json = this.constructor.__super__.toJSON.call(this, options);

            if(this._podsCollection)
            {
                json.pods = this._podsCollection.toJSON();
            }

            return json;
        }
    });

    return ExpandoPodLayout;

});

