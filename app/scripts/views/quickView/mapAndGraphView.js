define(
[
    "TP",
    "leaflet",
    "hbs!templates/views/quickView/mapAndGraphView"
],
function (TP, Leaflet, workoutQuickViewMapAndGraphTemplate)
{
    var osmURL = "http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg";
    var cloudmadeURL = "http://b.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/1/256/{z}/{x}/{y}.png";
    var leafletURL = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";
    
    var yAxes =
    {
        "HeartRate":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#FF0000",
            lineWidth: 0,
            max: null,
            min: 0,
            minTickInterval: 5,
            type: "linear",
            title: null
        },
        "Power":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#FF00FF",
            lineWidth: 0,
            max: null,
            min: 0,
            minTickInterval: 5,
            type: "linear",
            title: null
        },
        "RightPower":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#FF00FF",
            lineWidth: 0,
            max: null,
            min: 0,
            minTickInterval: 5,
            type: "linear",
            title: null
        },
        "Cadence":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#FFA500",
            lineWidth: 0,
            max: null,
            min: 0,
            minTickInterval: 5,
            type: "linear",
            title: null
        },
        "Speed":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#3399FF",
            lineWidth: 0,
            max: null,
            min: 0,
            minTickInterval: 5,
            type: "linear",
            title: null
        },
        "Temperature":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#0A0AFF",
            lineWidth: 0,
            max: null,
            min: 0,
            minTickInterval: 5,
            type: "linear",
            title: null
        },
        "Torque":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#000000",
            lineWidth: 0,
            max: null,
            min: 0,
            type: "linear",
            title: null
        },
        "Elevation":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#4fbf00",
            lineWidth: 0,
            max: null,
            minTickInterval: 5,
            type: "linear",
            opposite: true,
            title: null
        }
    };

    var highchartsConfig =
    {
        chart:
        {
            type: "line",
            zoomType: null,
            resetZoomEnabled: false,
            alignTicks: true,
            width: 620,
            height: 160,
            backgroundColor: "transparent"
        },
        credits:
        {
            enabled: false
        },
        tooltip:
        {
            enabled: false
        },
        legend:
        {
            enabled: false,
            backgroundColor: '#FFFFFF',
            layout: "horizontal",
            verticalAlign: "top",
            floating: false,
            align: "center",
            x: 0,
            y: 0
        },
        scrollbar:
        {
            enabled: false
        },
        title:
        {
            text: null
        },
        xAxis:
        {
            ordinal: false,
            type: "linear",
            labels:
            {
                formatter: function()
                {
                    var decimalHours = (this.value / (3600 * 1000)).toFixed(2);
                    return TP.utils.datetime.format.decimalHoursAsTime(decimalHours, true, null);
                }
            }
        },
        yAxis: [],
        series: [],
        plotOptions:
        {
            line:
            {
                connectNulls: false,
                gapSize: 0,
                turboThreshold: 100
            },
            area:
            {
                connectNulls: false,
                gapSize: 0,
                turboThreshold: 100
            },
            series:
            {
                pointStart: 0,
                pointInterval: 1000, //1 second
                allowPointSelector: true,
                animation: true,
                cursor: "pointer",
                lineWidth: 1,
                marker:
                {
                    enabled: false
                },
                shadow: false,
                states:
                {
                    hover:
                    {
                        enabled: false
                    }
                },
                showCheckbox: false
            }
        },
        navigator:
        {
            enabled: false
        },
        rangeSelector:
        {
            enabled: false
        }
    };
    
    var mapAndGraphViewBase =
    {
        className: "mapAndGraph",

        showThrobbers: true,

        template:
        {
            type: "handlebars",
            template: workoutQuickViewMapAndGraphTemplate
        },

        initialize: function(options)
        {
            _.bindAll(this, "onModelFetched");

            this.map = null;
            this.graph = null;
            this.prefetchConfig = options.prefetchConfig;
        },

        onRender: function()
        {
            var self = this;
            
            this.$el.addClass("waiting");

            if (!this.prefetchConfig.detailDataPromise)
            {
                if (this.prefetchConfig.workoutDetailDataFetchTimeout)
                    clearTimeout(this.prefetchConfig.workoutDetailDataFetchTimeout);

                this.prefetchConfig.detailDataPromise = this.model.get("detailData").fetch();
            }

            setImmediate(function() { self.prefetchConfig.detailDataPromise.then(self.onModelFetched); });
        },

        onModelFetched: function()
        {
            var self = this;
            
            this.$el.removeClass("waiting");

            if (this.model.get("detailData") === null || this.model.get("detailData").attributes.flatSamples === null)
                return;

            setImmediate(function() { self.createAndDisplayMapAndGraph(); });
        },

        createAndDisplayMapAndGraph: function()
        {
            this.parseData();
            this.createAndShowGraph("quickViewGraph");

            if (!this.map)
                this.createMapOnContainer("quickViewMap");

            this.setMapData();
        },

        parseData: function()
        {
            var samples = this.model.get("detailData").attributes.flatSamples.samples;
            var channelMask = this.model.get("detailData").attributes.flatSamples.channelMask;
            var dataByChannel = {};
            var colorByChannel =
            {
                "HeartRate": "#FF0000",
                "Cadence": "#FFA500",
                "Power": "#FF00FF",
                "RightPower": "#FF00FF",
                "Speed": "#3399FF",
                "Elevation": "#306B00",
                "Temperature": "#0A0AFF"
            };
            var indexByChannel =
            {
                "HeartRate": 1,
                "Cadence": 2,
                "Power": 3,
                "RightPower": 4,
                "Speed": 5,
                "Elevation": 0,
                "Temperature": 6
            };

            // Clean up the channels. For now, let's remove GAPS.
            /*
            samples = _.reject(samples, function(sample)
            {
                var previousValue = sample.values[0];
                var equal = true;
                _.each(sample.values, function(value)
                {
                    if (value !== previousValue)
                        equal = false;

                    previousValue = value;
                });

                return equal;
            });
            */

            _.each(samples, function(sample)
            {
                for(var i = 0; i < sample.values.length; i++)
                {
                    if (sample.values[i] === 1.7976931348623157e+308)
                        sample.values[i] = null;
                }
            });

            _.each(samples, function(sample)
            {
                var latLon = [];

                for (var i = 0; i < sample.values.length; i++)
                {
                    if (!_.has(dataByChannel, channelMask[i]))
                        dataByChannel[channelMask[i]] = [];

                    dataByChannel[channelMask[i]].push([sample.millisecondsOffset, sample.values[i]]);
                }
            });

            // Clean up Elevation channel
            var minElevation = 0;
            if (_.has(dataByChannel, "Elevation"))
            {
                minElevation = _.min(dataByChannel.Elevation, function(value)
                {
                    // Underscore Min considers "null" a valid comparable value and will always return a min of "null"
                    // if null is present in the data set, therefore need a quick hack to get around this.
                    return value[1] === null ? 999999999999999 : value[1];
                })[1];
            }

            var seriesArray = [];
            _.each(channelMask, function(channel)
            {
                if (channel === "Distance")
                    return;

                if (channel === "Latitude" || channel === "Longitude")
                    return;

                var type = channel === "Elevation" ? "area" : "line";

                seriesArray.push(
                    {
                        color: colorByChannel[channel],
                        name: channel,
                        data: dataByChannel[channel],
                        type: type,
                        index: indexByChannel[channel]
                    });
            });

            var latLonArray = [];
            if (_.has(dataByChannel, "Latitude") && _.has(dataByChannel, "Longitude") && (dataByChannel.Latitude.length === dataByChannel.Longitude.length))
            {
                for (var i = 0; i < dataByChannel.Latitude.length; i++)
                {
                    var lat = dataByChannel.Latitude[i][1];
                    var lon = dataByChannel.Longitude[i][1];

                    if (_.isNaN(lat) || _.isNaN(lon))
                        continue;

                    latLonArray.push([lat, lon]);
                }
            }

            this.seriesArray = seriesArray;
            this.latLonArray = latLonArray;
            this.minElevation = minElevation;
        },

        createMapOnContainer: function(container)
        {
            var osmLayer = new L.TileLayer(osmURL);
            var cloudmadeLayer = new L.TileLayer(cloudmadeURL);
            var leafletLayer = new L.TileLayer(leafletURL);

            var mapConfig =
            {
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: true,
                layers: [osmLayer],
                center: new L.LatLng(40.012369, -105.132353),
                zoom: 8
            };

            var baseMaps =
            {
                "OSM": osmLayer,
                "Cloudmade": cloudmadeLayer,
                "Leaflet": leafletLayer
            };

            this.map = L.map(container, mapConfig);
            L.control.layers(baseMaps).addTo(this.map);
        },
        
        createAndShowGraph: function(container)
        {
            var self = this;
            
            if (this.graph)
                this.graph.destroy();
            
            var orderedAxes = [];
            var i = 0;
        
            _.each(this.seriesArray, function(series)
            {
                var seriesAxis = yAxes[series.name];

                if (series.name === "Elevation" && self.minElevation > 0)
                    seriesAxis.min = self.minElevation;
                
                series.yAxis = i++;
                orderedAxes.push(seriesAxis);
            });

            this.graphConfig = _.clone(highchartsConfig);
            this.graphConfig.chart.renderTo = container;
            this.graphConfig.yAxis = orderedAxes;
            this.graphConfig.series = this.seriesArray;
            this.graph = new Highcharts.StockChart(this.graphConfig);
        },
        
        setMapData: function()
        {
            if (this.latLonArray && this.latLonArray.length > 0)
            {
                var leafletLatLongs = [];

                _.each(this.latLonArray, function (point)
                {
                    if (point[0] && point[1])
                        leafletLatLongs.push(new L.LatLng(parseFloat(point[0]).toFixed(6), parseFloat(point[1]).toFixed(6)));
                });

                var polyline = L.polyline(leafletLatLongs, { color: "red", smoothFactor: 1.0, opacity: 1, weight: 5 }).addTo(this.map);
                this.map.fitBounds(polyline.getBounds());
            }
        }
    };

    return TP.ItemView.extend(mapAndGraphViewBase);
});
