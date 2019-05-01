describe('Wick.Tools.Cursor', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.view.tools.cursor.activate();
    });

    it('should select item by clicking', function() {
        var project = new Wick.Project();
        var cursor = project.view.tools.cursor;

        var pathJson1 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,0,0]}];
        var pathJson2 = ["Path",{"segments":[[50,100],[50,50],[100,50],[100,100]],"closed":true,"fillColor":[1,0,0]}];

        var path1 = new Wick.Path({json: pathJson1});
        var path2 = new Wick.Path({json: pathJson2});
        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);
        project.view.render();

        cursor.activate();

        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(25,25),
            delta: new paper.Point(0,0),
        });

        expect(project.selection.getSelectedObject().uuid).to.equal(path1.uuid);
    });

    it('should scale object correctly', function() {
        var project = new Wick.Project();
        var cursor = project.view.tools.cursor;

        var pathJson1 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,0,0]}];
        var path1 = new Wick.Path({json: pathJson1});
        project.activeFrame.addPath(path1);

        project.view.render();

        cursor.activate();

        // Select the path
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(25,25),
            delta: new paper.Point(0,0),
        });

        // Scale the path horizontally by 50px, verically by 20px
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        cursor.onMouseDrag({
            modifiers: {},
            point: new paper.Point(75,60),
            delta: new paper.Point(25,10),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(75,60),
            delta: new paper.Point(25,10),
        });

        // Deselect the path
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(200,200),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(200,200),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(200,200),
            delta: new paper.Point(0,0),
        });

        expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0].view.item.bounds.width).to.equal(100);
        expect(project.activeFrame.paths[0].view.item.bounds.height).to.equal(70);
    });

    it('should scale object correctly (shift held = preserve aspect ratio)', function() {
        var project = new Wick.Project();
        var cursor = project.view.tools.cursor;

        var pathJson1 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,0,0]}];
        var path1 = new Wick.Path({json: pathJson1});
        project.activeFrame.addPath(path1);

        project.view.render();

        cursor.activate();

        // Select the path
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(25,25),
            delta: new paper.Point(0,0),
        });

        // Scale the path horizontally by 50px, verically by 20px
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        cursor.onMouseDrag({
            modifiers: {shift: true},
            point: new paper.Point(75,60),
            delta: new paper.Point(25,10),
        });
        cursor.onMouseUp({
            modifiers: {shift: true},
            point: new paper.Point(75,60),
            delta: new paper.Point(25,10),
        });

        // Deselect the path
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(200,200),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(200,200),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(200,200),
            delta: new paper.Point(0,0),
        });

        expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0].view.item.bounds.width).to.equal(100);
        expect(project.activeFrame.paths[0].view.item.bounds.height).to.equal(100);
    });

    it('should drag a segment of a path to modify that path', function (done) {
        var project = new Wick.Project();
        var cursor = project.view.tools.cursor;

        var pathJson1 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,0,0]}];
        var path1 = new Wick.Path({json: pathJson1});
        project.activeFrame.addPath(path1);
        project.view.render();

        cursor.activate();

        project.view.on('canvasModified', (e) => {
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
            expect(project.activeFrame.paths[0].view.item.bounds.width).to.equal(55);
            expect(project.activeFrame.paths[0].view.item.bounds.height).to.equal(55);
            done();
        });

        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        cursor.onMouseDrag({
            modifiers: {},
            point: new paper.Point(55,55),
            delta: new paper.Point(5,5),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(50,50),
            delta: new paper.Point(5,5),
        });
    });
});

