$(function(){

	var AppController = Backbone.View.extend({
		initialize: function() {
			this.gpsDataModel = new GpsDataModel();
			var self = this;
			
			this.listenTo(this.gpsDataModel, "sync", function() {
				self.samples = new SampleCollection(self.gpsDataModel.get("FlatSamples").Samples);
				
				self.samples.precomputePerformanceData();
				var chart = new ChartView({
					collection: self.samples,
					el: "#chartView"});
				
				
				chart.render();
				
				var mapView = new MapView({
					collection: self.samples,
					el: "#mapView"});
				chart.bind("onLatLonDataUpdate", mapView.updateLatLonMarkerHandler);
				mapView.render();
			});
			
			this.gpsDataModel.fetch();
		}
	});
	
	window.appController = new AppController();
	 
});