(function()
{

    var PreviewTemplate = _.template(
    [
        "<section>",
        "<h3>Workout #<%= index + 1 %>: <%= TP.utils.lookupSportType(workout.workoutTypeValueId) %></h3>",
        "<% if(workout.totalTimePlanned) { %><p>Planned Time: <%= TP.utils.format('h', 's', workout.totalTimePlanned) %></p><% } %>",
        "<% if(workout.distancePlanned) { %><p>Planned Distance: <%= TP.utils.format('m', 'mi', workout.distancePlanned) %></p><% } %>",
        "<p><%= workout.description %></p>",
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
        initialize: function()
        {
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
                "<div class='legend'></div>",
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
                color: "#600",
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
                legend: { show: true, container: this.$(".legend"), noColumns: 2 },
                xaxis: { tickSize: 1, tickDecimals: 0 },
                yaxes: [
                    { min: 0, color: "#600", axisLabel: "Distance", tickFormatter: function(value) { return TP.utils.format('mi', 'mi', value); }, position: "right" },
                    { min: 0, color: "#060", axisLabel: "Time", tickFormatter: function(value) { return TP.utils.format('min', 'min', value); } }
                ]
            };


            this.$(".plot").width("100%").height("300px").plot(series, options);
        }

    });

    TP.components.planpreview = function(element, options)
    {
        var model = new PreviewModel({ id: $(element).data("plan-id") });
        return new PreviewView({ model: model, el: element });
    };

})();
