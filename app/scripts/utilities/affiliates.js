define(
[
    "jquery",
    "underscore",
    "models/imageData"
],
function($, _, ImageData)
{
    var affiliateUtils =
    {
        affiliates: ["runnersworld", "timextrainer"],

        isAffiliate: function()
        {
            return !this.isCoachedAccount() && _.contains(this.affiliates, this.getAffiliateCode());
        },

        isTpAffiliate: function()
        {
            return !this.isCoachedAccount() && this.getAffiliateCode() && this.getAffiliateCode().indexOf("trainingpeaks") >= 0 && this.getLogoUrl().indexOf("training_peaks_banner") >= 0;
        },

        isCoachedAccount: function()
        {
            if (theMarsApp.user.has("isAthlete") && !theMarsApp.user.get("isAthlete"))
                return true;

            if (theMarsApp.user.getAccountSettings().get("isCoached"))
                return true;

            return false;
        },

        getAffiliateCode: function()
        {
            return theMarsApp.user.getAffiliateSettings().get("code");
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
                var affiliateCode = this.getAffiliateCode();
                this.affiliateStylesheet = $("<link>").attr("rel", "stylesheet").attr("href", "app/scripts/affiliates/" + affiliateCode + "/style.css").appendTo("body");
            }
        },

        unloadAffiliateStylesheet: function()
        {
            if(this.affiliateStylesheet)
            {
                this.affiliateStylesheet.remove();
            }
        },

        getLogoUrl: function()
        {
            var logoUrl = theMarsApp.user.getAccountSettings().get("headerImageUrl");
            if (logoUrl && logoUrl.indexOf("http") !== 0)
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
            }).fail(function()
            {
                deferred.reject();
            });
            return deferred;
        },

        getHeaderLinkUrl: function()
        {
            return theMarsApp.user.getAccountSettings().get("headerLink");
        }

    };

    return affiliateUtils;
});
