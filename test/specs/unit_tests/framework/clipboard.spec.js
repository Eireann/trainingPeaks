requirejs(
["framework/clipboard"],
function(Clipboard)
{
    describe("Clipboard", function()
    {

        it("Should know whether it has data", function()
         {
             var clipboard = new Clipboard();
             expect(clipboard.hasData()).toBe(false);
             clipboard.set('some data', 'copy');
             expect(clipboard.hasData()).toBe(true);
         });

         it("Should not accept invalid values", function()
         {
             var clipboard = new Clipboard();
             var setNothing = function()
             {
                 clipboard.set('', 'cut');
             };
             expect(setNothing).toThrow();
         });

         it("Should not accept invalid actions", function()
         {
             var clipboard = new Clipboard();
             var doNothing = function()
             {
                 clipboard.set('some data');
             };
             expect(doNothing).toThrow();
             var doPut = function()
             {
                 clipboard.set('some data', 'put');
             };
             expect(doPut).toThrow();
         });

         it("Should maintain the correct action name", function()
         {
             var clipboard = new Clipboard();
             clipboard.set("some data", "cut");
             expect(clipboard.getAction()).toBe("cut");
             clipboard.set("some other data", "copy");
             expect(clipboard.getAction()).toBe("copy");
         });

         it("Should maintain the correct value", function()
         {
             var clipboard = new Clipboard();
             clipboard.set("some data", "cut");
             expect(clipboard.getValue()).toBe("some data");
             clipboard.set("some other data", "copy");
             expect(clipboard.getValue()).toBe("some other data");
         });
       
    });
}
);