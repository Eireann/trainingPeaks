// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "jquery",
    "TP",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "shared/views/userSettings/userSettingsZonesView"
],
function(
    $,
    TP,
    testHelpers,
    xhrData,
    UserSettingsZonesView
    )
{
    describe("User Settings Zones View", function()
    {
        var selectBoxIt = $.fn.selectBoxIt;
        beforeEach(function()
        {
            var userData = xhrData.users.barbkprem;
            testHelpers.startTheAppAndLogin(testHelpers.deepClone(userData));
            testHelpers.resolveRequest("GET", "fitness/v1/athletes/426489/settings", xhrData.athleteSettings.barbkprem);
            sinon.stub($.fn, 'selectBoxIt'); // selectBoxIt freezes...
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
            $.fn.selectBoxIt = selectBoxIt;
        });

        it("Should load successfully as a module", function()
        {
            expect(UserSettingsZonesView).to.not.be.undefined;
        });

        it("Should not throw durring lifecycle calls", function()
        {
            var view = new UserSettingsZonesView({ model: testHelpers.theApp.user.getAthleteSettings() });
            view.render();
            view.close();
        });

    });

});

