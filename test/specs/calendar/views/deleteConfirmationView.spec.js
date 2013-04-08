// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "views/userConfirmationView",
    "hbs!templates/views/deleteConfirmationView"
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
            var deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            spyOn(deleteConfirmationView, "trigger");
            spyOn(deleteConfirmationView, "close");
            deleteConfirmationView.onConfirmed();
            expect(deleteConfirmationView.trigger).toHaveBeenCalledWith("userConfirmed");
            expect(deleteConfirmationView.close).toHaveBeenCalled();
        });
    });
});