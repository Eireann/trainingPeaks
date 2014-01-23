define(
[
    "jquery",
    "underscore",
    "utilities/affiliates"
],
function($, _, affiliateUtils)
{
    var coachAndAffiliateCustomizations =
    {
        coachAndAffiliateEvents:
        {
            "click .personHeaderLogo": "onLogoClicked"
        },

        initializeCoachAndAffiliateCustomizations: function()
        {
            _.extend(this.events, this.coachAndAffiliateEvents);
            this.on("render", _.bind(this.setupHeader, this));
        },

        setupHeader: function()
        {
            if (affiliateUtils.isCoachedAccount())
            {
                this.$(".personHeaderLogo").addClass("coached");
            } else if (affiliateUtils.isAffiliate())
            {
                this.$("#poweredBy").show();
                this.$(".personHeaderLogo").addClass("affiliate");

                if(!this.affiliateHeaderLoaded)
                {
                    affiliateUtils.loadAffiliateStylesheet();
                    this.affiliateHeaderLoaded = true;
                }
            }

        },

        onLogoClicked: function(e)
        {
            var linkUrl = affiliateUtils.getHeaderLinkUrl();
            if (linkUrl)
            {
                window.open(linkUrl);
            }
        }

    };

    return coachAndAffiliateCustomizations;
});
