define(
[
    "underscore"
],
function(_)
{
    var coachAndAffiliateCustomizations =
    {

        coachAndAffiliateEvents:
        {
            "click #banner": "onBannerClicked"
        },

        initializeCoachAndAffiliateCustomizations: function()
        {
            _.extend(this.events, this.coachAndAffiliateEvents);
            this.on("render", this.setupAds, this);
        },

        setupAds: function()
        {
            if (this.shouldDisplayAffiliateAdvertisements())
            {
                this.$el.addClass("withAds");
                this.$("#banner").css("display", "block").attr("src", this.getBannerUrl());
            }
        },

        shouldDisplayAffiliateAdvertisements: function()
        {
            var affiliateCode = theMarsApp.user.get("settings.affiliate.affiliateCode");
            if (affiliateCode === "runnersworld")
            {
                return true;
            }
            return false;
        },

        getBannerUrl: function()
        {
            var logoUrl = theMarsApp.user.get("settings.account.headerImageUrl");
            if(logoUrl.indexOf("http") !== 0)
            {
                logoUrl = theMarsApp.wwwRoot + logoUrl;      
            }
            return logoUrl;
        },

        onBannerClicked: function(e)
        {
            var linkUrl = theMarsApp.user.get("settings.account.headerLink");
            if(linkUrl)
            {
                window.open(linkUrl);
            }
        }

    };

    return coachAndAffiliateCustomizations;
});
