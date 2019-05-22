/*
 * Copyright 2019 WICKLETS LLC
 *
 * This file is part of Wick Engine.
 *
 * Wick Engine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Engine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Class representing a Wick Selection.
 */
Wick.Selection = class extends Wick.Base {
    static get SELECTABLE_OBJECT_TYPES () {
        return ['Path', 'Clip', 'Frame', 'Tween', 'Layer', 'Asset'];
    }

    static get LOCATION_NAMES () {
        return ['Canvas', 'Timeline', 'AssetLibrary'];
    }

    /**
     * Create a Wick Selection.
     */
    constructor (args) {
        if(!args) args = {};
        super(args);

        this._selectedObjectsUUIDs = args.selectedObjects || [];
        this._widgetRotation = args.widgetRotation || 0;
        this._pivotPoint = {x: 0, y: 0};
    }

    deserialize (data) {
        super.deserialize(data);
        this._selectedObjectsUUIDs = data.selectedObjects || [];
        this._widgetRotation = data.widgetRotation;
        this._pivotPoint = {
            x: data.pivotPoint.x,
            y: data.pivotPoint.y
        };
    }

    serialize (args) {
        var data = super.serialize(args);
        data.selectedObjects = Array.from(this._selectedObjectsUUIDs);
        data.widgetRotation = this._widgetRotation;
        data.pivotPoint = {
            x: this._pivotPoint.x,
            y: this._pivotPoint.y
        };
        return data;
    }

    get classname () {
        return 'Selection';
    }

    /**
     * Add a wick object to the selection.
     * @param {Wick.Base} object - The object to select.
     */
    select (object) {
        // Do not allow selection of objects not defined to be selectable
        if(!Wick.Selection.SELECTABLE_OBJECT_TYPES.find(type => {
            return object instanceof Wick[type];
        })) {
            console.warn("Tried to select a " + object.classname + " object. This type is not selectable");
            return;
        }

        // Don't do anything if the object is already selected
        if(this.isObjectSelected(object)){
            return;
        }

        // Activate the cursor tool when selection changes
        if(this._locationOf(object) === 'Canvas') {
            this.project.activeTool = this.project.tools.cursor;
            object.parentLayer && object.parentLayer.activate();
        }

        // Only allow selection of objects of in the same location
        if(this._locationOf(object) !== this.location) {
            this.clear();
        }

        // Add the object to the selection!
        this._selectedObjectsUUIDs.push(object.uuid);

        this._resetPositioningValues();

        // Make sure the view gets updated the next time its needed...
        this.view.dirty = true;
    }

    /**
     * Remove a wick object from the selection.
     * @param {Wick.Base} object - The object to deselect.
     */
    deselect (object) {
        this._selectedObjectsUUIDs = this._selectedObjectsUUIDs.filter(uuid => {
            return uuid !== object.uuid;
        });

        this._resetPositioningValues();

        // Make sure the view gets updated the next time its needed...
        this.view.dirty = true;
    }

    /**
     * Remove all objects from the selection with an optional filter.
     * @param {string} filter - A location or a type (see SELECTABLE_OBJECT_TYPES and LOCATION_NAMES)
     */
    clear (filter) {
        this.project.selection.getSelectedObjects(filter).forEach(object => {
            this.deselect(object);
        });
    }

    /**
     * Checks if a given object is selected.
     * @param {Wick.Base} object - The object to check selection of.
     */
    isObjectSelected (object) {
        return this._selectedObjectsUUIDs.indexOf(object.uuid) !== -1;
    }

    /**
     * Get the first object in the selection if there is a single object in the selection.
     * @return {Wick.Base} The first object in the selection.
     */
    getSelectedObject () {
        if(this.numObjects === 1) {
            return this.getSelectedObjects()[0];
        } else {
            return null;
        }
    }

    /**
     * Get the objects in the selection with an optional filter.
     * @param {string} filter - A location or a type (see SELECTABLE_OBJECT_TYPES and LOCATION_NAMES)
     * @return {Wick.Base[]} The selected objects.
     */
    getSelectedObjects (filter) {
        var objects = this._selectedObjectsUUIDs.map(uuid => {
            return Wick.ObjectCache.getObjectByUUID(uuid);
        });

        if(Wick.Selection.LOCATION_NAMES.indexOf(filter) !== -1) {
            var location = filter;
            if(this.location !== location) {
                return [];
            } else {
                return this.getSelectedObjects();
            }
        } else if (typeof filter === 'string') {
            var classname = filter;
            objects = objects.filter(object => {
                return object instanceof Wick[classname];
            });
        }

        return objects;
    }

    /**
     * Get the UUIDs of the objects in the selection with an optional filter.
     * @param {string} filter - A location or a type (see SELECTABLE_OBJECT_TYPES and LOCATION_NAMES)
     * @return {string[]} The UUIDs of the selected objects.
     */
    getSelectedObjectUUIDs (filter) {
        return this.getSelectedObjects(filter).map(object => {
            return object.uuid;
        });
    }

    /**
     * The location of the objects in the selection. (see LOCATION_NAMES)
     */
    get location () {
        if(this.numObjects === 0) return null;
        return this._locationOf(this.getSelectedObjects()[0]);
    }

    /**
     * The types of the objects in the selection. (see SELECTABLE_OBJECT_TYPES)
     * @type {string[]}
     */
    get types () {
        var types = this.getSelectedObjects().map(object => {
            return object.classname;
        });
        var uniqueTypes = [...new Set(types)];
        return uniqueTypes;
    }

    /**
     * The number of objects in the selection.
     * @type {number}
     */
    get numObjects () {
        return this._selectedObjectsUUIDs.length;
    }

    /**
     * The rotation of the selection (used for canvas selections)
     * @type {number}
     */
    get widgetRotation () {
        return this._widgetRotation;
    }

    set widgetRotation (widgetRotation) {
        this._widgetRotation = widgetRotation;
    }

    /**
     * The point that transformations to the selection will be based around.
     * @type {object}
     */
    get pivotPoint () {
        return this._pivotPoint;
    }

    set pivotPoint (pivotPoint) {
        this._pivotPoint = pivotPoint;
    }

    /**
     *
     */
    get x () {
        return this.view.x;
    }

    set x (x) {
        this.view.x = x;
    }

    /**
     *
     */
    get y () {
        return this.view.y;
    }

    set y (y) {
        this.view.y = y;
    }

    /**
     *
     */
    get width () {
        return this.view.width;
    }

    set width (width) {
        this.view.width = width;
    }

    /**
     *
     */
    get height () {
        return this.view.height;
    }

    set height (height) {
        this.view.height = height;
    }

    /**
     *
     */
    get rotation () {
        return this.view.rotation;
    }

    set rotation (rotation) {
        this.view.rotation = rotation;
    }

    /**
     *
     */
    flipHorizontally () {
        this.view.flipHorizontally();
    }

    /**
     *
     */
    flipVertically () {
        this.view.flipVertically();
    }

    /**
     *
     */
    sendToBack () {
        this.view.sendToBack();
    }

    /**
     *
     */
    bringToFront () {
        this.view.bringToFront();
    }

    /**
     *
     */
    moveForwards () {
        this.view.moveForwards();
    }

    /**
     *
     */
    moveBackwards () {
        this.view.moveBackwards();
    }

    /**
     *
     */
    get identifier () {
        return this._getSingleAttribute('identifier');
    }

    set identifier (identifier) {
        this._setSingleAttribute('identifier', identifier);
    }

    /**
     *
     */
    get name () {
        return this._getSingleAttribute('name');
    }

    set name (name) {
        this._setSingleAttribute('name', name);
    }

    /**
     *
     */
    get fillColor () {
        return this._getSingleAttribute('fillColor');
    }

    set fillColor (fillColor) {
        this._setSingleAttribute('fillColor', fillColor);
    }

    /**
     *
     */
    get strokeColor () {
        return this._getSingleAttribute('strokeColor');
    }

    set strokeColor (strokeColor) {
        this._setSingleAttribute('strokeColor', strokeColor);
    }

    /**
     *
     */
    get strokeWidth () {
        return this._getSingleAttribute('strokeWidth');
    }

    set strokeWidth (strokeWidth) {
        this._setSingleAttribute('strokeWidth', strokeWidth);
    }

    /**
     *
     */
    get opacity () {
        return this._getSingleAttribute('opacity');
    }

    set opacity (opacity) {
        this._setSingleAttribute('opacity', opacity);
    }

    /**
     *
     */
    get sound () {
        return this._getSingleAttribute('sound');
    }

    set sound (sound) {
        this._setSingleAttribute('sound', sound);
    }

    /**
     *
     */
    get soundVolume () {
        return this._getSingleAttribute('soundVolume');
    }

    set soundVolume (soundVolume) {
        this._setSingleAttribute('soundVolume', soundVolume);
    }

    /**
     * Gets and sets the easing type of a selected tween.
     */
    get easingType () {
        return this._getSingleAttribute('easingType');
    }

    set easingType (easingType) {
        return this._setSingleAttribute('easingType', easingType);
    }

    /**
     *
     */
    get filename () {
        return this._getSingleAttribute('filename');
    }

    _locationOf (object) {
        if(object instanceof Wick.Frame
        || object instanceof Wick.Tween
        || object instanceof Wick.Layer) {
            return 'Timeline';
        } else if (object instanceof Wick.Asset) {
            return 'AssetLibrary';
        } else if (object instanceof Wick.Path
                || object instanceof Wick.Clip) {
            return 'Canvas';
        }
    }

    _resetPositioningValues () {
        var selectedObject = this.getSelectedObject();
        if(selectedObject instanceof Wick.Clip) {
            // Single clip selected: Use that Clip's transformation for the pivot point and rotation
            this._widgetRotation = selectedObject.transformation.rotation;
            this._pivotPoint = {
                x: selectedObject.transformation.x,
                y: selectedObject.transformation.y,
            }
        } else {
            // Path selected or multiple objects selected: Reset rotation and use center for pivot point
            this._widgetRotation = 0;

            var boundsCenter = this.view._getSelectedObjectsBounds().center;
            this._pivotPoint = {
                x: boundsCenter.x,
                y: boundsCenter.y,
            };
        }
    }

    /* helper function for getting a single value from multiple selected objects */
    _getSingleAttribute (attributeName) {
        if(this.numObjects === 0) return null;
        return this.getSelectedObjects()[0][attributeName];
    }

    /* helper function for updating the same attribute on all items in the selection  */
    _setSingleAttribute (attributeName, value) {
        this.getSelectedObjects().forEach(selectedObject => {
            selectedObject[attributeName] = value;
        });
    }
}
