define(
[
    "underscore",
    "TP",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs"
],
function(
    _,
    TP,
    testHelpers,
    xhrData
    ) 
{
    describe("Initial Profile View on App Startup", function()
    {

        describe("For new users", function()
        {
            beforeEach(function()
            {
                var user = TP.utils.deepClone(xhrData.users.barbkprem);
                user.settings.account.shouldCompleteProfile = true;
                testHelpers.startTheAppAndLogin(user);
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should display the initial profile view", function()
            {
                expect(testHelpers.theApp.getBodyElement().find(".initialProfile").length).to.eql(1);
            });
        });

        describe("For existing users", function()
        {
            beforeEach(function()
            {
                var user = TP.utils.deepClone(xhrData.users.barbkprem);
                user.settings.account.shouldCompleteProfile = false;
                testHelpers.startTheAppAndLogin(user);
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should not display the initial profile view", function()
            {
                expect(testHelpers.theApp.getBodyElement().find(".initialProfile").length).to.eql(0);
            });
        });

    });

});
