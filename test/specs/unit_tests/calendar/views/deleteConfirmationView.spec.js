// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView"
],
function ($, UserConfirmationView, deleteConfirmationTemplate)
{
    describe("UserConfirmationView", function ()
    {
        it("Should close on cancel", function ()
        {
            var deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            spyOn(deleteConfirmationView, "close");
            deleteConfirmationView.onCancelled();
            expect(deleteConfirmationView.close).toHaveBeenCalled();
        });
        
        it("Should trigger event 'userConfirmed' and close", function()
        {
            var viewOptions = { template: deleteConfirmationTemplate };
            var deleteConfirmationView = new UserConfirmationView(viewOptions);
            spyOn(deleteConfirmationView, "trigger");
            spyOn(deleteConfirmationView, "close");
            deleteConfirmationView.onConfirmed();
            expect(deleteConfirmationView.trigger).toHaveBeenCalledWith("userConfirmed", viewOptions);
            expect(deleteConfirmationView.close).toHaveBeenCalled();
        });
    });
});