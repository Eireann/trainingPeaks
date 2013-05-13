define(
[
], function()
{

    function TimeParser(timeString)
    {
        this.timeString = timeString.trim();
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.decimalHours = null;
    }

    _.extend(TimeParser.prototype, {

        getTime: function()
        {
            this.parseTime();
            return this.decimalHours;
        },

        parseTime: function()
        {
            this.parseTimeAsHoursMinutesSeconds();
            this.makeSmartAssumptionsAboutUserInput();
            this.calculateDecimalHours();
        },

        calculateDecimalHours: function()
        {

            // empty input
            if (this.timeIsEmpty())
                return;

            var hours = 0;
            hours += this.hours;
            hours += this.minutes / 60;
            hours += this.seconds / 3600;
            this.decimalHours = hours;
        },

        makeSmartAssumptionsAboutUserInput: function()
        {
            this.treatIntegersLessThanTenAsHours();
            this.treatIntegersTenAndGreaterAsMinutes();
            this.treatTwoPartStringsLessThanTenAsHoursAndMinutes();
            this.treatTwoPartStringsTenAndGreaterAsMinutesAndSeconds();
            this.treatDecimalsLessThanTenAsHoursAndMinutes();
            this.treatDecimalsTenAndGreaterAsMinutesAndSeconds();
            this.treatSingleColonPrefixesAsMinutes();
            this.treatDoubleColonPrefixesAsSeconds();
            this.treatDoubleColonSuffixesAsHours();
            this.treatSingleColonSuffixesLessThanTenAsHours();
            this.treatSingleColonSuffixesTenAndGreaterAsMinutes();
        },

        parseTimeAsHoursMinutesSeconds: function()
        {
            var parts = this.timeString.split(":");
            while (parts.length < 3)
            {
                parts.push("0");
            }

            for (var i = 0; i < parts.length; i++)
            {
                parts[i] = isNaN(Number(parts[i])) ? 0 : Number(parts[i]);
            }

            this.hours = parts[0];
            this.minutes = parts[1];
            this.seconds = parts[2];
        },

        timeIsEmpty: function()
        {
            return !this.timeString.trim();
        },

        honorDecimalInput: function()
        {
            if(this.timeString.match())
            {
                this.decimalHours = Number(this.timeString);
            }
        },

        treatIntegersLessThanTenAsHours: function()
        {
            if (this.timeString.match(/^[0-9]+$/) && this.timeString >= 0 && this.timeString <= 9)
            {
                this.hours = Number(this.timeString);
                this.minutes = 0;
                this.seconds = 0;
            }
        },

        treatIntegersTenAndGreaterAsMinutes: function()
        {
            if (this.timeString.match(/^[0-9]+$/) && this.timeString >= 0 && this.timeString > 9)
            {
                this.minutes = Number(this.timeString);
                this.hours = 0;
                this.seconds = 0;
            }
        },

        treatTwoPartStringsLessThanTenAsHoursAndMinutes: function()
        {
            // already handled by default parsing logic
            return;
        },

        treatTwoPartStringsTenAndGreaterAsMinutesAndSeconds: function()
        {
            if (this.timeString.match(/^[0-9]+:[0-9]+$/) && this.hours > 9)
            {
                this.seconds = this.minutes;
                this.minutes = this.hours;
                this.hours = 0;
            }
        },

        treatDecimalsLessThanTenAsHoursAndMinutes: function()
        {
            if (this.timeString.match(/^[0-9][0-9]+\.[0-9]+$/))
            {
                this.hours = Math.floor(Number(this.timeString));
                this.minutes = (Number(this.timeString) % 1) * 60;
                this.seconds = 0;
            }
        },

        treatDecimalsTenAndGreaterAsMinutesAndSeconds: function()
        {
            if (this.timeString.match(/^[0-9][0-9]+\.[0-9]+$/))
            {
                this.hours = 0;
                this.minutes = Math.floor(Number(this.timeString));
                this.seconds = (Number(this.timeString) % 1) * 60;
            }
        },

        treatSingleColonPrefixesAsMinutes: function()
        {
            if (this.timeString.match(/^:[0-9]+$/))
            {
                this.hours = 0;
                this.minutes = Number(this.timeString.replace(/:/g, ''));
                this.seconds = 0;
            }
        },

        treatDoubleColonPrefixesAsSeconds: function()
        {
            if (this.timeString.match(/^::[0-9]+$/))
            {
                this.hours = 0;
                this.minutes = 0;
                this.seconds = Number(this.timeString.replace(/:/g,''));
            }
        },

        treatDoubleColonSuffixesAsHours: function()
        {
            if (this.timeString.match(/^[0-9]+::$/))
            {
                this.hours = Number(this.timeString.replace(/:/g, ''));
                this.minutes = 0;
                this.seconds = 0;
            }
        },

        treatSingleColonSuffixesLessThanTenAsHours: function()
        {
            if (this.timeString.match(/^[0-9]:$/))
            {
                this.hours = Math.floor(Number(this.timeString.replace(/:/g,'')));
                this.minutes = 0;
                this.seconds = 0;
            }
        },

        treatSingleColonSuffixesTenAndGreaterAsMinutes: function()
        {
            if (this.timeString.match(/^[0-9][0-9]+:$/))
            {
                this.hours = 0;
                this.minutes = Math.floor(Number(this.timeString.replace(/:/g, '')));
                this.seconds = 0;
            }
        }

    });

    return {

        timeToDecimalHours: function(timeString)
        {
            return new TimeParser(timeString).getTime();
        }
    };


});