// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "jquery",
    "TP",
    "app",
    "controllers/dashboardController",
    "testUtils/testHelpers",
],
function(
    $,
    TP,
    theMarsApp,
    DashboardController,
    TestHelpers)
{

    describe("Dashboard Controller", function()
    {
        beforeEach(function()
        {
            // let's not make any remote server calls, just testing object interactions here
            spyOn($, "ajax").andCallFake(function()
            {
                return $.Deferred();
            });
        });

        it("Should load successfully as a module", function()
        {
            expect(DashboardController).toBeDefined();
        });

        describe("Initialize controller", function()
        {
            it("Should have a getLayout method", function()
            {
                expect(typeof DashboardController.prototype.getLayout).toBe("function");
            });

            it("Should have a layout", function()
            {
                var controller = new DashboardController();
                expect(controller.getLayout()).toBeDefined();
            });

            it("Should have a dashboard view", function()
            {
                var controller = new DashboardController();
                expect(controller.views.dashboard).toBeDefined();
            });

            it("Should have a library view", function()
            {
                var controller = new DashboardController();
                expect(controller.views.library).toBeDefined();
            });

            it("Should have a header view", function()
            {
                var controller = new DashboardController();
                expect(controller.views.header).toBeDefined();
            });
        });



        describe("Display controller", function()
        {

            it("Should display the dashboard view in the dashboard region", function()
            {
                var controller = new DashboardController();
                spyOn(controller.layout.dashboardRegion, "show");
                controller.show();
                expect(controller.layout.dashboardRegion.show).toHaveBeenCalledWith(controller.views.dashboard);
            });

            it("Should display the header view in the header region", function()
            {
                var controller = new DashboardController();
                spyOn(controller.layout.headerRegion, "show");
                controller.show();
                expect(controller.layout.headerRegion.show).toHaveBeenCalledWith(controller.views.header);
            });

            it("Should display the library view in the library region", function()
            {
                var controller = new DashboardController();
                spyOn(controller.layout.libraryRegion, "show");
                controller.show();
                expect(controller.layout.libraryRegion.show).toHaveBeenCalledWith(controller.views.library);
            });
        });

    });

});
