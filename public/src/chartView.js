$(function(){	
	window.ChartView = Backbone.View.extend({

	    template: $("#chartView-template").html(),
	    //detailsView: null,
	    events: {
	    	"click #distance": "onChartOptionSelection",
	    	"click #cadence": "onChartOptionSelection",
	    	"click #elevation": "onChartOptionSelection",
	    	"click #heartRate": "onChartOptionSelection",
	    	"click #power": "onChartOptionSelection",
	    	"click #speed": "onChartOptionSelection"
	    },
	    
	    initialize: function() {
	    	_.bindAll(this, 'onChartOptionSelection');
	    	this.listenTo(this.collection, 'change', this.render);
	    	
	    },
	    
	    onChartOptionSelection: function (Event) {
	    	var val = $(Event.target).attr("value");
	    	this.createChart(val)
	    },
	    
	    createChart: function(val) {
	    	var self = this;
	    	
	    	var dataPoints;
	    	var color;
	    	
	    	$(".chartTitle").text(val);
	    	
	    	switch (val) {
	    		case "Distance":
	    	    	dataPoints = this.collection.distanceVsTime;
	    	    	color = "#FF0000";
	    			break;
	    		case "Cadence":
	    			dataPoints = this.collection.cadenceVsTime;
	    			color = "#0000FF";
	    			break;
	    		case "Elevation":
	    			dataPoints = this.collection.elevationVsTime;
	    			color = "#FF00FF";
	    			break;
	    		case "Heart rate":
	    			dataPoints = this.collection.heartRateVsTime;
	    			color = "#00FF00";
	    			break;
	    		case "Power":
	    			dataPoints = this.collection.powerVsTime;
	    			color = "#669900";
	    			break;
	    		case "Speed":
	    			dataPoints = this.collection.speedVsTime;
	    			color = "#3300CC";
	    			break;
	    		default:
	    			
	    	}
	    	
	    	$.plot("#chartContainer", [{data: dataPoints, color: color}],{
	    		grid: {
	    			hoverable: true,
	    			clickable: true
	    		},
	    		xaxis: {
	    			mode: "time",
	    			minTickSize: [1, "hour"],
	    			timeFormat: "%h:%M:%S"
	    		}
	    	});
	    	
	    	$("<div id='tooltip'></div>").css({
				position: "absolute",
				display: "none",
				border: "1px solid #fdd",
				padding: "2px",
				"background-color": "#fee",
				opacity: 0.80
			}).appendTo("body");
	      
	    	$("#chartContainer").bind("plothover", function (event, pos, item) {
	    		if (item) {
	    			var itemIndex = item.dataIndex;
	    		  
	    			var gpsModelItem = self.collection.at(itemIndex);
	    		  
	    			self.trigger("onLatLonDataUpdate", gpsModelItem);
	    			
	    			var tooltip = val + ": ";
	    			
	    			switch (val) {
	    				case "Distance":
	    				case "Elevation":
	    				case "Speed":
	    					tooltip += Number(item.datapoint[1]).toPrecision(5);
	    					break;
	    				case "Cadence":
	    				case "Heart rate":
	    	    		case "Power":
	    					tooltip += item.datapoint[1];
	    					break;
	    				default:
		    		}
	    			tooltip += " Time: " + dataUtils.millisToTime(item.datapoint[0]);

	    			$("#tooltip").html(tooltip)
	    				.css({top: item.pageY+5, left: item.pageX+5})
	    				.fadeIn(200);

	    			self.detailsView.model.set(gpsModelItem.toJSON());
				} else {
					$("#tooltip").hide();
					self.trigger("onLatLonDataUpdate");
				}
				
			});
	    },
	    render: function() {
	    	var self = this;
	    	this.$el.html(this.template);
	      
	    	// By default load the distance vs time chart
	    	this.createChart("Distance");
	    	
	    	this.detailsView = new DetailsView({el: "#detailsContainer", model: new GpsDataModel()});
			this.detailsView.render();
			
	    	var powerModel = {
	    		"a1minAvePower" : this.collection.getAvePowerImproved(1).toPrecision(5),
	    		"a5minAvePower" : this.collection.getAvePowerImproved(5).toPrecision(5),
	    		"a10minAvePower" : this.collection.getAvePowerImproved(10).toPrecision(5),
	    		"a15minAvePower" : this.collection.getAvePowerImproved(15).toPrecision(5),
	    		"a20minAvePower" : this.collection.getAvePowerImproved(20)
	    	};
	    	
	    	this.avePower = new AveragePowerView({el: "#averagePowerCalculation", model: powerModel});
	    	this.avePower.render();
	    	
	    	return this;	
	    }
	});
	
	var DetailsView = Backbone.View.extend({
		template: $("#details-template").html(),
		
		initialize: function() {
			this.listenTo(this.model, "change", this.render);
		},
		
		render: function() {
			$(this.el).html(_.template(this.template, this.model.toJSON()));
			
			return this;
		}
	});
	
	var AveragePowerView = Backbone.View.extend({
		template: $("#average-power-template").html(),
		
		initialize: function() {
		},
	
		render: function() {
			$(this.el).html(_.template(this.template, this.model));
			
			return this;
		}
	});
});