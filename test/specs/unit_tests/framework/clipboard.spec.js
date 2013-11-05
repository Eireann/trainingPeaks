define(
["framework/clipboard"],
function(Clipboard)
{
    describe("Clipboard", function()
    {

        it("Should know whether it has data", function()
         {
             var clipboard = new Clipboard();
             expect(clipboard.hasData()).to.equal(false);
             clipboard.set('some data', 'copy');
             expect(clipboard.hasData()).to.equal(true);
         });

         it("Should not accept invalid values", function()
         {
             var clipboard = new Clipboard();
             var setNothing = function()
             {
                 clipboard.set('', 'cut');
             };
             expect(setNothing).to.throw();
         });

         it("Should not accept invalid actions", function()
         {
             var clipboard = new Clipboard();
             var doNothing = function()
             {
                 clipboard.set('some data');
             };
             expect(doNothing).to.throw();
             var doPut = function()
             {
                 clipboard.set('some data', 'put');
             };
             expect(doPut).to.throw();
         });

         it("Should maintain the correct action name", function()
         {
             var clipboard = new Clipboard();
             clipboard.set("some data", "cut");
             expect(clipboard.getAction()).to.equal("cut");
             clipboard.set("some other data", "copy");
             expect(clipboard.getAction()).to.equal("copy");
         });

         it("Should maintain the correct value", function()
         {
             var clipboard = new Clipboard();
             clipboard.set("some data", "cut");
             expect(clipboard.getValue()).to.equal("some data");
             clipboard.set("some other data", "copy");
             expect(clipboard.getValue()).to.equal("some other data");
         });
       
    });
}
);
