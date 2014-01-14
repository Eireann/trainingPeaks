﻿define(
[
    "underscore"
], function(_)
{

    function TimeParser(timeString, options)
    {
        this.timeString = timeString.trim();
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.decimalHours = null;

        this.options = {
            assumeHours: true
        };

        _.extend(this.options, options);
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

            var seconds = this.seconds.toFixed(2);
            hours += seconds / 3600;
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
                if (this.options.assumeHours)
                {
                    parts.push("0");
                } else
                {
                    parts.unshift("0");
                }
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

            if (!this.options.assumeSeconds && this.timeString.match(/^[0-9]+$/) && this.timeString >= 0 && this.timeString <= 9)
            {
                if (this.options.assumeHours)
                {
                    this.hours = Number(this.timeString);
                    this.minutes = 0;
                    this.seconds = 0;
                } else
                {
                    this.minutes = Number(this.timeString);
                    this.hours = 0;
                    this.seconds = 0;
                }
            }
        },

        treatIntegersTenAndGreaterAsMinutes: function()
        {
            if (!this.options.assumeSeconds && this.timeString.match(/^[0-9]+$/) && this.timeString >= 0 && this.timeString > 9)
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
                if (this.options.assumeHours)
                {
                    this.hours = Math.floor(Number(this.timeString));
                    this.minutes = (Number(this.timeString) % 1) * 60;
                    this.seconds = 0;
                } else
                {
                    this.minutes = Math.floor(Number(this.timeString));
                    this.seconds = (Number(this.timeString) % 1) * 60;
                    this.hours = 0;
                }

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

        timeToDecimalHours: function(timeString, options)
        {
            return new TimeParser(timeString, options).getTime();
        },

        millisecondsToDecimalHours: function(milliseconds)
        {
            return (milliseconds / 1000) / 3600;
        }
    };


});