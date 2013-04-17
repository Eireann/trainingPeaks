define(
[
    "utilities/printDate",
    "utilities/printUnitLabel",
    "utilities/printTimeFromDecimalHours",
    "utilities/conversion"
],
function (
    printDate,
    printUnitLabel,
    printTimeFromDecimalHours,
    conversion
)
{
    var workoutQuickViewStickitBindings =
    {
        initializeStickit: function()
        {
            this.on("render", this.stickitOnRender, this);
        },

        stickitOnRender: function()
        {
            if (!this.stickitInitialized)
            {
                this.model.off("change", this.render);
                this.stickit();
                this.stickitInitialized = true;
            }
        },

        bindings:
        {
            "#workoutTitleField":
            {
                observe: "title",
                updateModel: "updateTitle"
            },
            "#dayName":
            {
                observe: "workoutDay",
                onGet: "getDayName"
            },
            "#calendarDate":
            {
                observe: "workoutDay",
                onGet: "getCalendarDate"
            },
            "#startTimeInput":
            {
                observe: "startTime",
                eventsOverride: ["changeTime"],
                onGet: "getStartTime",
                onSet: "setStartTime"
            },
            "#qv-header-distance":
            {
                observe: "distance",
                onGet: "getDistance",
                updateModel: ""
            },
            "#qv-header-totaltime":
            {
                observe: "totalTime",
                onGet: "getTime"
            },
            "#qv-header-tssactual":
            {
                observe: "tssActual",
                onGet: "getTss"
            },
            "#qv-header-distancePlanned":
            {
                observe: "distancePlanned",
                onGet: "getDistance"
            },
            "#qv-header-totaltimePlanned":
            {
                observe: "totalTimePlanned",
                onGet: "getTime"
            },
            "#qv-header-tssPlanned":
            {
                observe: "tssPlanned",
                onGet: "getTss"
            }
        },

        getTime: function(value, options)
        {
            return printTimeFromDecimalHours(value, true);
        },

        getTss: function(value, options)
        {
            return value ? value : 0;
        },

        getDistance: function(value, options)
        {
            return conversion.convertToViewUnits(value, "distance", 0);
        },

        getDayName: function(value, options)
        {
            return printDate(value, "dddd");
        },

        getCalendarDate: function(value, options)
        {
            return printDate(value, "MMM DD, YYYY");
        },

        getStartTime: function(value, options)
        {
            try
            {
                return moment(value).format("h:mm a");
            }
            catch (e)
            {
                return value;
            }
        },

        setStartTime: function(value, options)
        {
            try
            {
                return this.model.getCalendarDay() + "T" + moment(value, "h:mm a").format("HH:mm");
            }
            catch (e)
            {
                return value;
            }
        },
        
        updateTitle: function(newViewValue, options)
        {
            var self = this;

            var updateModel = function ()
            {
                if (self.model.get("title") !== "newViewValue")
                {
                    var newModelValue = newViewValue;
                    self.model.set("title", newModelValue);
                    var modelUpdatePromise = self.model.save();

                    modelUpdatePromise.done(function ()
                    {
                    });
                }
            };

            if (this.updateModelTimeout)
                clearTimeout(this.updateModelTimeout);

            // TODO: This required a hack at line ~100 of the Backbone.StickIt library in order to work
            // properly. There does not seem to be any other way to catch which type of event triggered
            // this update request.
            if (options.eventType === "blur")
                updateModel();
            else
                this.updateModelTimeout = setTimeout(updateModel, 2000);

            return false;
        }

    };

    return workoutQuickViewStickitBindings;

});