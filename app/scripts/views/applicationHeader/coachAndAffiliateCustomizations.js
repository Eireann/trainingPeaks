define(
[
    "underscore",
    "utilities/affiliates"
],
function(_, affiliateUtils)
{
    var coachAndAffiliateCustomizations =
    {

        initializeCoachAndAffiliateCustomizations: function()
        {
            this.on("render", this.setupBanner, this);
        },

        setupBanner: function()
        {
            _.bindAll(this, "displayBanner");
            affiliateUtils.loadAffiliateSettings().done(this.displayBanner);
        },

        displayBanner: function(affiliateSettings)
        {
            if (affiliateSettings && affiliateSettings.hasOwnProperty("bannerCode"))
            {
                this.$el.addClass("withAds");
                this.$("#affiliateBanner").css("display", "block").html(affiliateSettings.bannerCode);
            } 
        }

    };

    return coachAndAffiliateCustomizations;
});
