define(
    [],
    function()
    {
        function Logger(myConsole)
        {
            this.logLevel = this.logLevels.ERROR;
            this.console = typeof myConsole !== 'undefined' ? myConsole : console;
            this.timers = {};
        }

        Logger.prototype.logLevels = {
            TRACE: 0,
            DEBUG: 1,
            INFO: 2,
            WARN: 3,
            ERROR: 4,
            OFF: 5
        };

        Logger.prototype.setLogLevel = function(logLevel)
        {
            this.logLevel = logLevel;
        };

        Logger.prototype.write = function(logLevel, message)
        {
            if (logLevel >= this.logLevel)
            {
                this.console.log(message);
                if (this.logLevel === this.logLevels.TRACE)
                {
                    this.console.trace();
                }
            }
        };

        Logger.prototype.traceOn = function()
        {
            this.previousLevel = this.logLevel;
            this.setLogLevel(this.logLevels.TRACE);
        };

        Logger.prototype.traceOff = function()
        {
            if (this.hasOwnProperty('previousLevel'))
            {
                this.setLogLevel(this.previousLevel);
            } else
            {
                this.setLogLevel(this.logLevels.DEBUG);
            }
        };

        Logger.prototype.debug = function(message)
        {
            this.write(this.logLevels.DEBUG, 'DEBUG: ' + message);
        };

        Logger.prototype.info = function(message)
        {
            this.write(this.logLevels.INFO, 'INFO: ' + message);
        };

        Logger.prototype.warn = function(message)
        {
            this.write(this.logLevels.WARN, 'WARN: ' + message);
        };

        Logger.prototype.error = function(message)
        {
            this.write(this.logLevels.ERROR, 'ERROR: ' + message);
        };


        Logger.prototype.startTimer = function(timerName, msg)
        {
            msg = msg || "Started Timer";
            this.timers[timerName] = +new Date();
            this.logTimer(timerName, msg);
        };

        Logger.prototype.logTimer = function(timerName, msg)
        {
            if (!this.timers.hasOwnProperty(timerName))
            {
                throw "Invalid timer name: " + timerName;
            }
            msg = "TIMER: " + timerName + " " + msg + " at " + (+new Date() - this.timers[timerName]) + "ms";
            this.write(this.logLevels.DEBUG, msg);
        };

        Logger.prototype.waitAndLogTimer = function(timerName, msg)
        {
            this.logTimer(timerName, "Begin waiting for browser to render");
            var waitStartTime = +new Date();
            var theLogger = this;
            setTimeout(
                function logIt()
                {
                    var msgWithTime = msg + " (" + (+new Date() - waitStartTime) + " ms)";
                    theLogger.logTimer(timerName, msgWithTime);
                }, 1
            );
        };

        return Logger;
    }
);