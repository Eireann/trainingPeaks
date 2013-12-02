define(
[
    "underscore",
    "moment",
    "TP"
],
function (
    _,
    moment,
    TP
)
{
    var workoutQuickViewStickitBindings =
    {
        initializeStickit: function()
        {
            this.bindings = _.clone(this.bindings);
            this.addModelToBindings();
            this.on("render", this.stickitOnRender, this);
            this.listenTo(this.model, "change:workoutDay", _.bind(this._stickitOnDateChanged, this));
            this._stickitOnDateChanged();
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

        restickit: function()
        {
            if(this.stickitInitialized)
            {
                this.unstickit();
                this.stickit();
            }
        },

        _stickitOnDateChanged: function()
        {
            var today = moment().startOf("day");
            var date = moment(this.model.get("workoutDay"));
            var planned = date > today;

            var timeAttribute = planned ? "startTimePlanned" : "startTime";

            this.bindings["#startTimeInput"].observe = timeAttribute;

            this.restickit();
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
                events: ["change", "cut", "paste"],
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
            },
            "#qv-header-tssSource":
            {
                observe: "tssSource",
                onGet: "formatTSSLabel",
                defaultValue: "TSS"
            }
        },

        formatTSSLabel: function(value, options)
        {
            return TP.utils.units.getUnitsLabel("tss", this.model.get("workoutTypeValueId"), this.model);
        },

        getStartTime: function(value, options)
        {
            value = value || this.model.get("startTime") || this.model.get("startTimePlanned");

            try
            {
                return value ? moment(value).format("h:mm a") : "";
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
                return value ? this.model.getCalendarDay() + "T" + moment(value, "h:mm a").format("HH:mm") : null;
            }
            catch (e)
            {
                return null;
            }
        },

        updateTitle: function(newViewValue, options)
        {
            var self = this;
            var updateModel = function ()
            {
                if (self.model.get("title") !== newViewValue)
                {
                    var newModelValue = newViewValue;
                    self.model.set("title", newModelValue);
                    self.model.save();
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
        },
        
        addModelToBindings: function ()
        {
            _.each(this.bindings, function (binding)
            {
                binding.model = this.model;
            }, this);
        }

    };

    _.extend(workoutQuickViewStickitBindings, TP.utils.conversion);

    return workoutQuickViewStickitBindings;

});
