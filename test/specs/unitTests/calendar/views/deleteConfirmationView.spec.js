define(
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
            sinon.stub(deleteConfirmationView, "close");
            deleteConfirmationView.onCancelled();
            expect(deleteConfirmationView.close).to.have.been.called;
        });
        
        it("Should trigger event 'userConfirmed' and close", function()
        {
            var viewOptions = { template: deleteConfirmationTemplate };
            var deleteConfirmationView = new UserConfirmationView(viewOptions);
            sinon.stub(deleteConfirmationView, "trigger");
            sinon.stub(deleteConfirmationView, "close");
            deleteConfirmationView.onConfirmed();
            expect(deleteConfirmationView.trigger).to.have.been.calledWith("userConfirmed", viewOptions);
            expect(deleteConfirmationView.close).to.have.been.called;
        });
    });
});
