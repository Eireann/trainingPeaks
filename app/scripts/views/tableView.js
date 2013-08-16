define(
[
    "underscore",
    "TP",
    "hbs!templates/views/tableView"
],
function(
    _,
    TP,
    tableTemplate)
{
	return TP.ItemView.extend(
	{
		tagName: "table",
        className: "frameworkTable",
		template:
        {
            type: "handlebars",
            template: tableTemplate
        }
	});
});