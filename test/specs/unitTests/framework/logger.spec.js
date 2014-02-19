define(
["TP",
 "framework/logger"],
 function(TP, Logger)
 {
     describe("Logger", function()
     {

         describe("Logging", function()
         {
             var logger;
             var consoleSpy;
             beforeEach(function()
             {
                 consoleSpy = createSpyObj('console spy', ['log', 'trace']);
                 logger = new Logger(consoleSpy);
                 logger.setLogLevel(logger.logLevels.DEBUG);
             });

             it("Should allow to set log level", function()
             {
                 logger.setLogLevel(logger.logLevels.INFO);
                 expect(logger.logLevel).to.eql(logger.logLevels.INFO);

                 logger.setLogLevel(logger.logLevels.ERROR);
                 expect(logger.logLevel).to.eql(logger.logLevels.ERROR);
             });

             it("Should write to console log", function()
             {
                 var msg = "I am the message";
                 logger.write(1, msg);
                 expect(consoleSpy.log).to.have.been.calledWith(msg);
             });

             it("Should not write stack trace", function()
             {
                 var msg = "I am the message";
                 logger.write(1, msg);
                 expect(consoleSpy.trace).to.not.have.been.called;
             });

             it("Should write stack trace", function()
             {
                 var msg = "I am the message";
                 logger.traceOn();
                 logger.write(1, msg);
                 expect(consoleSpy.trace).to.have.been.called;
             });

             it("Should revert to previous log level", function()
             {
                 logger.setLogLevel(logger.logLevels.INFO);
                 logger.traceOn();
                 expect(logger.logLevel).to.eql(logger.logLevels.TRACE);
                 logger.traceOff();
                 expect(logger.logLevel).to.eql(logger.logLevels.INFO);
             });

             it("Should call write from debug with the appropriate log level", function()
             {
                 var theMessage = 'something useful';
                 sinon.spy(logger, "write");
                 logger.setLogLevel(logger.logLevels.DEBUG);
                 logger.debug(theMessage);
                 expect(consoleSpy.log).to.have.been.called;
                 expect(consoleSpy.log.lastCall.args[0]).to.contain(theMessage);
                 expect(logger.write.lastCall.args[0]).to.eql(logger.logLevels.DEBUG);
             });

             it("Should call write from info with the appropriate log level", function()
             {
                 var theMessage = 'something useful';
                 sinon.spy(logger, "write");
                 logger.setLogLevel(logger.logLevels.INFO);
                 logger.info(theMessage);
                 expect(consoleSpy.log).to.have.been.called;
                 expect(consoleSpy.log.lastCall.args[0]).to.contain(theMessage);
                 expect(logger.write.lastCall.args[0]).to.eql(logger.logLevels.INFO);
             });

             it("Should call write from warn with the appropriate log level", function()
             {
                 var theMessage = 'something useful';
                 sinon.spy(logger, "write");
                 logger.setLogLevel(logger.logLevels.WARN);
                 logger.warn(theMessage);
                 expect(consoleSpy.log).to.have.been.called;
                 expect(consoleSpy.log.lastCall.args[0]).to.contain(theMessage);
                 expect(logger.write.lastCall.args[0]).to.eql(logger.logLevels.WARN);
             });

             it("Should call write from error with the appropriate log level", function()
             {
                 var theMessage = 'something useful';
                 sinon.spy(logger, "write");
                 logger.setLogLevel(logger.logLevels.ERROR);
                 logger.error(theMessage);
                 expect(consoleSpy.log).to.have.been.called;
                 expect(consoleSpy.log.lastCall.args[0]).to.contain(theMessage);
                 expect(logger.write.lastCall.args[0]).to.eql(logger.logLevels.ERROR);
             });

             it("Should not write messages that are below the log level", function()
             {

                 logger.setLogLevel(logger.logLevels.WARN);
                 logger.debug('something');
                 expect(consoleSpy.log).to.not.have.been.called;
                 logger.info("something else");
                 expect(consoleSpy.log).to.not.have.been.called;
                 logger.warn("i am a warning");
                 expect(consoleSpy.log).to.have.been.called;
                 logger.error("now it is broken");
                 expect(consoleSpy.log).to.have.been.called;
             });
         });

         describe("Timers", function()
         {
             var logger;

             beforeEach(function()
             {
                 logger = new Logger();
             });

             it("Should have a startTimer method", function()
             {
                 expect(typeof logger.startTimer).to.equal('function');
             });

             it("Should have a logTimer method", function()
             {
                 expect(typeof logger.logTimer).to.equal('function');
             });

             it("Should throw if invalid timer name", function()
             {
                 function badTimer()
                 {
                     logger.logTimer("MyTimer", "some message");
                 }
                 expect(badTimer).to.throw();
             });

             it("Should output timing message", function()
             {
                 logger.startTimer("My Timer");
                 sinon.stub(logger, "write");
                 logger.logTimer("My Timer", "some message");
                 expect(logger.write).to.have.been.called;
             });

         });
     });
 }
 );
