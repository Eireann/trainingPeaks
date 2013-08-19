define(
[
    "underscore",
    "moment",
    "TP",
    "framework/chart",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "views/dashboard/chartUtils",
    "dashboard/views/peaksChartSettingsView"
],
function(
   _,
   moment,
   TP,
   Chart,
   defaultFlotOptions,
   chartColors,
   DashboardChartUtils,
   PeaksChartSettingsView
)
{
   var PeaksChart = Chart.extend({
      
      settingsView: PeaksChartSettingsView,

      subTypes:
      {
        8:  { requestType: 2, label: "Power", units: "power"},
        28: { requestType: 1, label: "Heart Rate", units: "heartrate" },
        29: { requestType: 5, label: "Cadence", units: "cadence" },
        30: { requestType: 3, label: "Speed", units: "speed" },
        31: { requestType: 3, label: "Pace", units: "pace" },
        36: { requestType: 4, label: "Pace by Distance", units: "pace" }
      },

      labelInfo:
      {
         "MM10Seconds":   { xvalue: 10, title: "10 seconds" },
         "MM12Seconds":   { xvalue: 12, title: "12 seconds" },
         "MM20Seconds":   { xvalue: 20, title: "20 seconds" },
         "MM30Seconds":   { xvalue: 30, title: "30 seconds" },
         "MM1Minute":     { xvalue: 60, title: "1 minute" },
         "MM2Minutes":    { xvalue: 2 * 60, title: "2 minutes" },
         "MM5Minutes":    { xvalue: 5 * 60, title: "5 minutes" },
         "MM6Minutes":    { xvalue: 6 * 60, title: "6 minutes" },
         "MM10Minutes":   { xvalue: 10 * 60, title: "10 minutes" },
         "MM12Minutes":   { xvalue: 12 * 60, title: "12 minutes" },
         "MM20Minutes":   { xvalue: 20 * 60, title: "20 minutes" },
         "MM30Minutes":   { xvalue: 30 * 60, title: "30 minutes" },
         "MM1Hour":       { xvalue: 60 * 60, title: "60 minutes" },
         "MM90Minutes":   { xvalue: 90 * 60, title: "90 minutes" },
         "MM3Hours":      { xvalue: 3 * 60 * 60, title: "3 hours" },

         "MM400MeterWorkoutId": { xvalue: 400, title: "400 m" },
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
         "MMHalfMarathon":  { xvalue: 21097, title: "?" },
         "MM30Kilometer":   { xvalue: 30000, title: "30 km" },
         "MMMarathon":      { xvalue: 42195, title: "?" },
         "MM50Kilometer":   { xvalue: 50000, title: "50 km" },
         "MM100Kilometer":  { xvalue: 100000, title: "100 km" },
         "MM100Mile":       { xvalue: 160934, title: "100 mi" }
      },

      initialize: function(attributes, options)
      {
         this.subType = this.subTypes[this.get("chartType")];
         this.set("title", TP.utils.translate("Peak " + this.subType.label));
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
         [{
            raw: mainPeaks,
            data: this._makeSeries(mainPeaks),
            color: "#000"
         },
         {
            raw: comparisonPeaks,
            data: this._makeSeries(comparisonPeaks),
            color: "#00f"
         }];

         return {
            dataSeries: series,
            flotOptions: defaultFlotOptions.getSplineOptions(null)
         };
      },

      _makeSeries: function(peaks)
      {
         if(!peaks) return null;

         return _.chain(peaks)
         .filter(function(peak) { return !!peak.value; })
         .map(function(peak) { return [Math.log(peak.xvalue), peak.value]; })
         .value();
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

            return _.extend({}, peak, this.labelInfo[peak.label]);
         }, this);

         return _.sortBy(peaks, "xvalue");
      },

      buildTooltipData: function(flotItem)
      {
         var peak = flotItem.series.raw[flotItem.dataIndex];
         return [
            { value: moment(peak.date).format("ddd, L") },
            { value: peak.title },
            { value: this._formatPeakValue(peak.value) }
         ];
      },

      _formatPeakValue: function(value)
      {
         return [
            TP.utils.conversion.convertToViewUnits(value, this.subType.units),
            TP.utils.units.getUnitsLabel(this.subType.units)
         ].join(" ");
      }
   });

   return PeaksChart;
});
