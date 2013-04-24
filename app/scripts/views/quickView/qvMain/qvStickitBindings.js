define(
[
    "underscore",
    "TP"
],
function (
    _,
    TP
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
                onGet: "formatDateToDayName"
            },
            "#calendarDate":
            {
                observe: "workoutDay",
                onGet: "formatDateToCalendarDate"
            },
            "#startTimeInput":
            {
                observe: "startTime",
                events: ["changeTime"],
                onGet: "getStartTime",
                onSet: "setStartTime"
            },
            "#qv-header-distance":
            {
                observe: "distance",
                onGet: "formatDistance",
                defaultValue: "0"
            },
            "#qv-header-totaltime":
            {
                observe: "totalTime",
                onGet: "formatDuration",
                defaultValue: "0:00:00"
            },
            "#qv-header-tssactual":
            {
                observe: "tssActual",
                onGet: "formatTSS",
                defaultValue: "0"
            },
            "#qv-header-distancePlanned":
            {
                observe: "distancePlanned",
                onGet: "formatDistance",
                defaultValue: "0"
            },
            "#qv-header-totaltimePlanned":
            {
                observe: "totalTimePlanned",
                onGet: "formatDuration",
                defaultValue: "0:00:00"
            },
            "#qv-header-tssPlanned":
            {
                observe: "tssPlanned",
                onGet: "formatTSS",
                defaultValue: "0"
            }
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
                // Check for the special case where the model is still set to null and the newViewValue is empty, and abort
                //if (self.model.get("title") === null && newViewValue === "")
                //    return;

                if (self.model.get("title") !== newViewValue)
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

    _.extend(workoutQuickViewStickitBindings, TP.utils.conversion);

    return workoutQuickViewStickitBindings;

});