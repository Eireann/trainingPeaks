define(
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
        beforeEach(function()
        {
            var userData = xhrData.users.barbkprem;
            testHelpers.startTheAppAndLogin(testHelpers.deepClone(userData));
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
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

