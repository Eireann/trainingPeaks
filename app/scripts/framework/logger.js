define(
    [],
    function()
    {
        function Logger(myConsole)
        {
            this.logLevel = this.logLevels.ERROR;
            this.console = typeof myConsole !== 'undefined' ? myConsole : console;
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



        return Logger;
    }
);