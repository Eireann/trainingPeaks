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
            this.on("render", _.bind(this.watchForAffiliateChanges, this));
        },

        setupHeader: function()
        {
            affiliateUtils.unloadAffiliateStylesheet();
            this.$(".personHeaderLogo").removeClass("coached").removeClass("affiliate");

            if (affiliateUtils.isCoachedAccount())
            {
                this.$(".personHeaderLogo").addClass("coached");
            } else if (affiliateUtils.isAffiliate())
            {
                this.$("#poweredBy").show();
                this.$(".personHeaderLogo").addClass("affiliate");
                affiliateUtils.loadAffiliateStylesheet();
            }

        },

        watchForAffiliateChanges: function()
        {
            var setupHeader = _.bind(this.setupHeader, this);
            this.listenTo(theMarsApp.user.getAffiliateSettings(), "change:code", setupHeader);
            this.listenTo(theMarsApp.user, "change:isAthlete", setupHeader);
            this.listenTo(theMarsApp.user.getAccountSettings(), "change:isCoached", setupHeader);
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
