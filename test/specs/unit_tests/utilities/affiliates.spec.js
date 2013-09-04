requirejs(
[
    "jquery",
    "app",
    "utilities/affiliates"
],
function($, theMarsApp, affiliateUtils)
{
    describe("affiliate utilities", function()
    {
        it("Should recognize a trainingpeaks, non-coach, non-affiliate user account", function()
        {
            theMarsApp.user.getAccountSettings().set("isAthlete", true, { silent: true });
            theMarsApp.user.getAccountSettings().set("isCoached", false, { silent: true });
            theMarsApp.user.getAffiliateSettings().set("code", "trainingpeaks3", { silent: true });
            theMarsApp.user.getAccountSettings().set("headerImageUrl", "training_peaks_banner.png", { silent: true });
            expect(affiliateUtils.isTpAffiliate()).toBe(true);
            expect(affiliateUtils.isAffiliate()).toBe(false);
            expect(affiliateUtils.isCoachedAccount()).toBe(false);
        });

        it("Should recognize a branded affiliate account", function()
        {
            theMarsApp.user.getAccountSettings().set("isAthlete", true, { silent: true });
            theMarsApp.user.getAccountSettings().set("isCoached", false, { silent: true });
            theMarsApp.user.getAffiliateSettings().set("code", "runnersworld", { silent: true });
            theMarsApp.user.getAccountSettings().set("headerImageUrl", "training_peaks_banner.png", { silent: true });
            expect(affiliateUtils.isTpAffiliate()).toBe(false);
            expect(affiliateUtils.isAffiliate()).toBe(true);
            expect(affiliateUtils.isCoachedAccount()).toBe(false);
        });

        it("Should recognize a branded coached athlete account", function()
        {
            theMarsApp.user.getAccountSettings().set("isAthlete", true, { silent: true });
            theMarsApp.user.getAccountSettings().set("isCoached", true, { silent: true });
            expect(affiliateUtils.isTpAffiliate()).toBe(false);
            expect(affiliateUtils.isAffiliate()).toBe(false);
            expect(affiliateUtils.isCoachedAccount()).toBe(true);
        });

        it("Should recognize a branded coach account", function()
        {
            theMarsApp.user.getAccountSettings().set("isAthlete", false, { silent: true });
            theMarsApp.user.getAccountSettings().set("isCoached", false, { silent: true });
            expect(affiliateUtils.isTpAffiliate()).toBe(false);
            expect(affiliateUtils.isAffiliate()).toBe(false);
            expect(affiliateUtils.isCoachedAccount()).toBe(true);
        });
    });
});