// Old tests:
/*
describe('Tools.Cursor', function() {
    it('Should activate without errors', function() {
        var project = new Wick.Project();
        project.view.tools.cursor.activate();
    });

    it('Should select item with by clicking', function() {
        var project = new Wick.Project();
        var paper = project.view.tools.cursor.paper;
        paper.project.clear();

        project.view.tools.cursor.activate();

        project.view.on('selectionChanged', (e) => {
            expect(project.selection.getSelectedObjects().length).to.equal(1);
        });

        var rect1 = new paper.Path.Rectangle({
            from: new paper.Point(0,0),
            to: new paper.Point(50,50),
            fillColor: 'red',
        })
        var rect2 = new paper.Path.Rectangle({
            from: new paper.Point(50,50),
            to: new paper.Point(100,100),
            fillColor: 'red',
        })
        project.activeFrame.addPath(new Wick.Path(rect1.exportJSON({asString:false})));
        project.activeFrame.addPath(new Wick.Path(rect2.exportJSON({asString:false})));
        project.view.render();

        project.view.tools.cursor.activate();
        project.view.tools.cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        project.view.tools.cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        project.view.tools.cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(25,25),
            delta: new paper.Point(0,0),
        });
    });

    it('Should clear selection if the canvas is clicked', function() {

    });

    it('Should clear selection if an item is clicked', function() {

    });

    it('Should add item to selection without clear if shift is held and an item is clicked', function() {

    });

    it('Should not deselect item if its clicked', function() {

    });

    it('Should select item with selection box', function() {

    });

    it('Should select item with selection box (alt held)', function() {

    });

    it('Should not select item with selection box (alt held)', function() {

    });

    it('Should clear selection when selection box is used', function() {

    });

    it('Should not clear selection when selection box is used with shift held', function() {

    });

    it('Should clear selection and select item if segment is clicked', function() {

    });

    it('Should clear selection and select item if curve is clicked', function() {

    });

    it('Should add item to selection if segment is clicked and shift is held', function() {

    });

    it('Should add item to selection if curve is clicked and shift is held', function() {

    });

    it('Should drag segment and update item', function() {

    });

    it('Should drag curve and update item', function() {

    });

    it('Should translate selection by dragging items', function() {

    });

    it('Should scale selection by dragging corners', function() {

    });

    it('Should rotate selection by dragging around corners', function() {

    });

    it('should fire onSelectionTransformed when selection is translated', function(done) {
        var project = new Wick.Project();
        var paper = project.view.tools.cursor.paper;
        paper.project.clear();
        project.view.tools.cursor.activate();

        var path = new paper.Path.Rectangle({
            from: new paper.Point(0,0),
            to: new paper.Point(50,50),
            fillColor: 'red',
        });
        paper.selection.finish();
        paper.selection = new paper.Selection({items:[path]});

        project.view.on('selectionTransformed', function () {
            done();
        });

        project.view.tools.cursor.activate();
        project.view.tools.cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        project.view.tools.cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        project.view.tools.cursor.onMouseDrag({
            modifiers: {},
            point: new paper.Point(75,75),
            delta: new paper.Point(50,50),
        });
        project.view.tools.cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(75,75),
            delta: new paper.Point(50,50),
        });
    });

    it('should fire onCanvasModified when selection is scaled', function(done) {
        var project = new Wick.Project();
        var paper = project.view.tools.cursor.paper;
        paper.project.clear();

        project.view.tools.cursor.activate();

        var path = new paper.Path.Rectangle({
            from: new paper.Point(0,0),
            to: new paper.Point(50,50),
            fillColor: 'red',
        });
        paper.selection.finish();
        paper.selection = new paper.Selection({items:[path]});

        project.view.on('selectionTransformed', function () {
            done();
        });

        project.view.tools.cursor.activate();
        project.view.tools.cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        project.view.tools.cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        project.view.tools.cursor.onMouseDrag({
            modifiers: {},
            point: new paper.Point(100,100),
            delta: new paper.Point(50,50),
        });
        project.view.tools.cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(100,100),
            delta: new paper.Point(50,50),
        });
    });

    it('should fire onCanvasModified when selection is rotated', function(done) {
        done();
    });

    it('should fire onCanvasModified when selection is deleted', function(done) {
        done();
    });

    it('should fire onSelectionChanged when selection is changed by clicking objects', function(done) {
        done();
    });

    it('should fire onSelectionChanged when selection is changed by using selection box', function(done) {
        done();
    });
});
*/