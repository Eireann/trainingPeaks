define(
[
    "jquery",
    "underscore",

    "TP",
    "views/userConfirmationView",
    "shared/utilities/formUtility",
    "utilities/conversion/conversion",

    "hbs!templates/views/errors/nameConflictTemplate",
    "hbs!templates/views/expando/unableToSaveEditsTemplate",
    "hbs!templates/views/calendar/library/exerciseDetailsView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView"
],
function(
    $,
    _,

    TP,
    UserConfirmationView,
    FormUtility,
    conversion,

    nameConflictTemplate,
    unableToSaveEditsTemplate,
    exerciseDetailsViewTemplate,
    deleteConfirmationTemplate
    )
{
    return TP.ItemView.extend(
    {
        className: "workoutDetails",
        modal: true,
        dateFormat: "M/D/YYYY",

        template:
        {
            type: "handlebars",
            template: exerciseDetailsViewTemplate
        },

        modelEvents: {
            "change:totalTimePlanned change:distancePlanned change:velocityPlanned": "reCalculate"
        },

        events:
        {
            "click #closeIcon": "close",
            "click .delete": "confirmDelete",
            "click .edit": "handleEdit",
            "click .update": "handleUpdate"
        },

        initialize: function(options)
        {
            // get more details
            this.originalModel = this.model;
            this.model = this.originalModel.clone();
            this.model.fetch();

            this.featureAuthorizer = (options && options.featureAuthorizer) ? options.featureAuthorizer : theMarsApp.featureAuthorizer;
        },

        onRender: function()
        {

            this._enableOrDisableEditing();
            this.listenTo(this.model, "change:isStructuredWorkout sync", _.bind(
                function()
                {
                    this._enableOrDisableEditing();
                    this.alignArrowTo(this.alignedTo);
                }, this)
            );

            var self = this;
            var options = { workoutTypeId: this.model.get("workoutTypeId") };

            FormUtility.bindFormToModel(this.$el, this.model, options);
            if(this.alignedTo)
            {
                this.alignArrowTo(this.alignedTo);
            }
        },

        reCalculate: function(model, value, options)
        {
            var whichFieldChanged = _.first(_.keys(model.changed));

            switch(whichFieldChanged)
            {
                case "totalTimePlanned":
                    if(this.model.has("totalTimePlanned"))
                    {
                        if(this.model.has("distancePlanned") && this.model.get("distancePlanned") > 0)
                        {
                            this._setSpeedFromTimeAndDistance();
                        }
                        else if(this.model.has("velocityPlanned") && this.model.get("velocityPlanned") > 0)
                        {
                            this._setDistanceFromTimeAndSpeed();
                        }
                    }
                    break;

                case "distancePlanned":
                    if(this.model.has("distancePlanned"))
                    {
                        if(this.model.has("totalTimePlanned") && this.model.get("totalTimePlanned") > 0)
                        {
                            this._setSpeedFromTimeAndDistance();
                        }
                        else if(this.model.has("velocityPlanned") && this.model.get("velocityPlanned") > 0)
                        {
                            this._setTimeFromDistanceAndSpeed();
                        }
                    }
                    break;

                case "velocityPlanned":
                    if(this.model.has("velocityPlanned"))
                    {
                        if(this.model.has("totalTimePlanned") && this.model.get("totalTimePlanned") > 0)
                        {
                            this._setDistanceFromTimeAndSpeed();
                        }
                        else if(this.model.has("distancePlanned") && this.model.get("distancePlanned") > 0)
                        {
                            this._setTimeFromDistanceAndSpeed();
                        }
                    }
                    break;
            }

            FormUtility.applyValuesToForm(this.$el, this.model, options);
        },

        _setSpeedFromTimeAndDistance: function()
        {
            var seconds = this.model.get("totalTimePlanned") * 3600;
            var meters = this.model.get("distancePlanned");
            var metersPerSecond = seconds > 0 && meters > 0 ? meters / seconds : null;
            this.model.set("velocityPlanned", metersPerSecond, { silent: true });
        },

        _setDistanceFromTimeAndSpeed: function()
        {
            var seconds = this.model.get("totalTimePlanned") * 3600;
            var metersPerSecond = this.model.get("velocityPlanned");
            var meters = seconds > 0 && metersPerSecond > 0 ? metersPerSecond * seconds : null;
            this.model.set("distancePlanned", meters, { silent: true });
        },

        _setTimeFromDistanceAndSpeed: function()
        {
            var meters = this.model.get("distancePlanned");
            var metersPerSecond = this.model.get("velocityPlanned");
            var seconds = meters > 0 && metersPerSecond > 0 ? meters / metersPerSecond : null;
            this.model.set("totalTimePlanned", seconds / 3600, { silent: true });
        },

        handleEdit: function(e)
        {
            e.preventDefault();
            this.$(".edit").hide();
            this.$(".update").show();
            this.$("input").removeAttr("readonly");
        },

        handleUpdate: function(e)
        {
            e.preventDefault();

            var self = this;

            self.waitingOn();
            this.model.save().done(function()
            {
                self.originalModel.set(self.model.attributes); 
                self.close();
            }).fail(function(xhr)
            {
                self._displayError(xhr);
            }).always(function()
            {
                self.waitingOff();
            });
        },

        confirmDelete: function(e)
        {
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            this.listenToOnce(this.deleteConfirmationView, "userConfirmed", this.deleteWorkout);
        },

        deleteWorkout: function(options)
        {
            var deleteWorkout = this.originalModel;

            var self = this;
            self.waitingOn();
            deleteWorkout.destroy({wait: true}).done(function()
            {
                self.close();
            }).fail(function(xhr)
            {
                self._displayError(xhr);
            }).always(function()
            {
                self.waitingOff();
            });
        },

        _displayError: function(xhr)
        {
            var errorTemplate = xhr.status === 409 ? nameConflictTemplate : unableToSaveEditsTemplate;
            var errorMessageView = new UserConfirmationView({ template: errorTemplate });
            errorMessageView.render();
        },

        alignArrowTo: function($element)
        {
            // align the top and left of this popup to the target library item
            this.alignedTo = $element;
            this.left($element.offset().left + $element.width() + 16);
            var targetTop = $element.offset().top;
            this.top(targetTop);

            // offset the arrow to line up with middle of target element
            var arrowOffset = Math.round($element.height() / 2) + 8;
            var arrowTop = arrowOffset;

            // if we're too close to the bottom, move the window up
            var windowHeight = $(window).height();
            if ((this.$el.offset().top + this.$el.height()) >= (windowHeight - 30))
            {
                this.top(windowHeight - this.$el.height() - 30);
                var myTop = this.$el.offset().top;
                arrowTop = Math.round((targetTop - myTop) + arrowOffset);
            }

            if(arrowTop > this.$el.height() - 10)
            {
                arrowTop = this.$el.height() - 10;
            }

            this.$(".arrow").css("top", arrowTop + "px");
        },

        _enableOrDisableEditing: function()
        {
            if(this.model.has("libraryOwnerId") && this.featureAuthorizer.canAccessFeature(this.featureAuthorizer.features.IsOwnerOrCoach, { athleteId: this.model.get("libraryOwnerId")}))
            {
                this.$(".actions button").prop("disabled", false);
                if(!this.model.has("isStructuredWorkout") || this.model.get("isStructuredWorkout"))
                {
                    this.$(".edit").prop("disabled", true);
                }
            }
            else
            {
                this.$(".actions button").prop("disabled", true);
            }

        }
    });
});
