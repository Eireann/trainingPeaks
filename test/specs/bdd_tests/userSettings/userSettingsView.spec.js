// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "jquery",
    "TP",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app",
    "shared/views/userSettingsView"
],
function(
    $,
    TP,
    testHelpers,
    xhrData,
    theMarsApp,
    UserSettingsView
    )
{
    describe("User Settings View", function()
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
            expect(UserSettingsView).toBeDefined();
        });

        it("Should not throw durring lifecycle calls", function()
        {
            var view = new UserSettingsView({ model: theMarsApp.user });
            view.render();
            view.close();
        });

        it("Should preserve values when switching tabs", function()
        {
            theMarsApp.user.set("firstName", "Original First Name");
            var view = new UserSettingsView({ model: theMarsApp.user });
            view.render();

            expect(view.$("input[name=firstName]").length).toBe(1);
            expect(view.$("input[name=firstName]").val()).toBe("Original First Name");
            view.$("input[name=firstName]").val("New First Name");
            expect(view.$("input[name=firstName]").val()).toBe("New First Name");

            view.$(".tabbedLayoutNav li:not(.active):first .tabbedLayoutNavLink").trigger("click");
            expect(view.$("input[name=firstName]").length).toBe(0);

            view.$(".tabbedLayoutNav li:not(.active):first .tabbedLayoutNavLink").trigger("click");
            expect(view.$("input[name=firstName]").length).toBe(1);
            expect(view.$("input[name=firstName]").val()).toBe("New First Name");
            view.close();
        });

        it("Should apply values to original models on save", function()
        {
            theMarsApp.user.set("firstName", "Original First Name");
            var view = new UserSettingsView({ model: theMarsApp.user });
            view.render();

            view.$("input[name=firstName]").val("New First Name");
            expect(theMarsApp.user.get("firstName")).toBe("Original First Name");
            view.$("button.save").trigger("click");
            expect(theMarsApp.user.get("firstName")).toBe("New First Name");

            view.close();
        });

        it("Should not apply values to original models on cancel", function()
        {
            theMarsApp.user.set("firstName", "Original First Name");
            var view = new UserSettingsView({ model: theMarsApp.user });
            view.render();

            view.$("input[name=firstName]").val("New First Name");
            expect(theMarsApp.user.get("firstName")).toBe("Original First Name");
            view.$("button.cancel").trigger("click");
            expect(theMarsApp.user.get("firstName")).toBe("Original First Name");

        });

        it("Should not apply values to original models on switching tabs", function()
        {
            theMarsApp.user.set("firstName", "Original First Name");
            var view = new UserSettingsView({ model: theMarsApp.user });
            view.render();

            view.$("input[name=firstName]").val("New First Name");
            view.$(".tabbedLayoutNav li:not(.active):first .tabbedLayoutNavLink").trigger("click");
            view.$(".tabbedLayoutNav li:not(.active):first .tabbedLayoutNavLink").trigger("click");
            expect(theMarsApp.user.get("firstName")).toBe("Original First Name");
        });

    });

});

