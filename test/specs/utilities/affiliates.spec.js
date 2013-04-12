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
            theMarsApp.user.set("settings.affiliate.affiliateCode", "trainingpeaks3", { silent: true });
            theMarsApp.user.set("settings.account.headerImageUrl", "training_peaks_banner.png", { silent: true });
            expect(affiliateUtils.isTpAffiliate()).toBe(true);
            expect(affiliateUtils.isAffiliate()).toBe(false);
            expect(affiliateUtils.isCoachedAccount()).toBe(false);
        });

        it("Should recognize a branded affiliate account", function()
        {
            theMarsApp.user.set("settings.affiliate.affiliateCode", "runnersworld", { silent: true });
            theMarsApp.user.set("settings.account.headerImageUrl", "training_peaks_banner.png", { silent: true });
            expect(affiliateUtils.isTpAffiliate()).toBe(false);
            expect(affiliateUtils.isAffiliate()).toBe(true);
            expect(affiliateUtils.isCoachedAccount()).toBe(false);
        });

        it("Should recognize a branded coach account", function()
        {
            theMarsApp.user.set("settings.affiliate.affiliateCode", "someOtherAffiliate", { silent: true });
            theMarsApp.user.set("settings.account.headerImageUrl", "some_other_banner.png", { silent: true });
            expect(affiliateUtils.isTpAffiliate()).toBe(false);
            expect(affiliateUtils.isAffiliate()).toBe(false);
            expect(affiliateUtils.isCoachedAccount()).toBe(true);
        });
    });
});