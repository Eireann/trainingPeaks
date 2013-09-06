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
        beforeEach(function()
        {
            var userData = xhrData.users.barbkprem;
            testHelpers.startTheAppAndLogin(userData, true);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should load successfully as a module", function()
        {
            expect(UserSettingsZonesView).toBeDefined();
        });

        it("Should not throw durring lifecycle calls", function()
        {
            var view = new UserSettingsZonesView({ model: theMarsApp.user });
            view.render();
            view.close();
        });

    });

});

