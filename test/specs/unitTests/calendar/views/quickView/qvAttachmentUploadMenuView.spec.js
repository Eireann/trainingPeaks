define(
[
    "TP",
    "views/quickView/qvMain/qvAttachmentUploadMenuView"
],
function (TP, AttachmentUploadMenuView)
{
    describe("AttachmentUploadMenuView", function ()
    {
        beforeEach(function ()
        {
        });

        it("has an initializer", function()
        {
            expect(AttachmentUploadMenuView).to.not.be.undefined;

            var model = new TP.Model();
            model.set("details", new TP.Model());
            
            expect(function() { new AttachmentUploadMenuView({ model: model, direction: "left" }); }).to.not.throw();
        });
    });
});
