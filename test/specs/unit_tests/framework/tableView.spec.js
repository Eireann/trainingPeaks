requirejs(
["TP",
 "jquery",
 "views/tableView"],
 function(TP, $, TableView)
 {
	describe("TableView", function()
	{
		it("Should be defined as a module", function()
		{
			expect(TableView).toBeDefined();
		});
		it("Should use a table as its element", function()
		{
			expect(TableView.prototype.tagName).toBe("table");
		});
		it("Should have the right class", function()
		{
			expect(TableView.prototype.className).toBe("frameworkTable");
		});
	});
 });