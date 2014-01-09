define(
[
   "jquery",
    "underscore",
    "moment",
    "TP",
    "framework/chart",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "views/dashboard/chartUtils",
    "dashboard/views/peaksChartSettingsView",
    "models/workoutModel",
    "views/quickView/workoutQuickView"
],
function(
   $,
   _,
   moment,
   TP,
   Chart,
   defaultFlotOptions,
   chartColors,
   DashboardChartUtils,
   PeaksChartSettingsView,
   WorkoutModel,
   WorkoutQuickView
)
{
   var PeaksChart = Chart.extend({

      settingsView: PeaksChartSettingsView,

      subTypes:
      {
        8:  {
           requestType: 2,
           label: "Power",
           units: "power",
           xaxis: "time",
           color: chartColors.peaks.power
        },
        28: {
           requestType: 1,
           label: "Heart Rate",
           units: "heartrate",
           xaxis: "time",
           color: chartColors.peaks.heartRate
        },
        29: {
           requestType: 5,
           label: "Cadence",
           units: "cadence",
           xaxis: "time",
           color: chartColors.peaks.cadence
        },
        30: {
           requestType: 3,
           label: "Speed",
           units: "speed",
           xaxis: "time",
           color: chartColors.peaks.pace
        },
        31: {
           requestType: 3,
           label: "Pace",
           units: "pace",
           xaxis: "time",
           color: chartColors.peaks.pace
        },
        36: { requestType: 4,
           label: "Pace by Distance",
           units: "pace",
           xaxis: "distance",
           color: chartColors.peaks.pace,
           lockWorkouts: true,
           workoutTypeIds: ["3"]
        }
      },

      labelInfo:
      {
         time:
         {
            "MM5Seconds":    { xvalue: 5, title: "5 seconds", shortTitle: "5sec." },
            "MM10Seconds":   { xvalue: 10, title: "10 seconds", shortTitle: "10sec." },
            "MM12Seconds":   { xvalue: 12, title: "12 seconds", shortTitle: "12sec." },
            "MM20Seconds":   { xvalue: 20, title: "20 seconds", shortTitle: "20sec." },
            "MM30Seconds":   { xvalue: 30, title: "30 seconds", shortTitle: "30sec." },
            "MM1Minute":     { xvalue: 60, title: "1 minute", shortTitle: "1min." },
            "MM2Minutes":    { xvalue: 2 * 60, title: "2 minutes", shortTitle: "2min." },
            "MM5Minutes":    { xvalue: 5 * 60, title: "5 minutes", shortTitle: "5min." },
            "MM6Minutes":    { xvalue: 6 * 60, title: "6 minutes", shortTitle: "6min." },
            "MM10Minutes":   { xvalue: 10 * 60, title: "10 minutes", shortTitle: "10min." },
            "MM12Minutes":   { xvalue: 12 * 60, title: "12 minutes", shortTitle: "12min." },
            "MM20Minutes":   { xvalue: 20 * 60, title: "20 minutes", shortTitle: "20min." },
            "MM30Minutes":   { xvalue: 30 * 60, title: "30 minutes", shortTitle: "30min." },
            "MM1Hour":       { xvalue: 60 * 60, title: "60 minutes", shortTitle: "60min." },
            "MM90Minutes":   { xvalue: 90 * 60, title: "90 minutes", shortTitle: "90min." },
            "MM3Hours":      { xvalue: 3 * 60 * 60, title: "3 hours", shortTitle: "3hrs." }
         },

         distance:
         {
            "MM400Meter":      { xvalue: 400, title: "400 m" },
            "MM800Meter":      { xvalue: 800, title: "800 m" },
            "MM1Kilometer":    { xvalue: 1000, title: "1 km" },
            "MM1600Meter":     { xvalue: 1600, title: "1600 m" },
            "MM1Mile":         { xvalue: 1609, title: "1 mi" },
            "MM5Kilometer":    { xvalue: 5000, title: "5 km" },
            "MM5Mile":         { xvalue: 8047, title: "5 mi" },
            "MM10Kilometer":   { xvalue: 10000, title: "10 km" },
            "MM15Kilometer":   { xvalue: 15000, title: "15 km" },
            "MM10Mile":        { xvalue: 16093, title: "10 mi" },
            "MMHalfMarathon":  { xvalue: 21097, title: "Half Marathon", shortTitle: "HM" },
            "MM30Kilometer":   { xvalue: 30000, title: "30 km" },
            "MMMarathon":      { xvalue: 42195, title: "Marathon", shortTitle: "M" },
            "MM50Kilometer":   { xvalue: 50000, title: "50 km" },
            "MM100Kilometer":  { xvalue: 100000, title: "100 km" },
            "MM100Mile":       { xvalue: 160934, title: "100 mi" }
         }
      },

      _getLabelInfo: function()
      {
         return this.labelInfo[this.subType.xaxis];
      },

      initialize: function(attributes, options)
      {
         this.subType = this.subTypes[this.get("chartType")];

         this.initializeDateSettings("comparisonDateOptions");
         if (this.subType.lockWorkouts)
         {
            this.set("workoutTypeIds", this.subType.workoutTypeIds);
         }
      },

      getChartName: function()
      {
         return "Peaks Chart";
      },

      isWorkoutTypesLocked: function()
      {
         return !!this.subType.lockWorkouts;
      },

      fetchData: function()
      {
         return $.when(
            this._fetchData("dateOptions"),
            this.get("useComparison") ? this._fetchData("comparisonDateOptions") : null
         );
      },

      _fetchData: function(key)
      {
         var dateOptions = DashboardChartUtils.buildChartParameters(this.get(key) || {});
         var options = {
            workoutTypeIds: this.get("workoutTypeIds"),
            meanMaxBestsType: this.subType.requestType
         };
         return this.dataManager.fetchReport("meanmaxbests", dateOptions.startDate, dateOptions.endDate, options);
      },

      parseData: function(mainXhr, comparisonXhr)
      {
         var mainPeaks = this._parsePeaks(mainXhr);
         var comparisonPeaks = this._parsePeaks(comparisonXhr);

         if(!mainPeaks && !comparisonPeaks) return null;

         var series =
         [
            this._makeSeries(comparisonPeaks, {
               label: this._formatDateRange(comparisonXhr),
               color: "#9c9b9c",
               lines: {
                  lineWidth: 0,
                  fillColor: { colors: [chartColors.peaks.comparison.dark, chartColors.peaks.comparison.light] }
               }
            }),
            this._makeSeries(mainPeaks, {
               label: this._formatDateRange(mainXhr),
               color: this.subType.color.dark,
               lineColor: "#fff",
               lines:
               {
                  lineWidth: 2,
                  show: true,
                  fill: true,
                  fillColor: { colors: [this.subType.color.dark, this.subType.color.light] }
               },
               shadowSize: 0
            })
         ];

         series = _.filter(series);

         return {
            dataSeries: series,
            flotOptions: _.defaults({
               legend: { show: true },
               xaxis: {
                  transform: function(x) { return Math.log(x); },
                  inverseTransform: function(x) { return Math.exp(x); },
                  ticks: _.bind(this._generateXTicks, this)
               },
               yaxis: {
                  label: TP.utils.units.getUnitsLabel(this.subType.units, this._getSingleWorkoutTypeId()),
                  tickFormatter: _.bind(this._formatYTick, this)
               }
            }, defaultFlotOptions.getSplineOptions(null))

         };
      },

      _makeSeries: function(peaks, options)
      {
         if(!peaks) return null;

         var raw = _.filter(peaks, function(peak) { return !!peak.value && !!peak.xvalue; });
         var data = _.map(raw, function(peak) { return [peak.xvalue, peak.value]; });

         return _.extend({
            raw: raw,
            data: data
         }, options);
      },

      _formatDateRange: function(xhr)
      {
         if(!xhr) return;
         return TP.utils.datetime.format(xhr.startDate) + " - " + TP.utils.datetime.format(xhr.endDate);
      },

      _parsePeaks: function(data)
      {
         if(!data) return null;

         var peaks = _.map(data.meanMaxes, function(peak)
         {
            if (!peak || !_.isString(peak.label))
            {
               return; // Should this throw an error?
            }

            return _.extend({}, peak, this._getLabelInfo()[peak.label]);
         }, this);

         return _.sortBy(peaks, "xvalue");
      },

      buildTooltipData: function(flotItem)
      {
         var peak = flotItem.series.raw[flotItem.dataIndex];
         return [
            { value: TP.utils.datetime.format(peak.date, "ddd, M/D/YYYY") },
            { value: peak.title },
            { value: this._formatPeakValue(peak.value) }
         ];
      },

      _formatPeakValue: function(value)
      {
         var workoutTypeId = this._getSingleWorkoutTypeId();

         return [
            TP.utils.conversion.formatUnitsValue(this.subType.units, value, {defaultValue: undefined, workoutTypeId: workoutTypeId }),
            TP.utils.units.getUnitsLabel(this.subType.units, workoutTypeId)
         ].join(" ");
      },

      _generateXTicks: function(options)
      {
         var noTicks = (options.max - options.min) / options.delta;
         var delta = (Math.log(options.max) - Math.log(options.min)) / noTicks;

         var prev = null;
         var ticks = _.map(this._getLabelInfo(), function(tick)
         {
            var current = Math.log(tick.xvalue);
            if (prev === null || current - prev >= delta)
            {
               prev = current;
               return [tick.xvalue, tick.shortTitle || tick.title];
            }
            else
            {
               return [];
            }
         });

         ticks.push([options.min, ""], [options.max, ""]);

         return ticks;
      },

      _formatYTick: function(value)
      {

        // special case for zero speed/pace, otherwise we get 00:01 in a place that doesn't make sense
        if(this.subType.units === "pace" && value === 0)
        {
          return "";
        }

        return TP.utils.conversion.formatUnitsValue(this.subType.units, value, { defaultValue: undefined, workoutTypeId: this._getSingleWorkoutTypeId()});
      },

      _getSingleWorkoutTypeId: function()
      {
         var workoutTypeIds = this.get("workoutTypeIds");
         var workoutTypeId = workoutTypeIds && workoutTypeIds.length === 1 ? workoutTypeIds[0] : undefined;
         return workoutTypeId;
      },

      defaultTitle: function()
      {
         return TP.utils.translate("Peak " + this.subType.label) + ": " + TP.utils.workout.types.getListOfNames(this.get("workoutTypeIds"));
      },

      createItemDetailView: function(item)
      {
          if(item && item.series && item.series.raw && item.series.raw[item.dataIndex] && item.series.raw[item.dataIndex].workoutId)
          {
            var workoutId = item.series.raw[item.dataIndex].workoutId;
            var workoutPromise = this.dataManager.loadModel(WorkoutModel, { workoutId: workoutId });
            return new WorkoutQuickView({model: workoutPromise.model});
          }
          else
          {
            return null;
          }
      }

   });

   return PeaksChart;
});
