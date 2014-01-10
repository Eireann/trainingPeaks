$(function() {

	window.ActivityDetailsView = Backbone.View.extend({
		template: $("#activity-details-template").html(),
               
        initialize: function() {
        	this.listenTo(this.model, 'change', this.render);
        },

        render: function() {
        	$(this.el).html(_.template(this.template, this.model.toJSON()));
                       
            return this;        
        }
	});
});