define(
[
    "jquery",
    "moment",
    "jqueryui/datepicker",
    "jqueryui/spinner",
    "TP",
    "models/commands/ShiftWorkouts",
    "views/userConfirmationView",
    "shared/utilities/calendarUtility",
    "hbs!templates/views/calendar/moveItems/intRangeValidationError",
    "hbs!templates/views/calendar/moveItems/dateValidationError",
    "hbs!templates/views/calendar/moveItems/shiftWizzard"
],
function(
    $,
    moment,
    datepicker,
    spinner,
    TP,
    ShiftWorkoutsCommand,
    UserConfirmationView,
    CalendarUtility,
    intRangeErrorTemplate,
    dateErrorTemplate,
    shiftWizzardTemplate
    )
{

    // convert from model YYYY-MM-DD format to user mdy or dmy format
    function formatGetDate(value)
    {
        return value ? TP.utils.datetime.format(moment.local(value)) : value;
    }

    // convert from user mdy or dmy format to model YYYY-MM-DD format
    function formatSetDate(value)
    {
        return value ? TP.utils.datetime.parse(value).format("YYYY-MM-DD") : value;
    }

    function datepickerGetDate($el, event, options)
    {
        var date = formatGetDate($el.datepicker("getDate"));
        $el.val(date);
        return date;
    }

    function datepickerSetDate($el, val, model, options)
    {
        $el.val(val);
        $el.datepicker("setDate", val);
    }

    var ShiftWizardModel = TP.Model.extend(
    {
        defaults:
        {
            selectionStartDate: "",
            selectionEndDate: "",
            selectItems: "itemsOnAllSelectedDays",
            shiftBy: "MoveToNewStartDate",
            fromDate: "",
            toDate: "",
            moveToStartDate: "",
            moveByNumberOfDays: 1,
            moveByNumberOfWeeks: 1,
            meals: "",
            workouts: "workouts"
        }
    });

    return TP.ItemView.extend(
    {
        modal:
        {
            mask: true,
            shadow: true
        },

        closeOnResize: false,

        tagName: "div",
        className: "shiftWizzard",

        events:
        {
            "click button#cancel": "onClose",
            "click button#ok": "onOkClicked"
        },

        template:
        {
            type: "handlebars",
            template: shiftWizzardTemplate
        },

        bindings:
        {
            "input[name=selectItems]":
            {
                observe: "selectItems",
                events: ["change"]
            },
            "input[name=shiftBy]":
            {
                observe: "shiftBy",
                events: ["change"]
            },

            "#fromDate":
            {
                observe: "fromDate",
                events: ["change"],
                getVal: datepickerGetDate,
                update: datepickerSetDate,
                onGet: formatGetDate,
                onSet: formatSetDate
            },

            "#toDate":
            {
                observe: "toDate",
                events: ["change"],
                getVal: datepickerGetDate,
                update: datepickerSetDate,
                onGet: formatGetDate,
                onSet: formatSetDate
            },

            "#moveToStartDate":
            {
                observe: "moveToStartDate",
                events: ["change"],
                getVal: datepickerGetDate,
                update: datepickerSetDate,
                onGet: formatGetDate,
                onSet: formatSetDate
            },

            "#moveByNumberOfDays": "moveByNumberOfDays",
            "#moveByNumberOfWeeks": "moveByNumberOfWeeks"
        },

        ui:
        {
            "fromDate": "#fromDate",
            "toDate": "#toDate",
            "moveByWeeks": "#MoveBySpecifiedNumberOfWeeks",
            "moveByDays": "#MoveBySpecifiedNumberOfDays",
            "moveToDate": "#MoveToNewStartDate"
        },

        initialize: function(options)
        {
            this.initModel(options);
        },

        initModel: function(options)
        {
            this.model = new ShiftWizardModel(options);

            // set initial from/to dates, but save selection state
            this.model.set("fromDate", this.model.get("selectionStartDate"));
            this.model.set("toDate", this.model.get("selectionEndDate"));
            this.model.set("moveToStartDate", this.model.get("fromDate"));
        },

        onRender: function ()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "shiftWizard", "eventAction": "opened", "eventLabel": "" });

            // stickit
            this.model.off("change", this.render);
            this.stickit();

            // watch for changes
            this.updateSelectItemsOptions();
            this.updateShiftByOptions();
            this.rePositionView();
            this.listenTo(this.model, "change:selectItems", this.updateSelectItemsOptions);
            this.listenTo(this.model, "change:shiftBy", this.updateShiftByOptions);

            // date picker
            this.$(".datepicker").datepicker({ dateFormat: TP.utils.datetime.formatter.getFormatForDatepicker(), firstDay: CalendarUtility.startOfWeek });

            // number picker, and make sure it fires a change event
            this.$(".numberpicker").spinner().on("spinstop", function(event, ui) { $(this).trigger("change", event, ui); });
        },

        updateSelectItemsOptions: function()
        {

            // how to move
            switch (this.model.get("selectItems"))
            {
                case "itemsOnAllSelectedDays":
                    this.ui.fromDate.attr("disabled", true);
                    this.ui.toDate.attr("disabled", true);
                    this.model.set("fromDate", "");
                    this.model.set("toDate", "");
                    break;

                case "ItemsWithinSpecifiedDateRange":
                    this.ui.fromDate.removeAttr("disabled");
                    this.ui.toDate.removeAttr("disabled");
                    this.model.set("fromDate", this.model.get("selectionStartDate"));
                    this.model.set("toDate", this.model.get("selectionEndDate"));
                    break;

                case "ItemsOnAfterSpecifiedStartDate":
                    this.ui.fromDate.removeAttr("disabled");
                    this.ui.toDate.attr("disabled", true);
                    this.model.set("fromDate", this.model.get("selectionStartDate"));
                    this.model.set("toDate", "");
                    break;
            }
        },

        updateShiftByOptions: function()
        {

            // where to move
            switch (this.model.get("shiftBy"))
            {
                case "MoveToNewStartDate":
                    this.ui.moveByDays.hide();
                    this.ui.moveByWeeks.hide();
                    this.ui.moveToDate.show();
                    break;

                case "MoveBySpecifiedNumberOfDays":
                    this.ui.moveByDays.show();
                    this.ui.moveByWeeks.hide();
                    this.ui.moveToDate.hide();
                    break;

                case "MoveBySpecifiedNumberOfWeeks":
                    this.ui.moveByDays.hide();
                    this.ui.moveByWeeks.show();
                    this.ui.moveToDate.hide();
                    break;
            }
        },

        onOkClicked: function()
        {
            this.validateFields().done(this.doShift).fail(this.showErrorMessage);
        },

        doShift: function()
        {
            // show throbber
            this.onWaitStart();

            // setup shift command
            if (this.model.get("workouts"))
            {
                TP.analytics("send", { "hitType": "event", "eventCategory": "shiftWizard", "eventAction": "shiftStarted", "eventLabel": "" });

                var shiftCommand = new ShiftWorkoutsCommand();
                this.configureShiftCommand(shiftCommand);

                // execute = send it to server
                var deferred = shiftCommand.execute();

                // close this view when remote command finishes
                var self = this;
                deferred.always(function() { self.onClose(); });
            }
            else
                this.onClose();
        },

        onClose: function()
        {
            this.unstickit();
            this.close();
        },

        configureShiftCommand: function(shiftCommand)
        {

            // how to move
            switch (this.model.get("selectItems"))
            {
                case "itemsOnAllSelectedDays":
                    shiftCommand.set("startDate", this.model.get("selectionStartDate"));
                    shiftCommand.set("endDate", this.model.get("selectionEndDate"));
                    break;

                case "ItemsWithinSpecifiedDateRange":
                    shiftCommand.set("startDate", this.model.get("fromDate"));
                    shiftCommand.set("endDate", this.model.get("toDate"));
                    break;

                case "ItemsOnAfterSpecifiedStartDate":
                    shiftCommand.set("startDate", this.model.get("fromDate"));
                    break;
            }


            // where to move
            switch (this.model.get("shiftBy"))
            {
                case "MoveToNewStartDate":
                    shiftCommand.set("days", moment.local(this.model.get("moveToStartDate")).diff(moment.local(shiftCommand.get("startDate")), "days"));
                    break;

                case "MoveBySpecifiedNumberOfDays":
                    shiftCommand.set("days", this.model.get("moveByNumberOfDays"));
                    break;

                case "MoveBySpecifiedNumberOfWeeks":
                    shiftCommand.set("days", this.model.get("moveByNumberOfWeeks") * 7);
                    break;
            }

        },

        validateFields: function()
        {

            var deferred = new $.Deferred();

            // how to move
            switch (this.model.get("selectItems"))
            {
                case "itemsOnAllSelectedDays":
                    // no date range inputs to validate
                    break;

                case "ItemsWithinSpecifiedDateRange":
                    this.validateDate("fromDate", deferred);
                    this.validateDate("toDate", deferred);
                    break;

                case "ItemsOnAfterSpecifiedStartDate":
                    this.validateDate("fromDate", deferred);
                    break;
            }


            // where to move
            switch (this.model.get("shiftBy"))
            {
                case "MoveToNewStartDate":
                    this.validateDate("moveToStartDate", deferred);
                    break;

                case "MoveBySpecifiedNumberOfDays":
                    this.validateInt("moveByNumberOfDays", deferred);
                    break;

                case "MoveBySpecifiedNumberOfWeeks":
                    this.validateInt("moveByNumberOfWeeks", deferred);
                    break;
            }

            deferred.resolveWith(this);

            return deferred;
        },

        showErrorMessage: function(messageTemplate)
        {
            this.errorMessageView = new UserConfirmationView({ template: messageTemplate });
            this.errorMessageView.render();
        },

        validateInt: function(attributeName, deferred)
        {
            var value = this.model.get(attributeName);
            if (!value || isNaN(value) || Math.abs(Number(value)) > 1000)
            {
                deferred.rejectWith(this, [intRangeErrorTemplate]);
            }
        },

        validateDate: function(attributeName, deferred)
        {
            var value = this.model.get(attributeName);
            if (!value || !moment.local(value, "YYYY-MM-DD").isValid())
            {
                deferred.rejectWith(this, [dateErrorTemplate]);
            }
        }

    });
});
