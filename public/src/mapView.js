$(function(){

	window.MapView = Backbone.View.extend({
		template: $('#mapView-template').html(),
		map: [],
		currMarker: [],
		
		initialize: function() {
			_.bindAll(this, 'updateLatLonMarkerHandler');

			this.listenTo(this.collection, 'change', this.render);
		},

		updateLatLonMarkerHandler: function(data) {
			if (data != null) {
				if (this.marker != null) {
					this.map.removeLayer(this.marker);
				}
				var lat = data.get("Latitude");
				var lon = data.get("Longitude");
				if (lat != null && lon != null) {
					this.marker = L.marker([lat, lon]).addTo(this.map);

				}
			} else {
				if (this.marker != null) {
					this.map.removeLayer(this.marker);
				}

			}
		},
		
		render: function() {
			this.$el.html(this.template);
			
			this.map = L.map('mapContainer').setView([0, 0], 13);
			
			// add an OpenStreetMap tile layer
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(this.map);
			
			console.log(this.collection.latLonPairs);
			// create a red polyline from an arrays of LatLng points
			var polyline = L.polyline(this.collection.latLonPairs, {color: 'red'}).addTo(this.map);

			// zoom the map to the polyline
			this.map.fitBounds(polyline.getBounds());
			return this;
		}
	});
});