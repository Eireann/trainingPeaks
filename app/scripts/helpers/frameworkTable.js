define(
[
    "underscore",
    "handlebars",
    "hbs!templates/views/tableView"
],
function(_, Handlebars, tableViewTemplate)
{
    var displayFrameworkTable = function(headerNames, rowData)
    {
        return tableViewTemplate({headerNames: headerNames, rowData: rowData});
    };

    Handlebars.registerHelper("frameworkTable", displayFrameworkTable);
    return displayFrameworkTable;
});