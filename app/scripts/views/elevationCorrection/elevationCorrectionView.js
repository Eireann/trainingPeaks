define(
[
    "jquery",
    "underscore",
    "TP",
    "models/elevationCorrection",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "utilities/conversion/conversion",
    "utilities/charting/flotElevationTooltip",
    "hbs!templates/views/elevationCorrection/elevationCorrectionTemplate"
],
function ($, _, TP, ElevationCorrectionModel, defaultFlotOptions, chartColors, conversion, flotElevationTooltip, elevationCorrectionTemplate)
{
    return TP.ItemView.extend(
    {
        modal:
        {
            mask: true,
            shadow: true
        },

        closeOnResize: false,

        className: "",

        events:
        {
            "click button[type=submit]": "onSubmitClicked",
            "click button[type=reset]": "onResetClicked",
            "click #closeIcon": "onResetClicked"
        },

        template:
        {
            type: "handlebars",
            template: elevationCorrectionTemplate
        },

        ui:
        {
            "chart": "div.elevationGraph"
        },

        initialize: function(options)
        {
            this.validateWorkoutModel(options);

            this.buildModels(options);
            this.listenToModelEvents();

            this.setOriginalElevation();

            TP.analytics("send", { "hitType": "event", "eventCategory": "groundControl", "eventAction": "opened", "eventLabel": "" });
        },

        listenToModelEvents: function()
        {
            this.listenTo(this.elevationCorrectionModel, "change", this.onElevationCorrectionFetched);
            this.listenTo(this.elevationCorrectionModel, "correctionSaved", this.onElevationCorrectionApplied);
        },

        buildModels: function(options)
        {
            this.workoutModel = options.workoutModel;
            var uploadedFileId = this._getFileId();
            this.elevationCorrectionModel = new ElevationCorrectionModel({ uploadedFileId: uploadedFileId });
            this.elevationCorrectionModel.fetch();
        },

        validateWorkoutModel: function(options)
        {
            if (!options || !options.workoutModel || !options.workoutModel.get("detailData") || !options.workoutModel.get("detailData").get("flatSamples") || !options.workoutModel.get("detailData").get("flatSamples").hasLatLngData || !_.contains(options.workoutModel.get("detailData").graphData.sampleData.listChannels(), "Elevation"))
                throw new Error("ElevationCorrectionView requires a DetailData Model with valid flatSamples, latLngData, and Elevation channel");
        },

        setOriginalElevation: function()
        {
            this.originalElevation = this._getGraphData().getDataByAxisAndChannel("distance", "Elevation");
            var elevationMinimum = this.findMinimumElevation(this.originalElevation);
            this.addMinimumElevation(this.originalElevation, elevationMinimum);
        },

        findMinimumElevation: function (modelData)
        {
            var minimum = null;
            _.each(modelData, function (item, index)
            {
                if (item[1] < minimum || minimum === null)
                    minimum = item[1];
            });
            return minimum;
        },

        addMinimumElevation: function (originalElevation, minimumElevation)
        {
            _.each(originalElevation, function (item, index)
            {
                item[2] = minimumElevation;
            });
        },

        onRender: function()
        {
            this.renderPlot();
        },

        renderPlot: function()
        {
            var series = this.buildPlotSeries();

            var yaxes =
            [
                {
                    show: true,
                    label: "Elevation",
                    position: "left",
                    color: "#303030",
                    tickColor: "#d7d8d9",
                    font:
                    {
                        color: "#303030"
                    },
                    tickFormatter: function (value)
                    {
                        return value === 0 ? +0 : parseInt(conversion.formatUnitsValue("elevation", value), 10);
                    }
                }
            ];

            var onHoverHandler = function (flotItem, $tooltipEl)
            {
                $tooltipEl.html(flotElevationTooltip(series, flotItem.series.label, flotItem.dataIndex));
            };

            var flotOptions = defaultFlotOptions.getMultiChannelOptions(onHoverHandler, "distance");

            flotOptions.selection.mode = null;
            flotOptions.yaxes = yaxes;
            flotOptions.zoom = { enabled: false };
            flotOptions.filter = { enabled: false };

            if($.plot)
            {
                this.plot = $.plot(this.ui.chart, series, flotOptions);
            }
        },

        buildPlotSeries: function()
        {
            var series = [];

            series.push(
            {
                color: "#ffffff",
                data: this.originalElevation,
                label: TP.utils.translate("Original"),

                lines:
                {
                    show: true,
                    lineWidth: 1,
                    fill: true,
                    fillColor: { colors: [chartColors.gradients.elevation.dark, chartColors.gradients.elevation.light] }
                },
                yaxis: 1,
                shadowSize: 0
            });

            if (this.elevationCorrectionModel.get("elevations"))
            {
                series.push(
                {
                    color: "#e61101",
                    data: this._getGraphData().createCorrectedElevationChannel(this.elevationCorrectionModel.get("elevations")),
                    label: TP.utils.translate("Corrected"),
                    shadowSize: 0
                });
            }

            return series;
        },

        onElevationCorrectionFetched: function()
        {
            this.render();
            this.ui.chart.removeClass("waiting");
        },

        serializeData: function()
        {
            var stats = this.workoutModel.get("detailData").get("totalStats");
            return {
                originalMin: stats.minimumElevation,
                correctedMin: this.elevationCorrectionModel.get("min"),
                originalAvg: stats.averageElevation,
                correctedAvg: this.elevationCorrectionModel.get("avg"),
                originalMax: stats.maximumElevation,
                correctedMax: this.elevationCorrectionModel.get("max"),
                originalGain: stats.elevationGain,
                correctedGain: this.elevationCorrectionModel.get("gain"),
                originalLoss: stats.elevationLoss,
                correctedLoss: this.elevationCorrectionModel.get("loss"),
                originalGrade: stats.grade,
                correctedGrade: this.calculateGrade(this.elevationCorrectionModel.get("gain"), this.elevationCorrectionModel.get("loss"), this.workoutModel.get("distance"))
            };
        },

        calculateGrade: function(gain, loss, distance)
        {
            return (100 * (gain - loss) / distance);
        },

        onSubmitClicked: function()
        {
            var fileId = this._getFileId();

            this.ui.chart.addClass("waiting");

            this.elevationCorrectionModel.applyCorrection();

            TP.analytics("send", { "hitType": "event", "eventCategory": "groundControl", "eventAction": "applied", "eventLabel": "" });
        },

        onElevationCorrectionApplied: function ()
        {
            // need to determine if we can listen to detailData to avoid this .done(_.bind) business.
            this.workoutModel.get("detailData").fetch().done(_.bind(this.showUpdatedElevationProfile, this));
            this.workoutModel.fetch();
        },

        showUpdatedElevationProfile: function()
        {
            this.setOriginalElevation();
            this.renderPlot();
            this.ui.chart.removeClass("waiting");
        },

        onResetClicked: function()
        {
            this.close();
        },

        _getFileId: function()
        {
            return this.workoutModel.get("detailData").get("uploadedFileId");
        },

        _getGraphData: function()
        {
            return this.workoutModel.get("detailData").graphData;
        }

    });
});
