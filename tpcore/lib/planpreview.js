(function()
{

    var PreviewTemplate = _.template(
    [
        "<section>",
        "<h3>Workout #<%= index + 1 %>: <%= TP.utils.lookupSportType(workout.workoutTypeValueId) %></h3>",
        "<% if(workout.totalTimePlanned) { %><p>Planned Time: <%= TP.utils.format('h', 's', workout.totalTimePlanned) %></p><% } %>",
        "<% if(workout.distancePlanned) { %><p>Planned Distance: <%= TP.utils.format('m', 'mi', workout.distancePlanned) %></p><% } %>",
        "<p><%- workout.description %></p>",
        "</section>"
    ].join(""));

    var PreviewModel = Backbone.Model.extend(
    {
        url: function()
        {
            return "//!API!/public/v1/plans/" + this.id + "/preview";
        }
    });

    var PreviewView = Backbone.View.extend(
    {
        initialize: function(options)
        {
            this.options = _.defaults(options, { width: "100%", height: "300px" });
            this.xhr = this.model.fetch();
            this.xhr.always(_.bind(this.render, this));
            this.render();
        },

        render: function()
        {
            switch(this.xhr.state())
            {
                case "resolved":
                    this.display();
                    this.plot();
                    break;
                case "rejected":
                    this.$el.html("Error!");
                    break;
                case "pending":
                    this.$el.html("Loading&hellip;");
                    break;
            }
        },

        display: function()
        {
            var markup =
            [
                "<div class='plot'></div>",
                "<div class='axis-label' style='text-align:center;'>WEEKS</div>",
                "<h2>Sample Workouts:</h2>",
                _.map(this.model.get("workoutPreviews"), function(workout, index) { return PreviewTemplate({ workout: workout, index: index }); }).join(""),
            ].join("");

            this.$el.html(markup);
        },

        plot: function()
        {
            if(!this.$el.has(".plot")) return;

            var series =
            [
            {
                label: "Distance",
                color: "#006",
                data: _.map(this.model.get("trainingDistanceByWeek"), function(distance, i)
                {
                    return [i + 1, TP.utils.convert('m', 'mi', distance)];
                }),
                yaxis: 1
            },
            {
                label: "Time",
                color: "#060",
                data: _.map(this.model.get("trainingDurationByWeek"), function(duration, i)
                {
                    return [i + 1, TP.utils.convert('h', 'min', duration)];
                }),
                yaxis: 2
            }
            ];

            series = _.select(series, function(serie) { return _.any(serie.data, function(datum) { return datum[1]; }); });

            var options = 
            {
                grid:
                {
                    show: true,
                    borderWidth: { left: 1, bottom: 1, top: 0, right: 0 },
                    borderOffset: { left: 2, bottom: 2, top: 0, right: 0 },
                    axisOffset: { left: 2, bottom: 2, top: 0, right: 2},
                    borderColor: "#c4c2c3"
                },
                series:
                {
                    lines: { show: true, lineWidth: 1 }
                },
                legend: {
                    show: true,
                    position: 'sw',
                    noColumns: 2
                },
                xaxis: { tickColor: "transparent", tickSize: 1, tickDecimals: 0 },
                yaxes: [
                    { min: 0, tickFormatter: function(value) { return TP.utils.format('mi', 'mi', value); }, position: "right" },
                    { min: 0, tickFormatter: function(value) { return TP.utils.format('min', 'min', value); } }
                ]
            };


            var $plot = this.$(".plot");
            $plot.css({ position: "relative" });
            $plot.height(this.options.height);
            $plot.width(this.options.width);
            $plot.plot(series, options);
        }

    });

    TP.components.planpreview = function(element, options)
    {
        var model = new PreviewModel({ id: $(element).data("plan-id") });
        return new PreviewView(_.extend({ model: model, el: element }, options));
    };

})();
