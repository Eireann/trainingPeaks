define(
[
    "underscore"
],
function(_)
{
    var affiliateUtils =
    {
        affiliates: ["runnersworld", "timextrainer"],

        isAffiliate: function()
        {
            return _.contains(this.affiliates, this.getAffiliateCode());
        },

        getAffiliateCode: function()
        {
            return theMarsApp.user.get("settings.affiliate.affiliateCode");
        },

        loadAffiliateSettings: function()
        {

            var affiliateSettingsDeferred = new $.Deferred();

            if (!this.isAffiliate())
            {
                return affiliateSettingsDeferred;
            }

            requirejs(
                ["affiliates/" + this.getAffiliateCode() + "/settings"],
                function(affiliateSettings)
                {
                    affiliateSettingsDeferred.resolveWith(this, [affiliateSettings]);
                }
            );

            return affiliateSettingsDeferred;
        },

        loadAffiliateStylesheet: function()
        {
            if (this.isAffiliate())
            {
                var affiliateCode = theMarsApp.user.get("settings.affiliate.affiliateCode");
                $("<link>").attr("rel", "stylesheet").attr("href", "app/affiliates/" + affiliateCode + "/style.css").appendTo("body");
            }
        }

    };

    return affiliateUtils;
});