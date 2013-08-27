﻿define(
[
    "TP",
    "utilities/charting/dataParser",
    "models/elevationCorrection",
    "models/commands/elevationCorrection",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",    
    "utilities/conversion/conversion",
    "utilities/charting/flotElevationTooltip",
    "hbs!templates/views/elevationCorrection/elevationCorrectionTemplate"
],
function (TP, DataParser, ElevationCorrectionModel, ElevationCorrectionCommandModel, defaultFlotOptions, chartColors, conversion, flotElevationTooltip, elevationCorrectionTemplate)
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
            this.bindCallbacks();

            this.workoutModel = options.workoutModel;
            this.buildViewModel();

            this.dataParser = new DataParser();
            this.dataParser.setXAxis("distance");
            this.setOriginalElevation();
            
            this.buildElevationCorrrectionModel();

            this.once("render", this.onFirstRender, this);

            TP.analytics("send", { "hitType": "event", "eventCategory": "groundControl", "eventAction": "opened", "eventLabel": "" });
        },

        bindCallbacks: function()
        {
            _.bindAll(this, "onElevationCorrectionFetched", "onElevationCorrectionApplied", "showUpdatedElevationProfile", "showCorrectedElevation");
        },

        validateWorkoutModel: function(options)
        {
            if (!options || !options.workoutModel || !options.workoutModel.get("detailData") || !options.workoutModel.get("detailData").get("flatSamples") || !options.workoutModel.get("detailData").get("flatSamples").hasLatLngData || !_.contains(options.workoutModel.get("detailData").get("flatSamples").channelMask, "Elevation"))
                throw "ElevationCorrectionView requires a DetailData Model with valid flatSamples, latLngData, and Elevation channel";
        },

        buildViewModel: function()
        {
            var stats = this.workoutModel.get("detailData").get("totalStats");
            this.model = new TP.Model(
            {
                originalMin: stats.minimumElevation,
                correctedMin: null,
                originalAvg: stats.averageElevation,
                correctedAvg: null,
                originalMax: stats.maximumElevation,
                correctedMax: null,
                originalGain: stats.elevationGain,
                correctedGain: null,
                originalLoss: stats.elevationLoss,
                correctedLoss: null,
                originalGrade: stats.grade,
                correctedGrade: null
            });
        },

        buildElevationCorrrectionModel: function()
        {
            this.elevationCorrectionModel = new ElevationCorrectionModel({}, { latLngArray: this.dataParser.getLatLonArray() });
            this.elevationCorrectionModel.save().done(this.onElevationCorrectionFetched);
        },

        setOriginalElevation: function() 
        { 
            this.dataParser.loadData(this.workoutModel.get("detailData").get("flatSamples")); 
            this.originalElevation = this.dataParser.getDataByChannel("Elevation"); 
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
            this.ui.chart.css("height", "390px");
            this.renderPlot();
        },
       
        onFirstRender: function()
        {
            this.ui.chart.addClass("waiting");
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

            if (this.correctedElevation)
            {
                series.push(
                {
                    color: "#e61101",
                    data: this.correctedElevation,
                    label: TP.utils.translate("Corrected"),
                    shadowSize: 0
                });
            }

            return series;
        },

        onElevationCorrectionFetched: function()
        {
            this.ui.chart.removeClass("waiting");
            this.setCorrectedElevation();
            this.showCorrectedElevation();
        },

        setCorrectedElevation: function()
        {
            this.correctedElevation = this.dataParser.createCorrectedElevationChannel(this.elevationCorrectionModel.get("elevations"));
        },

        showCorrectedElevation: function()
        {
            this.model.set(
            {
                correctedMin: this.elevationCorrectionModel.get("min"),
                correctedAvg: this.elevationCorrectionModel.get("avg"),
                correctedMax: this.elevationCorrectionModel.get("max"),
                correctedGain: this.elevationCorrectionModel.get("gain"),
                correctedLoss: this.elevationCorrectionModel.get("loss"),
                correctedGrade: this.calculateGrade(this.elevationCorrectionModel.get("gain"), this.elevationCorrectionModel.get("loss"), this.workoutModel.get("distance"))
            });
        },

        calculateGrade: function(gain, loss, distance)
        {
            return (100 * (gain - loss) / distance);
        },

        onSubmitClicked: function()
        {
            var fileId = this.workoutModel.get("details").get("workoutDeviceFileInfos")[0].fileId;
            var elevationCorrectionCommand = new ElevationCorrectionCommandModel({}, { uploadedFileId: fileId });

            this.ui.chart.addClass("waiting");

            elevationCorrectionCommand.execute().done(this.onElevationCorrectionApplied);

            TP.analytics("send", { "hitType": "event", "eventCategory": "groundControl", "eventAction": "applied", "eventLabel": "" });
        },
        
        onElevationCorrectionApplied: function ()
        {
            this.workoutModel.get("detailData").fetch().done(this.showUpdatedElevationProfile);
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
        }
    });
});