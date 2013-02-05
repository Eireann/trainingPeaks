requirejs(
["TP",
 "framework/logger"],
 function(TP, Logger)
 {
     describe("Logger", function()
     {
         var logger;
         var consoleSpy;
         beforeEach(function()
         {
             consoleSpy = jasmine.createSpyObj('console spy', ['log', 'trace']);
             logger = new Logger(consoleSpy);
             logger.setLogLevel(logger.logLevels.DEBUG);
         });

         it("Should allow to set log level", function()
         {
             logger.setLogLevel(logger.logLevels.INFO);
             expect(logger.logLevel).toEqual(logger.logLevels.INFO);

             logger.setLogLevel(logger.logLevels.ERROR);
             expect(logger.logLevel).toEqual(logger.logLevels.ERROR);
         });

         it("Should write to console log", function()
         {
             var msg = "I am the message";
             logger.write(1, msg);
             expect(consoleSpy.log).toHaveBeenCalledWith(msg);
         });

         it("Should not write stack trace", function()
         {
             var msg = "I am the message";
             logger.write(1, msg);
             expect(consoleSpy.trace).not.toHaveBeenCalled();
         });

         it("Should write stack trace", function()
         {
             var msg = "I am the message";
             logger.traceOn();
             logger.write(1, msg);
             expect(consoleSpy.trace).toHaveBeenCalled();
         });

         it("Should revert to previous log level", function()
         {
             logger.setLogLevel(logger.logLevels.INFO);
             logger.traceOn();
             expect(logger.logLevel).toEqual(logger.logLevels.TRACE);
             logger.traceOff();
             expect(logger.logLevel).toEqual(logger.logLevels.INFO);
         });

         it("Should call write from debug with the appropriate log level", function()
         {
             var theMessage = 'something useful';
             spyOn(logger, "write").andCallThrough();
             logger.setLogLevel(logger.logLevels.DEBUG);
             logger.debug(theMessage);
             expect(consoleSpy.log).toHaveBeenCalled();
             expect(consoleSpy.log.mostRecentCall.args[0]).toContain(theMessage);
             expect(logger.write.mostRecentCall.args[0]).toEqual(logger.logLevels.DEBUG);
         });

         it("Should call write from info with the appropriate log level", function()
         {
             var theMessage = 'something useful';
             spyOn(logger, "write").andCallThrough();
             logger.setLogLevel(logger.logLevels.INFO);
             logger.info(theMessage);
             expect(consoleSpy.log).toHaveBeenCalled();
             expect(consoleSpy.log.mostRecentCall.args[0]).toContain(theMessage);
             expect(logger.write.mostRecentCall.args[0]).toEqual(logger.logLevels.INFO);
         });

         it("Should call write from warn with the appropriate log level", function()
         {
             var theMessage = 'something useful';
             spyOn(logger, "write").andCallThrough();
             logger.setLogLevel(logger.logLevels.WARN);
             logger.warn(theMessage);
             expect(consoleSpy.log).toHaveBeenCalled();
             expect(consoleSpy.log.mostRecentCall.args[0]).toContain(theMessage);
             expect(logger.write.mostRecentCall.args[0]).toEqual(logger.logLevels.WARN);
         });

         it("Should call write from error with the appropriate log level", function()
         {
             var theMessage = 'something useful';
             spyOn(logger, "write").andCallThrough();
             logger.setLogLevel(logger.logLevels.ERROR);
             logger.error(theMessage);
             expect(consoleSpy.log).toHaveBeenCalled();
             expect(consoleSpy.log.mostRecentCall.args[0]).toContain(theMessage);
             expect(logger.write.mostRecentCall.args[0]).toEqual(logger.logLevels.ERROR);
         });

         it("Should not write messages that are below the log level", function()
         {

             logger.setLogLevel(logger.logLevels.WARN);
             logger.debug('something');
             expect(consoleSpy.log).not.toHaveBeenCalled();
             logger.info("something else");
             expect(consoleSpy.log).not.toHaveBeenCalled();
             logger.warn("i am a warning");
             expect(consoleSpy.log).toHaveBeenCalled();
             logger.error("now it is broken");
             expect(consoleSpy.log).toHaveBeenCalled();
         });
     });
 }
 );