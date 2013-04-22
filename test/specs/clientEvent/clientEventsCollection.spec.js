﻿requirejs(
["TP",
 "models/clientEventsCollection"],
 function(TP, ClientEventsCollection)
 {
     describe("Client Events Collection", function()
     {
         describe("Log Event", function()
         {
             it("Should call create", function()
             {
                 var mySpy = jasmine.createSpyObj("Create Events", ["create"]);
                 var myEventParams = { Event: 'some event data' };
                 ClientEventsCollection.prototype.logEvent.call(mySpy, myEventParams);
                 expect(mySpy.create).toHaveBeenCalledWith(myEventParams);
             });

         });

     });

 }
 );