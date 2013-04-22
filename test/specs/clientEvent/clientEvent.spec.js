requirejs(
["TP",
 "models/clientEvent"],
 function(TP, ClientEvent)
 {
     describe("Client Event", function()
     {

         it("Should load as a module", function ()
         {
             expect(ClientEvent).toBeDefined();
         });

         it("Should not allow to create an event without an Event attribute", function()
         {
            
             function goodEvent()
             {
                 var event = new ClientEvent({ Event: {Label: " ", Type: " ", AppContext: " " } });
             }

             function badEvent()
             {
                 var event = new ClientEvent();
             }

             expect(goodEvent).not.toThrow();
             expect(badEvent).toThrow();
         });
     });

 }
 );