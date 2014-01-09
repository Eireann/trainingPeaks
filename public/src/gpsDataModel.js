$(function(){	

	// Model to pull performance data from training Peaks server
	window.GpsDataModel = Backbone.Model.extend({
		url: "/gpsData",
		defaults: {
			MillisecondsOffset: "",
			Distance: "",
			Elevation: "",
			Cadence: "",
			HeartRate: "",
			Power: "",
			Temperature: "",
			Speed: ""
		}
			
	});
	
	// Collection of sample performance data
	window.SampleCollection = Backbone.Collection.extend({
	    // Reference to this collection's model.
	    model: GpsDataModel,
	    
	    //helper lists to make charting and maping simple
	    latLonPairs:[],
	    distanceVsTime: [],
	    cadenceVsTime:[],
	    elevationVsTime: [],
	    powerVsTime: [],
	    speedVsTime: [],
	
	    // navigate through the collection and precompute the variables used for charting 
	    precomputePerformanceData: function() {
	    	var self = this;
	    	
	    	// clear so if this is called more than once it will not continue to append data.
	    	this.distanceVsTime = [];
	    	this.cadenceVsTime = [];
	    	this.latLonPairs = [];
	    	this.elevationVsTime = [];
	    	this.heartRateVsTime = [];
	    	this.powerVsTime = [];
	    	this.speedVsTime =[];
	    	
	    	this.each(function (model) {
				var millisOffset = model.get("MillisecondsOffset");
				var distance = dataUtils.convertFtToMiles(model.get("Distance"));

				self.distanceVsTime.push([millisOffset, distance]);
				self.cadenceVsTime.push([millisOffset, model.get("Cadence")]);
				self.elevationVsTime.push([millisOffset, model.get("Elevation")]);
				self.heartRateVsTime.push([millisOffset, model.get("HeartRate")]);
				self.powerVsTime.push([millisOffset, model.get("Power")]);
				self.speedVsTime.push([millisOffset, model.get("Speed")]);
				
				if (model.get("Latitude") != null && model.get("Longitude") != null) {
					self.latLonPairs.push([model.get("Latitude"), model.get("Longitude")]);

				} 
			});
		},
		
		// takes in a time increment in minutes and finds the best average power over that increment
	    getAveragePower: function (timeIncrement) {
	    	
	    	var dataArray = this.models;
	    	
	    	var best = 0;
	    	var incrementlen = 0;
	    	var left = 0;
	    	
	    	// making an assumption of items being recorded every second
	    	var right = dataArray.length > (timeIncrement * 60) ? (timeIncrement * 60) : dataArray.length;
	    	
	    	var sum = 0
	    	
	    	// there is only enough data for one sliding window.  add up and return best average
	    	if (right == dataArray.length) {
	    		for(var i = 0; i < dataArray.length; i++) {
	    			sum += dataArray[i].get("Power");
	    		}
	    		best = sum;
	    		incrementlen = dataArray.length;
	    	} else {
	    		for(right; right < dataArray.length; right++) {
		    		var subArray = dataArray.slice(left, right);

		    		sum = 0;
		    		for(var i = 0; i < subArray.length; i++) {
		    			sum += subArray[i].get("Power");
		    		}
		    		
		    		if (sum > best) {
		    			best = sum;
		    		}
		    		left ++;
		    	}
	    		incrementlen = right - left;
	    	}
	    	
	    	return best / incrementlen;
	    }
	});
});
	