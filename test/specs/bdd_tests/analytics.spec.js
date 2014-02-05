define(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "TP"
],
function(
    testHelpers,
    xhrData,
    TP
)
{

    describe("Analytics", function()
    {

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            window.ga = sinon.stub();
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
            delete window.ga;
        });

        it("Should call window.ga", function()
        {
            TP.analytics("send", { });
            expect(window.ga).to.have.been.calledWith("send");
        });

        it("Should pass through all original arguments", function()
        {
            var data = { 
                hitType: "event",
                eventCategory: "calendar",
                eventAction: "exitFullScreen",
                eventLabel: "someLabel",
                metric1: 100
            };

            TP.analytics("send", data);
            expect(window.ga).to.have.been.calledWith("send", data);
        });

        it("Should add dimension1 for userType", function()
        {
            TP.analytics("send", { hitType: "event", eventAction: "test" });
            expect(window.ga.firstCall.args[1].dimension1).to.exist;
        });

        it("Should add dimension2 for userHash", function()
        {
            TP.analytics("send", { hitType: "event", eventAction: "test" });
            expect(window.ga.firstCall.args[1].dimension2).to.exist;
        });

        it("Should add dimension3 for full screen mode", function()
        {
            TP.analytics("send", { hitType: "event", eventAction: "test" });
            expect(window.ga.firstCall.args[1].dimension3).to.exist;
        });
    });

});
