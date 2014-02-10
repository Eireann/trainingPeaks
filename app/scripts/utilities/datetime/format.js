define(
[
    "underscore",
    "moment"
],
function(_, moment)
{

    var DateTimeFormatter = function(options) {
        this.options = options || {};
    };

    _.extend(DateTimeFormatter.prototype, {

        // TP.utils.datetime.format
        format: function(momentParseableDate, formatString)
        {
            if(momentParseableDate)
            {
                var momentDate = moment.isMoment(momentParseableDate) ? momentParseableDate : moment(momentParseableDate);
                formatString = this._getNamedDateFormatString(formatString, momentDate);
                formatString = this._convertFormatStringToUserPreferredDateFormat(formatString);

                return momentDate.format(formatString);
            }
            else
            {
                return "";
            }
        },

        // TP.utils.datetime.parse
        parse: function(momentParseableDate, parseFormat)
        {
            if(!parseFormat)
            {
                parseFormat = this._defaultDateFormatString;
            }
            parseFormat = this._convertFormatStringToUserPreferredDateFormat(parseFormat);
            return moment(momentParseableDate, parseFormat);
        },

        // TP.utils.datetime.formatter.decimalSecondsAsTime
        decimalSecondsAsTime: function(seconds, defaultValueIfEmpty)
        {
            var hours = seconds ? Number(seconds) / 3600 : 0;
            return this.decimalHoursAsTime(hours, true, defaultValueIfEmpty);
        },

        // TP.utils.datetime.formatter.decimalHoursAsTime
        decimalHoursAsTime: function(hours, showSeconds, defaultValueIfEmpty, showDecimalSeconds)
        {
            var defaultTime = (showSeconds === true) ? "0:00:00" : "00:00";
            if (_.isNumber(defaultValueIfEmpty) || _.isString(defaultValueIfEmpty))
            {
                defaultTime = defaultValueIfEmpty;
            }

            if (_.isString(hours))
            {
                hours = Number(hours);
            }

            if (typeof showSeconds !== 'boolean')
            {
                showSeconds = true;
            }

            if (typeof showDecimalSeconds !== 'boolean')
            {
                showDecimalSeconds = false;
            }

            if (hours >= 1)
            {
                showDecimalSeconds = false;
            }

            if (!hours || hours <= 0.00001)
            {

                return defaultTime;
            }

            var fullHours = Math.floor(hours);
            var exactMinutes = (hours % 1) * 60;
            var exactSeconds = (exactMinutes % 1) * 60;
            var fullMinutes = 0;
            var fullSeconds = 0;

            if (showSeconds)
            {
                fullMinutes = Math.floor(exactMinutes);

                // if toFixed would leave anything besides .00, display it, otherwise truncate it
                if (showDecimalSeconds && (exactSeconds.toFixed(2) % 1) >= 0.01)
                {
                    fullSeconds = exactSeconds.toFixed(2);
                } else
                {
                    fullSeconds = Math.round(exactSeconds);
                }

                // math precision error? 1:20 becomes 1:19:60, 2:40 becomes 2:39:60, etc
                if (fullSeconds >= 60)
                {
                    fullMinutes += 1;
                    fullSeconds -= 60;
                }
            }
            else
            {
                fullMinutes = Math.round(exactMinutes);
            }

            if (fullMinutes >= 60)
            {
                fullHours += 1;
                fullMinutes -= 60;
            }

            var time = [];

            if(!showDecimalSeconds || fullHours > 0)
            {
                time.push(fullHours); 
            }


            if (fullMinutes >= 10)
                time.push(fullMinutes);
            else
                time.push("0" + fullMinutes);
                
            if (showSeconds)
            {

                if (fullSeconds >= 10)
                    time.push(fullSeconds);
                else
                    time.push("0" + fullSeconds);
            }

            return time.join(":");
        },

        // TP.utils.datetime.formatter.decimalMinutesAsTime
        decimalMinutesAsTime: function(minutes, showSeconds, defaultValueIfEmpty, showDecimalSeconds)
        {
            var formattedMinutes = this.decimalHoursAsTime(minutes / 60, showSeconds, defaultValueIfEmpty, showDecimalSeconds);

            // Special handling for less than 1 hour of duration. Using 59.9999 instead of 60 minutes
            // to deal with floating point precision issues. 0.0001 minutes is in the order of hundredths of seconds,
            // not an issue on output.
            if(minutes < 59.9999)
            {
                var parts = formattedMinutes.split(":");
                parts.shift();
                formattedMinutes = parts.join(":");
            }

            return formattedMinutes;
        },

        // TP.utils.datetime.formatter.getFormatForDatepicker
        getFormatForDatepicker: function()
        {
            var userFormat = this._getAppUserDateFormat();
            if(userFormat === "mdy")
            {
                return "m/d/yy";
            }
            else
            {
                return "d/m/yy";
            }
        },

        _defaultUserDateFormat: "mdy",
        _defaultDateFormatString: "M/D/YYYY",

        _getCalendarDayFormatStringForMoment: function(momentDate)
        {
            if (momentDate.dayOfYear() === 1) // firstday of year
                return "MMM D YYYY";
            else if (momentDate.date() === 1) // firstday of month
                return "MMM D";
            else
                return "D";
        },

        _getNamedDateFormatString: function(formatString, momentDate)
        {
            if (!formatString || typeof formatString !== "string")
            {
                formatString = this._defaultDateFormatString;
            }

            switch(formatString)
            {
                case "calendarDay":
                    return this._getCalendarDayFormatStringForMoment(momentDate);
                default:
                    return formatString; 
            } 
        },

        _getAppUserDateFormat: function()
        {
            if(this.options.dateFormat)
            {
                return this.options.dateFormat;
            }
            else
            {
                var user = this.options.user ? this.options.user : theMarsApp.user;

                if(!user || !user.has("dateFormat"))
                {
                    return this._defaultUserDateFormat;
                } 

                var userDateFormat = user.get("dateFormat");

                if(!_.contains(["mdy", "dmy"], userDateFormat))
                {
                    return this._defaultUserDateFormat;
                }

                return userDateFormat;
            }

        },
        
        // convert based on user preferences
        // converts "L" date format to appropriate MM/DD/YYYY format
        // converts separators - to /
        // swaps order of M and D units if both are present
        _convertFormatStringToUserPreferredDateFormat: function(formatString)
        {

            // any year-first dates - YYYY-MM-DD etc, are most likely used as sortable keys, so don't reorder them
            if(formatString.indexOf("YY") === 0)
            {
                return formatString;
            }

            // convert - separators to / instead
            formatString = formatString.replace(/ *- */g,"/");

            // convert L and LT to more verbose formats
            formatString = formatString.replace(/\bL\b/g,this._defaultDateFormatString).replace(/\bLT\b/g,"h:mm a");

            // split on any word type characters
            var formatParts = formatString.split(/\b/);
            var monthIndex = -1;
            var dayIndex = -1;
            _.each(formatParts, function(part, index)
            {
                if(monthIndex === -1 && /^M+$/.test(part))
                {
                    monthIndex = index;
                }

                if(dayIndex === -1 && /^D+$/.test(part))
                {
                    dayIndex = index;
                }
            });

            if(dayIndex >= 0 && monthIndex >= 0)
            {
                var userDateFormat = this._getAppUserDateFormat();
                if((userDateFormat === "mdy" && monthIndex > dayIndex) || (userDateFormat === "dmy" && dayIndex > monthIndex))
                {
                    var monthPart = formatParts[monthIndex];
                    var dayPart = formatParts[dayIndex];
                    formatParts[monthIndex] = dayPart;
                    formatParts[dayIndex] = monthPart;
                    return formatParts.join('');
                }
            }

            return formatString;
        }

    });

    return DateTimeFormatter;
});
