// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "views/deleteConfirmationView"
],
function ($, DeleteConfirmationView)
{
    describe("DeleteConfirmationView", function ()
    {
        it("Should close on cancel", function ()
        {
            var deleteConfirmationView = new DeleteConfirmationView();
            spyOn(deleteConfirmationView, "close");
            deleteConfirmationView.onDeleteCancelled();
            expect(deleteConfirmationView.close).toHaveBeenCalled();
        });
        
        it("Should trigger event 'deleteConfirmed' and close", function()
        {
            var deleteConfirmationView = new DeleteConfirmationView();
            spyOn(deleteConfirmationView, "trigger");
            spyOn(deleteConfirmationView, "close");
            deleteConfirmationView.onDeleteConfirmed();
            expect(deleteConfirmationView.trigger).toHaveBeenCalledWith("deleteConfirmed");
            expect(deleteConfirmationView.close).toHaveBeenCalled();
        });
    });
});