define(
[
    "jquery",
    "TP",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "controllers/dashboardController"
],
function(
    $,
    TP,
    testHelpers,
    xhrData,
    DashboardController
    )
{

    function buildDashboardController()
    {
        return new DashboardController({
            fullScreenManager: {}
        })
    }
    
    describe("Dashboard Controller", function()
    {
        beforeEach(function()
        {
            testHelpers.startTheApp();
            testHelpers.theApp.user.setCurrentAthlete(new TP.Model({ athleteId: 1}));
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should load successfully as a module", function()
        {
            expect(DashboardController).to.not.be.undefined;
        });

        describe("Initialize controller", function()
        {
            it("Should have a getLayout method", function()
            {
                expect(typeof DashboardController.prototype.getLayout).to.equal("function");
            });

            it("Should have a layout", function()
            {
                var controller = buildDashboardController();
                expect(controller.getLayout()).to.not.be.undefined;
            });

        });



        describe("Display controller", function()
        {

            beforeEach(function()
            {
                testHelpers.theApp.user.getDashboardSettings().set("pods", []);
            });

            afterEach(function()
            {
                testHelpers.theApp.user.getDashboardSettings().set("pods", null);
            });

            it("Should have a dashboard view", function()
            {
                var controller = buildDashboardController();
                controller.show();
                expect(controller.views.dashboard).to.not.be.undefined;
            });

            it("Should have a library view", function()
            {
                var controller = buildDashboardController();
                controller.show();
                expect(controller.views.library).to.not.be.undefined;
            });

            it("Should have a header view", function()
            {
                var controller = buildDashboardController();
                controller.show();
                expect(controller.views.header).to.not.be.undefined;
            });

            it("Should display the dashboard view in the dashboard region", function()
            {
                var controller = buildDashboardController();
                sinon.stub(controller.layout.dashboardRegion, "show");
                controller.show();
                expect(controller.layout.dashboardRegion.show).to.have.been.calledWith(controller.views.dashboard);
            });

            it("Should display the header view in the header region", function()
            {
                var controller = buildDashboardController();
                sinon.stub(controller.layout.headerRegion, "show");
                controller.show();
                expect(controller.layout.headerRegion.show).to.have.been.calledWith(controller.views.header);
            });

            it("Should display the library view in the library region", function()
            {
                var controller = buildDashboardController();
                sinon.stub(controller.layout.libraryRegion, "show");
                controller.show();
                expect(controller.layout.libraryRegion.show).to.have.been.calledWith(controller.views.library);
            });
        });

    });

});
