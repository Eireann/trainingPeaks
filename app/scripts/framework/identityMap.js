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

    var IdentityMap = function(options)
    {
        this.modelsByUrl = {};
    };

    _.extend(IdentityMap.prototype,
    {

        getSharedInstance: function(model)
        {
            var url = _.result(model, "url");
            if(this.modelsByUrl.hasOwnProperty(url))
            {
                return this.modelsByUrl[url];
            }
            else
            {
                this.modelsByUrl[url] = model;
                return this.modelsByUrl[url];
            }
        },

        updateSharedInstance: function(model)
        {
            var sharedModel = this.getSharedInstance(model);

            if(sharedModel !== model)
            {
                sharedModel.set(model.attributes);
            }

            return sharedModel;
        }

    });

    return IdentityMap;

});
