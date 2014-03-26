define(
[
    "jquery",
    "components/publicFileViewer/js/emailCaptureView"
],
function(
    $,
    EmailCaptureView
)
{
    describe("Public File Viewer Email Capture View", function()
    {
        var view;
        beforeEach(function()
        {
            view = new EmailCaptureView();
            sinon.stub($, "ajax");
        });

        it("Should render", function()
        {
            view.render();
        });

        it("Should not submit to responsys if email is not valid", function()
        {
            view.render();
            view.$(".email").val("something");
            view.$(".submit").trigger("click");
            expect($.ajax).to.not.have.been.called;
        });

        it("Should submit to responsys if email is valid", function()
        {
            view.render();
            view.$(".email").val("something@someplace.com");
            view.$(".submit").trigger("click");
            expect($.ajax).to.have.been.called;
        });

        it("Should close after submitting", function()
        {
            view.render();
            view.$(".email").val("something@someplace.com");
            view.$(".submit").trigger("click");
            expect(view.isClosed).to.be.ok;
        });
    });
});
