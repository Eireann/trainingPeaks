requirejs(
["TP",
 "models/clientEvent"],
 function(TP, ClientEvent)
 {
     describe("Client Event", function()
     {

         it("Should not allow to create an event without an Event attribute", function()
         {
            
             function goodEvent()
             {
                 var event = new ClientEvent({ Event: "Some Event" });
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