define(
[
    "TP"
],
function(
    TP)
{
    var PremiumPodsCollection = TP.Collection.extend(
    {
        model: TP.Model,

        comparator: "name",

        podTypeIdAttribute: "podType",

        initialize: function(models, options)
        {

            if(!options || !options.featureAuthorizer)
            {
                throw new Error("PremiumPodsCollection requires a feature authorizer");
            }

            this.featureAuthorizer = options.featureAuthorizer;
            this.on("add", this._checkPremiumAccess, this);
        },

        _checkPremiumAccess: function(model)
        {
            var featureAttributes = { podTypeId: model.get(this.podTypeIdAttribute) };

            // this collection should only contain items the user is allowed to view 
            if(!this.featureAuthorizer.canAccessFeature(
               this.featureAuthorizer.features.ViewPod,
               featureAttributes
               )
            )
            {
                this.remove(model);
                return;
            }

            // mark items the user is not allowed to use 
            if(!this.featureAuthorizer.canAccessFeature(
               this.featureAuthorizer.features.UsePod,
               featureAttributes
               )
            )
            {
                model.set("premium", true);
            }
            else
            {
                model.set("premium", false);
            }
        }
    });

    return PremiumPodsCollection;
});
