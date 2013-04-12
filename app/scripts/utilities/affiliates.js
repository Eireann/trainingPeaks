define(
[
    "underscore",
    "models/imageData"
],
function(_, ImageData)
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
                $("<link>").attr("rel", "stylesheet").attr("href", "app/scripts/affiliates/" + affiliateCode + "/style.css").appendTo("body");
            }
        },

        isCoachedAccount: function()
        {
            var logoUrl = this.getLogoUrl();
            if (logoUrl && !this.isAffiliate() && logoUrl.indexOf("training_peaks_banner") < 0)
            {
                return true;
            }
            return false;
        },

        getLogoUrl: function()
        {
            var logoUrl = theMarsApp.user.get("settings.account.headerImageUrl");
            if (logoUrl.indexOf("http") !== 0)
            {
                logoUrl = theMarsApp.wwwRoot + logoUrl;      
            }
            return logoUrl;
        },

        loadLogoImageData: function()
        {
            var logoUrl = affiliateUtils.getLogoUrl();
            var imageData = new ImageData({ url: logoUrl });
            var deferred = new $.Deferred();
            var self = this;
            imageData.getImageData().done(function()
            {
                deferred.resolveWith(self, [imageData.get("data")]);
            });
            return deferred;
        },

        getHeaderLinkUrl: function()
        {
            return theMarsApp.user.get("settings.account.headerLink");
        }

    };

    return affiliateUtils;
});