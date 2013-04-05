define(
[
    "jquerySelectBox",
    "jqueryui/datepicker",
    "jqueryTimepicker",
    "jqueryTextAreaResize",
    "underscore",
    "moment",
    "TP",
    "utilities/printDate",
    "utilities/printUnitLabel",
    "utilities/convertToViewUnits",
    "utilities/convertToModelUnits",
    "utilities/printTimeFromDecimalHours",
    "utilities/convertTimeHoursToDecimal",
    "models/workoutFileData",
    "models/workoutFileAttachment",
    "views/userConfirmationView",
    "utilities/workoutFileReader",
    "utilities/workoutLayoutFormatter",
    "views/quickView/workoutTypeMenuView",
    "views/quickView/workoutQuickViewMenu",
    "views/quickView/summaryView",
    "utilities/determineCompletedWorkout",
    "hbs!templates/views/quickView/workoutQuickView",
    "hbs!templates/views/deleteConfirmationView",
    "hbs!templates/views/discardConfirmationView"
],
function (
    selectBox,
    datepicker,
    timepicker,
    textAreaResize,
    _,
    moment,
    TP,
    printDate,
    printUnitLabel,
    convertToViewUnits,
    convertToModelUnits,
    printTimeFromDecimalHours,
    convertTimeHoursToDecimal,
    WorkoutFileData,
    WorkoutFileAttachment,
    UserConfirmationView,
    WorkoutFileReader,
    workoutLayoutFormatter,
    WorkoutTypeMenuView,
    WorkoutQuickViewMenu,
    WorkoutQuickViewSummary,
    determineCompletedWorkout,
    workoutQuickViewTemplate,
    deleteConfirmationTemplate,
    discardConfirmationTemplate)
{
    return TP.ItemView.extend(
    {
        modal: {
            mask: true,
            shadow: true
        },
        
        today: moment().format("YYYY-MM-DD"),

        className: "workoutQuickView",

        showThrobbers: false,

        events:
        {
            "click #breakThrough": "onBreakThroughClicked",
            "click #delete": "onDeleteWorkout",
            "click #discard": "onDiscardClicked",
            "click #close": "onCloseClicked",
            "click #date": "onDateClicked",
            "click #quickViewFileUploadDiv": "onUploadFileClicked",
            "change input[type='file']#fileUploadInput": "onFileSelected",
            "change input[type='file']#attachment": "onAttachmentFileSelected",
            "click .workoutIcon": "onWorkoutIconClicked",
            "click .addAttachment": "onAddAttachmentClicked",
            "click #menuIcon": "onMenuIconClicked",
            "click #closeIcon": "onCloseClicked"
        },

        ui:
        {
            "date": "#date",
            "fileinput": "input[type='file']#fileUploadInput",
            "attachmentinput": "input[type='file']#attachment",
            "quickViewContent": "#quickViewContent"
        },

        initialize: function()
        {
            _.bindAll(this, "onUploadDone", "onUploadFail");

            this.views =
            {
                workoutQuickViewSummary: new WorkoutQuickViewSummary({model: this.model})
            };
            
            this.activeTabName = null;
        },

        onShow: function()
        {

        },

        template:
        {
            type: "handlebars",
            template: workoutQuickViewTemplate
        },

        bindings:
        {
            "#workoutTitleField":
            {
                observe: "title"
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
                onGet: "getDistance"
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
            return convertToViewUnits(value, "distance", null, 0);
        },

        getComplianceCssClassName: function ()
        {
            var complianceAttributeNames =
            {
                totalTime: "totalTimePlanned"
            };
            /*
                distance: "distancePlanned",
                tssActual: "tssPlanned"
            */
            var workout = this.model;

            for (var key in complianceAttributeNames)
            {

                var plannedValueAttributeName = complianceAttributeNames[key];
                var completedValueAttributeName = key;
                var plannedValue = this.model.get(plannedValueAttributeName) ? this.model.get(plannedValueAttributeName) : 0;
                var completedValue = this.model.get(completedValueAttributeName) ? this.model.get(completedValueAttributeName) : 0;

                if (plannedValue)
                {
                    if ((plannedValue * 0.8) <= completedValue && completedValue <= (plannedValue * 1.2))
                    {
                        return "ComplianceGreen";
                    }
                    else if ((plannedValue * 0.5) <= completedValue && completedValue <= (plannedValue * 1.5))
                    {
                        return "ComplianceYellow";
                    }
                    else
                    {
                        return "ComplianceRed";
                    }
                }
            }


            // if nothing was planned, we can't fail to complete it properly ...

            return "ComplianceGreen";
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
            } catch(e)
            {
                return value;
            }
        },

        setStartTime: function(value, options)
        {
            try
            {
                return this.model.getCalendarDay() + "T" + moment(value, "h:mm a").format("HH:mm");
            } catch(e)
            {
                return value;
            }
        },

        onModelChanged: function()
        {
            this.updateHeaderClass();
            
            if (!_.isEmpty(this.model.changed))
            {
                this.enableDiscardButton();
                this.model.save();
            }
        },

        enableDiscardButton: function()
        {
            this.$("button#discard").removeAttr("disabled");
            this.$("button#discard").css("color", this.discardButtonColor);
        },
        
        onDiscardClicked: function()
        {
            this.discardConfirmation = new UserConfirmationView({ template: discardConfirmationTemplate });
            this.discardConfirmation.render();
            this.discardConfirmation.on("userConfirmed", this.onDiscardChangesConfirmed, this);
        },
        
        onDiscardChangesConfirmed: function()
        {
            // Only discard changes and save if we already have an id (if the workout is not new)
            if (this.model.id)
                this.model.revert();

            this.trigger("discard");
            this.close();
        },

        onCloseClicked: function()
        {
            this.model.save();
            this.trigger("saveandclose");
            
            this.close();
        },

        onDeleteWorkout: function()
        {
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("userConfirmed", this.onDeleteWorkoutConfirmed, this);
        },

        onDeleteWorkoutConfirmed: function()
        {
            this.close();
            // pass wait here so it won't actually remove the model until the server call returns,
            // which will then remove the view and the waiting indicator
            this.model.destroy({ wait: true });
        },

        onBreakThroughClicked: function()
        {
            var description = this.model.get("description");

            if (!description)
                description = "";

            if (description.indexOf("BT: ") !== 0)
            {
                this.model.set("description", "BT: " + description);
                this.$("#breakThrough img").attr("src", "assets/images/QVImages/breakThroughFullOpac.png");
            } else
            {
                this.$("#breakThrough img").attr("src", "assets/images/QVImages/breakthrough.png");
                description = description.replace(/BT: /, "");
                this.model.set("description", description);
            }
        },

        onRender: function()
        {
            if (!this.renderInitialized)
            {
                this.model.checkpoint();
                
                this.model.off("change", this.render);
                this.model.on("change", this.onModelChanged, this);

                this.stickit();
                this.renderInitialized = true;

                this.$("#startTimeInput").timepicker({ appendTo: this.$el, 'timeFormat': 'g:i a' });

                for (var tabName in this.views)
                {
                    var tab = this.views[tabName];
                    tab.render();
                    this.ui.quickViewContent.append(tab.$el);
                }

                this.discardButtonColor = this.$("button#discard").css("color");
                this.$("button#discard").css("color", "grey");
            }

            this.updateHeaderClass();
        },

        onClose: function()
        {
            this.model.off("change", this.onModelChanged);
        },
        
        updateHeaderClass: function ()
        {
            // first calculate it, then reset if needed
            var tmpElement = $("<div></div>").addClass("grayHeader").addClass("workout");
            tmpElement.addClass(this.getComplianceCssClassName());
            tmpElement.addClass(this.getPastOrCompletedCssClassName());

            var header = this.$(".grayHeader");
            if (header.attr("class") !== tmpElement.attr("class"))
            {
                header.attr("class", tmpElement.attr("class"));
            }
            this.$(".grayHeader").addClass(this.getComplianceCssClassName());
            this.$(".grayHeader").addClass(this.getPastOrCompletedCssClassName());

            this.$(".chzn-select").chosen();
            
        },

        getPastOrCompletedCssClassName: function ()
        {
            if (this.model.getCalendarDay() < this.today)
            {
                return "past";
            } else if (this.model.getCalendarDay() === this.today && determineCompletedWorkout(this.model.attributes))
            {
                return "past";
            } else
            {
                return "future";
            }
        },
        
        onDateClicked: function (e)
        {
            _.bindAll(this, "onDateChanged");
            var position = [this.ui.date.offset().left, this.ui.date.offset().top + this.ui.date.height()];
            var settings = { dateFormat: "yy-mm-dd", firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex };
            var widget = this.ui.date.datepicker("dialog", this.model.getCalendarDay(), this.onDateChanged, settings, position).datepicker("widget");

            // because jqueryui sets useless values for these ...
            widget.css("z-index", Number(this.$el.css("z-index") + 1)).css("opacity", 1);
        },

        onDateChanged: function (newDate)
        {
            var newDay = moment(newDate).format(this.model.shortDateFormat);
            this.ui.date.datepicker("hide");
            var oldDay = this.model.getCalendarDay();
            if (newDay !== oldDay)
            {
                var workout = this.model;
                workout.trigger("workout:move", this.model, newDay);
            }
        },

        onUploadFileClicked: function ()
        {
            this.ui.fileinput.click();
        },

        onFileSelected: function()
        {

            this.waitingOn();
            this.isNew = this.model.get("workoutId") ? false : true;

            var self = this;
            var saveDeferral = this.model.save();

            var fileList = this.ui.fileinput[0].files;

            var workoutReader = new WorkoutFileReader(fileList[0]);
            var readDeferral = workoutReader.readFile();
            $.when(saveDeferral, readDeferral).done(function (saveArgs, readArgs)
            {
                var dataAsString = readArgs;
                self.uploadedFileDataModel = new WorkoutFileData({ workoutId: self.model.get("workoutId"), workoutDay: self.model.get("workoutDay"), startTime: self.model.get("startTime"), data: dataAsString });
                self.uploadedFileDataModel.save().done(self.onUploadDone).fail(self.onUploadFail);
            });
        },

        onUploadDone: function ()
        {
            this.waitingOff();

            this.model.set(this.uploadedFileDataModel.get("workoutModel"));
            if (this.isNew)
                this.trigger("saved");
        },

        onUploadFail: function ()
        {
            this.waitingOff();
        },

        onWorkoutIconClicked: function ()
        {
            var offset = this.$(".workoutIcon").offset();
            var typesMenu = new WorkoutTypeMenuView({ workoutTypeId: this.model.get("workoutTypeValueId") });
            typesMenu.on("selectWorkoutType", this.onSelectWorkoutType, this);
            typesMenu.render().right(offset.left - 5).top(offset.top - 15);
        },

        onSelectWorkoutType: function (workoutTypeId)
        {
            this.model.set("workoutTypeValueId", workoutTypeId);
        },

        onAddAttachmentClicked: function()
        {
            this.ui.attachmentinput.click();
        },

        onAttachmentFileSelected: function()
        {
            _.bindAll(this, "uploadAttachment");
            this.waitingOn();
            var file = this.ui.attachmentinput[0].files[0];
            var workoutReader = new WorkoutFileReader(file);
            var readDeferral = workoutReader.readFile();

            var self = this;
            readDeferral.done(function(fileContentsEncoded)
            {
                self.uploadAttachment(file.name, fileContentsEncoded);
            });
        },

        uploadAttachment: function(fileName, data)
        {
            var attachment = new WorkoutFileAttachment({
                fileName: fileName,
                description: fileName,
                data: data,
                workoutId: this.model.id
            });

            var self = this;
            attachment.save().done(function()
            {
                self.waitingOff();
            });
        },

        onMenuIconClicked: function()
        {
            var offset = this.$("#menuIcon").offset();
            var menu = new WorkoutQuickViewMenu({ model: this.model });
            menu.on("delete", this.onDelete, this);
            menu.on("cut", this.close, this);
            menu.on("copy", this.close, this);
            menu.render().bottom(offset.top).left(offset.left - 20);
        },

        onDelete: function()
        {
            this.waitingOn();
            var self = this;
            var callback = function()
            {
                self.close();
            };

            this.model.destroy({ wait: true }).done(callback);
        }

    });
});