define(
[
    "underscore",
    "setImmediate",
    "jqueryui/widget",
    "jquerySelectBox",
    "TP",
    "utilities/workout/formatPeakTime",
    "utilities/workout/formatPeakDistance",
    "models/workoutStatsForRange",
    "hbs!templates/views/expando/lapTemplate",
    "hbs!templates/views/expando/lapsTemplate"
],
function(
    _,
    setImmediate,
    jqueryUiWidget,
    jquerySelectBox,
    TP,
    formatPeakTime,
    formatPeakDistance,
    WorkoutStatsForRange,
    lapTemplate,
    lapsTemplate
)
{

    var LapView = TP.ItemView.extend(
    {

        tagName: "li",
        className: "lap",

        template:
        {
            type: "handlebars",
            template: lapTemplate,
        },

        modelEvents:
        {
            "change:isFocused": "_onFocusedChange",
            "change:isSelected": "_onSelectedChange"
        },

        events:
        {
            "click span": "_onClick",
            "change input": "_onInputChange",
            "click .edit": "_onClickEdit",
            "click .cancel": "_onClickCancel"
        },

        initialize: function(options)
        {
            this.stateModel = options.stateModel;
            this.listenTo(this.model, 'change:name', this._onNameChange);
        },

        onRender: function()
        {
            this._onFocusedChange();
            this._onSelectedChange();
        },

        serializeData: function()
        {
            var data = LapView.__super__.serializeData.apply(this, arguments);
            if(data.formattedValue)
            {
                data.name += " (" + data.formattedValue + ")";
            }
            return data;
        },

        _onNameChange: function()
        {
            this.render();
            this.stateModel.trigger('change:primaryRange');
            this.previousLapName = this.$('.editLapName').html();
        },

        _onFocusedChange: function()
        {
            this.$el.toggleClass("highlight", !!this.model.get("isFocused"));
            if(!this.$('.editLapName').hasClass('editing')) this.$('.actions').hide();
        },

        _onSelectedChange: function()
        {
            this.$("input").attr("checked", !!this.model.get("isSelected"));
        },

        _onClick: function(e)
        {
            this.stateModel.set("primaryRange", this.model);
            this.$('.actions').show();
        },

        _onClickEdit: function(e)
        {
            $editInput = this.$('.editLapName');
            if($editInput.hasClass('editing'))
            {
                return false;
            }
            else
            {
                this.previousLapName = $editInput.html();
                $editInput.html('<input type=text>').addClass('editing').find('input').focus();
            }
        },

        _onClickCancel: function(e)
        {
            this.$('.actions').hide();
            this.$('.editLapName').html(this.previousLapName).removeClass('editing');
        },

        _onInputChange: function(e)
        {
            if(this.$("input").is(":checked"))
            {
                this.stateModel.get("ranges").add(this.model);
            }
            else
            {
                this.stateModel.get("ranges").remove(this.model);
            }
        }

    });

    var LapsView = TP.CompositeView.extend(
    {

        className: "expandoLaps",
        
        itemView: LapView,
        itemViewContainer: ".rangesList ul",

        template:
        {
            type: "handlebars",
            template: lapsTemplate
        },

        events:
        {
            "click .uncheck": "_onUncheckClick",
            "change select.peakType": "_onPeakTypeChange"
        },

        initialize: function(options)
        {

            var self = this;

            if(!options.stateModel)
            {
                throw new Error("Laps view requires an expando state model");
            }

            this.collection = new TP.Collection([], { model: WorkoutStatsForRange });
            this.itemViewOptions = _.extend(this.itemViewOptions || {}, { stateModel: options.stateModel });
            this.stateModel = options.stateModel;


            this.listenTo(this.stateModel.get("ranges"), "add", function(range)
            {
                if(range.get("temporary"))
                {
                    self.collection.unshift(range);
                }
            });

            this.listenTo(this.stateModel.get("ranges"), "remove", function(range)
            {
                if(range.get("temporary"))
                {
                    self.collection.remove(range);
                }
            });

            this.listenTo(this.model.get("detailData"), "change:channelCuts", _.bind(this.render, this));
            this.listenTo(this.model.get("detailData"), "reset", _.bind(this.render, this));
        },

        serializeData: function()
        {
            return {
                selectOptions: this._getSelectOptions(),
                hasLapsOrPeaks: true
            };
        },

        appendHtml: function(collectionView, itemView, index)
        {
            var model = collectionView.collection.at(index + 1);
            var prevView = model ? collectionView.children.findByModel(model) : null;
            if(prevView)
            {
                prevView.$el.before(itemView.$el);
            }
            else
            {
                LapsView.__super__.appendHtml.apply(collectionView, arguments);
            }
        },

        onRender: function()
        {
            setImmediate(function()
            {
                this.$("select").selectBoxIt();
            });

            if(this.model.get("detailData").has("channelCuts"))
            {
                this.$el.addClass("disabled");
            }
            else
            {
                this.$el.removeClass("disabled");
            }
        },

        onShow: function()
        {
            this._updateCollection();
        },

        _updateCollection: function()
        {
            var detailData = this.model.get("detailData");
            var lapsCollection = detailData.getRangeCollectionFor("laps");
            var lapRanges = lapsCollection.models;

            this.listenTo(lapsCollection, "reset", _.bind(this._updateCollection, this));

            var ranges = lapRanges.slice();

            if(detailData.get("totalStats"))
            {
                ranges.push(this._asRangeModel(detailData.get("totalStats"), { hasLoaded: true, name: "Entire Workout" }));
            }

            var peakType = this.$("select.peakType").val();
            ranges = ranges.concat(this._getPeaksData(peakType));

            this.collection.set(ranges);
        },

        _asRangeModel: function(attrs, extra)
        {
            attrs = _.extend({}, attrs, extra);
            attrs.workoutId = this.model.id;
            var range = new WorkoutStatsForRange(attrs);
            return range;
        },

        _onUncheckClick: function(e)
        {
            this.stateModel.get("ranges").set([]);
        },

        templatePeakTypeNames:
        {
            distance: "Peak Distance",
            power: "Peak Power",
            heartrate: "Peak Heart Rate",
            speed: "Peak Speed",
            pace: "Peak Pace",
            cadence: "Peak Cadence"
        },

        modelPeakKeys:
        {
            distance: "peakSpeedsByDistance",
            power: "peakPowers",
            heartrate: "peakHeartRates",
            speed: "peakSpeeds",
            pace: "peakSpeeds",
            cadence: "peakCadences"
        },

        _getSelectOptions: function()
        {

            if(!theMarsApp.featureAuthorizer.canAccessFeature(
                theMarsApp.featureAuthorizer.features.ViewGraphRanges
            ))
            {
                return [];
            }
            var detailData = this.model.get("detailData").toJSON();

            var selectOptions = [];
            _.each(this._getSelectablePeakTypes(), function(peakKey, peakName)
            {
                if(detailData[peakKey] && detailData[peakKey].length)
                {
                    selectOptions.push({
                        value: peakName,
                        label: this.templatePeakTypeNames[peakName],
                    });
                }
            }, this);

            return selectOptions;

        },

        _onPeakTypeChange: function()
        {
            this._updateCollection();
        },

        _getPeaksData: function(peakType)
        {
            if(!theMarsApp.featureAuthorizer.canAccessFeature(
                theMarsApp.featureAuthorizer.features.ViewGraphRanges
                )
            ){
                return [];
            }

            var ranges = this.model.get("detailData").getRangeCollectionFor(peakType).models;

            // filter by enabled intervals
            var enabledPeakIntervals = this._getEnabledPeaks(peakType);
            ranges = _.filter(ranges, function(range)
            {
                return _.contains(enabledPeakIntervals, range.get("interval"));
            });

            _.each(ranges, function(range)
            {
                var formattedValue = this._formatPeakValue(peakType, range.get("value"), this.model.get("workoutTypeValueId"));
                range.set("formattedValue", formattedValue);
            }, this);

            return ranges;
        },

        _formatPeakValue: function(peakType, peakValue, workoutTypeId)
        {
            var formatType = peakType === "distance" ? "pace" : peakType;
            return TP.utils.conversion.formatUnitsValue(formatType, peakValue, { workoutTypeId: workoutTypeId, withLabel: true });
        },

        _getEnabledPeaks: function(selectedPeakType)
        {
            if (selectedPeakType === "distance")
            {
                return [400, 800, 1000, 1600, 1609, 5000, 8047, 10000, 15000, 16094, 21097, 30000, 42195, 50000, 100000];
            } else
            {
                return [2, 5, 10, 12, 20, 30, 60, 90, 120, 300, 360, 600, 720, 1200, 1800, 3600, 5400, 7200, 10800];
            }
        },

        _getSelectablePeakTypes: function()
        {

            var peakTypes = _.clone(this.modelPeakKeys);

            if (!this._shouldDisplayDistance())
            {
                delete peakTypes.distance;
            }

            if (!this._shouldDisplayPace())
            {
                delete peakTypes.pace;
            }

            if (!this._shouldDisplaySpeed())
            {
                delete peakTypes.speed;
            }

            return peakTypes;
        },

        _shouldDisplayDistance: function()
        {
            var workoutTypeId = this.model.get("workoutTypeValueId");
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Walk"))
            {
                return true;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Run"))
            {
                return true;
            }
            return false;
        },

        _shouldDisplayPace: function()
        {
            var workoutTypeId = this.model.get("workoutTypeValueId");
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Walk"))
            {
                return true;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Run"))
            {
                return true;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Swim"))
            {
                return true;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Other"))
            {
                return true;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Rowing"))
            {
                return true;
            }
            return false;
        },

        _shouldDisplaySpeed: function()
        {
            var workoutTypeId = this.model.get("workoutTypeValueId");
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Walk"))
            {
                return false;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Run"))
            {
                return false;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Swim"))
            {
                return false;
            }
            return true;
        }
    });

    return LapsView;

});
