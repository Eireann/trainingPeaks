// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "backbone",
    "views/loginView"
],
function ($, Backbone, LoginView)
{
    describe("Login View", function ()
    {
        beforeEach(function ()
        {
        });

        it("requires a session model at construction", function()
        {
            var fakeSessionModel = new Backbone.Model();

            expect(function() { var tmp = new LoginView(); }).toThrow();
            expect(function() { var tmp = new LoginView({ model: fakeSessionModel }); }).not.toThrow();
        });

        it("subscribes to the model's success & failure events", function()
        {
            var fakeSessionModel = jasmine.createSpyObj("SessionModel spy", ["on"]);

            var context = {
                onLoginSuccess: function() { },
                onLoginFailure: function() { },
                model: fakeSessionModel
            };

            LoginView.prototype.initialize.apply(context);
            expect(fakeSessionModel.on).toHaveBeenCalledWith("api:authorization:success", context.onLoginSuccess, context);
            expect(fakeSessionModel.on).toHaveBeenCalledWith("api:authorization:failure", context.onLoginFailure, context);
        });

        it("triggers a login:success event when the model successfully authenticates", function()
        {
            var fakeSessionModel = new Backbone.Model();
            var view = new LoginView({ model: fakeSessionModel });
            var fakeController =
            {
                fakeSuccessHandler: function()
                {
                }
            };
            spyOn(fakeController, "fakeSuccessHandler");
            view.on("login:success", fakeController.fakeSuccessHandler);
            fakeSessionModel.trigger("api:authorization:success");
            expect(fakeController.fakeSuccessHandler).toHaveBeenCalled();
        });

        it("subscribes to the click event on the Submit button in the DOM after it renders itself", function()
        {                  
            var fakeSessionModel = new Backbone.Model();
            fakeSessionModel.authenticate = function()
            {
            };
            spyOn(fakeSessionModel, "authenticate");
            
            var view = new LoginView({ el: $("body"), model: fakeSessionModel });

            view.render();

            $("input[name=Submit]").click();

            expect(fakeSessionModel.authenticate).toHaveBeenCalled();
        });

        it("binds the username and password DOM input fields to its ui object", function()
        {
            var fakeSessionModel = new Backbone.Model();
            fakeSessionModel.authenticate = function ()
            {
            };
            spyOn(fakeSessionModel, "authenticate");

            var view = new LoginView({ el: $("body"), model: fakeSessionModel });

            view.render();

            $("input[name=username]").val("testusername");
            expect(view.ui.usernameInput.val()).toBe("testusername");
            
            $("input[name=password]").val("testpassword");
            expect(view.ui.passwordInput.val()).toBe("testpassword");
        });
    });

});