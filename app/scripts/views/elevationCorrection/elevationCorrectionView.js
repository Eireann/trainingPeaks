define(
[
    "TP",
    "utilities/charting/dataParser",
    "models/elevationCorrection",
    "models/commands/elevationCorrection",
    "utilities/charting/defaultFlotOptions",
    "utilities/conversion/convertToViewUnits",
    "hbs!templates/views/elevationCorrection/elevationCorrectionTemplate"
],
function (TP, DataParser, ElevationCorrectionModel, ElevationCorrectionCommandModel, getDefaultFlotOptions, convertToViewUnits, elevationCorrectionTemplate)
{
    return TP.ItemView.extend(
    {
        modal:
        {
            mask: true,
            shadow: true
        },

        className: "",

        events:
        {
            "click button[type=submit]": "onSubmitClicked",
            "click button[type=reset]": "onResetClicked"
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

        initialize: function (options)
        {
            if (!options || !options.workoutModel || !options.workoutModel.get("detailData") || !options.workoutModel.get("detailData").get("flatSamples") || !options.workoutModel.get("detailData").get("flatSamples").hasLatLngData || !_.contains(options.workoutModel.get("detailData").get("flatSamples").channelMask, "Elevation"))
                throw "ElevationCorrectionView requires a DetailData Model with valid flatSamples, latLngData, and Elevation channel";

            _.bindAll(this, "showCorrectedElevation", "onElevationCorrectionApplied", "showUpdatedElevationProfile");

            this.workoutModel = options.workoutModel;

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
                originalGrade: (stats.grade * 100).toFixed(1),
                correctedGrade: null
            });

            this.dataParser = new DataParser();
            this.setOriginalElevation();
            
            this.elevationCorrectionModel = new ElevationCorrectionModel({}, { latLngArray: this.dataParser.getLatLonArray() });
            this.elevationCorrectionModel.save().done(this.showCorrectedElevation);

            this.firstRender = true;
        },

        setOriginalElevation: function()
        {
            this.dataParser.loadData(this.workoutModel.get("detailData").get("flatSamples"));
            this.originalElevation = this.dataParser.dataByChannel["Elevation"];
        },
        
        onRender: function()
        {
            if (this.firstRender)
            {
                this.firstRender = false;
                this.ui.chart.addClass("waiting");
            }

            this.ui.chart.css("height", "400px");
            this.renderPlot();
        },
        
        renderPlot: function()
        {
            var series = [];

            series.push(
            {
                color: "red",
                data: this.originalElevation,
                label: "Original",
                shadowSize: 0
            });

            if (this.correctedElevation)
            {
                series.push(
                {
                    color: "orange",
                    data: this.correctedElevation,
                    label: "Corrected",
                    shadowSize: 0
                });
            }

            var yaxes =
            [
                {
                    show: true,
                    label: "Elevation",
                    position: "left",
                    color: "red",
                    tickColor: "red",
                    font:
                    {
                        color: "red"
                    },
                    tickFormatter: function (value)
                    {
                        return value === 0 ? +0 : parseInt(convertToViewUnits(value, "elevation"), 10);
                    }
                }
            ];


            var onHoverHandler = function (flotItem, $tooltipEl)
            {
                $tooltipEl.html("");
            };

            var flotOptions = getDefaultFlotOptions(onHoverHandler);

            flotOptions.selection.mode = null;
            flotOptions.yaxes = yaxes;
            flotOptions.zoom = { enabled: false };
            flotOptions.filter = { enabled: false };

            this.plot = $.plot(this.ui.chart, series, flotOptions);
        },

        showCorrectedElevation: function()
        {
            this.ui.chart.removeClass("waiting");
            
            this.correctedElevation = this.dataParser.createCorrectedElevationChannel(this.elevationCorrectionModel.get("elevations"));
            this.model.set(
            {
                correctedMin: this.elevationCorrectionModel.get("min"),
                correctedAvg: this.elevationCorrectionModel.get("avg"),
                correctedMax: this.elevationCorrectionModel.get("max"),
                correctedGain: this.elevationCorrectionModel.get("gain"),
                correctedLoss: this.elevationCorrectionModel.get("loss"),
                correctedGrade: (100 * (this.elevationCorrectionModel.get("gain") - this.elevationCorrectionModel.get("loss")) / this.workoutModel.get("distance")).toFixed(1)
            });
        },
        
        onSubmitClicked: function()
        {
            var fileId = this.workoutModel.get("details").get("workoutDeviceFileInfos")[0].fileId;
            var elevationCorrectionCommand = new ElevationCorrectionCommandModel({}, { uploadedFileId: fileId });

            this.ui.chart.addClass("waiting");

            elevationCorrectionCommand.execute().done(this.onElevationCorrectionApplied);
        },
        
        onElevationCorrectionApplied: function ()
        {
            this.workoutModel.get("detailData").fetch().done(this.showUpdatedElevationProfile);
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