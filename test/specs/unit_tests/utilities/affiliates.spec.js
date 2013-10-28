requirejs(
[
    "jquery",
    "testUtils/testHelpers",
    "utilities/affiliates"
],
function($, testHelpers, affiliateUtils)
{
    describe("affiliate utilities", function()
    {
        it("Should recognize a trainingpeaks, non-coach, non-affiliate user account", function()
        {
            testHelpers.theApp.user.getAccountSettings().set("isAthlete", true, { silent: true });
            testHelpers.theApp.user.getAccountSettings().set("isCoached", false, { silent: true });
            testHelpers.theApp.user.getAffiliateSettings().set("code", "trainingpeaks3", { silent: true });
            testHelpers.theApp.user.getAccountSettings().set("headerImageUrl", "training_peaks_banner.png", { silent: true });
            expect(affiliateUtils.isTpAffiliate()).toBe(true);
            expect(affiliateUtils.isAffiliate()).toBe(false);
            expect(affiliateUtils.isCoachedAccount()).toBe(false);
        });

        it("Should recognize a branded affiliate account", function()
        {
            testHelpers.theApp.user.getAccountSettings().set("isAthlete", true, { silent: true });
            testHelpers.theApp.user.getAccountSettings().set("isCoached", false, { silent: true });
            testHelpers.theApp.user.getAffiliateSettings().set("code", "runnersworld", { silent: true });
            testHelpers.theApp.user.getAccountSettings().set("headerImageUrl", "training_peaks_banner.png", { silent: true });
            expect(affiliateUtils.isTpAffiliate()).toBe(false);
            expect(affiliateUtils.isAffiliate()).toBe(true);
            expect(affiliateUtils.isCoachedAccount()).toBe(false);
        });

        it("Should recognize a branded coached athlete account", function()
        {
            testHelpers.theApp.user.getAccountSettings().set("isAthlete", true, { silent: true });
            testHelpers.theApp.user.getAccountSettings().set("isCoached", true, { silent: true });
            expect(affiliateUtils.isTpAffiliate()).toBe(false);
            expect(affiliateUtils.isAffiliate()).toBe(false);
            expect(affiliateUtils.isCoachedAccount()).toBe(true);
        });

        it("Should recognize a branded coach account", function()
        {
            testHelpers.theApp.user.getAccountSettings().set("isAthlete", false, { silent: true });
            testHelpers.theApp.user.getAccountSettings().set("isCoached", false, { silent: true });
            expect(affiliateUtils.isTpAffiliate()).toBe(false);
            expect(affiliateUtils.isAffiliate()).toBe(false);
            expect(affiliateUtils.isCoachedAccount()).toBe(true);
        });
    });
});
