// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "jquery",
    "TP",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app",
    "shared/views/userSettings/userSettingsZonesView"
],
function(
    $,
    TP,
    testHelpers,
    xhrData,
    theMarsApp,
    UserSettingsZonesView
    )
{
    describe("User Settings Zones View", function()
    {
        var selectBoxIt = $.fn.selectBoxIt;
        beforeEach(function()
        {
            var userData = xhrData.users.barbkprem;
            testHelpers.startTheAppAndLogin(userData, true);
            testHelpers.resolveRequest("GET", "fitness/v1/athletes/426489/settings", xhrData.athleteSettings.barbkprem);
            spyOn($.fn, 'selectBoxIt'); // selectBoxIt freezes...
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
            $.fn.selectBoxIt = selectBoxIt;
        });

        it("Should load successfully as a module", function()
        {
            expect(UserSettingsZonesView).toBeDefined();
        });

        it("Should not throw durring lifecycle calls", function()
        {
            var view = new UserSettingsZonesView({ model: theMarsApp.user.getAthleteSettings() });
            view.render();
            view.close();
        });

    });

});

