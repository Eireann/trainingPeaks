define(
[
    "underscore",
    "testUtils/testHelpers"
],
function( _, testHelpers )
{
    describe("The Mars App", function()
    {

        var theApp;

        beforeEach(function()
        {
            testHelpers.startTheApp();
            theApp = testHelpers.theApp;
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should exist globally", function()
        {
            expect(_.keys(window)).to.contain('theMarsApp');
        });

        describe("App Initializers", function()
        {

            it("Should have a session", function()
            {
                expect(theMarsApp.hasOwnProperty('session')).to.be.ok;
            });

            it("Should have a logger", function()
            {
                expect(theMarsApp.hasOwnProperty('logger')).to.be.ok;
            });

            it("Should have a navigation controller", function()
            {
                expect(theMarsApp.controllers.navigationController).to.not.be.undefined;
            });
 
            it("Should have a calendar controller", function()
            {
                expect(theMarsApp.controllers.calendarController).to.not.be.undefined;
            });

            it("Should have a dashboard controller", function()
            {
                expect(theMarsApp.controllers.dashboardController).to.not.be.undefined;
            });

            it("Should have a client events tracker", function()
            {
                expect(theMarsApp.hasOwnProperty('clientEvents')).to.be.ok;
            });

        });

    });

});
