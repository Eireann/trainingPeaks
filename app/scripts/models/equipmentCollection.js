define(
[
    "backbone",
    "underscore",
    "jquery",
    "TP",
    "models/equipmentModel"
],
function(
    Backbone,
    _,
    $,
    TP,
    EquipmentModel
)
{

    return TP.Collection.extend(
    {
        model: EquipmentModel,

        cacheable: true,

        initialize: function(models, options)
        {
            if (options && options.athleteId)
            {
                this.athleteId = options.athleteId;
            }
            else
            {
                this.athleteId = theMarsApp.user.getCurrentAthleteId();
            }
        },

        save: function()
        {
            var ajaxOptions = {
                url: this.url(),
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify(this.toJSON())
            };
            
            return Backbone.ajax(ajaxOptions).done(_.bind(this._handleSaveResponse, this));
        },

        url: function()
        {
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + this.athleteId + "/equipment";
        },

        getFetchPromise: function()
        {
            if(!this.promise)
            {
                this.promise = this.fetch();
            }
            return this.promise;
        },

        _handleSaveResponse: function(data)
        {
            this.set(data);
        }

    });

});