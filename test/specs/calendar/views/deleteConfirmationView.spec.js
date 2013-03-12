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

        });
        
        it("Should trigger event 'deleteConfirmed'", function()
        {
            
        });
    });
});