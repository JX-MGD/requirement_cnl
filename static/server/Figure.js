'use strict';
/*
 *  Copyright (C) 1998-2023 by Northwoods Software Corporation. All Rights Reserved.
 */

// This file holds definitions of all standard shape figures -- string values for Shape.figure.
// You do not need to load this file in order to use named Shape figure.

// The following figures are built-in to the go.js library and thus do not need to be redefined:
//   Rectangle, Square, RoundedRectangle, Border, Ellipse, Circle,
//   TriangleRight, TriangleDown, TriangleLeft, TriangleUp, Triangle,
//   LineH, LineV, None, BarH, BarV, MinusLine, PlusLine, XLine
// If you need any of the other figures that are defined in this file, we suggest that you copy
// just those definitions into your own code.  Do not load this file unless you really want to
// define a lot of code that your app does not use and will not get garbage-collected.

// See also the figures defined in the RoundedRectangles.js file.

// The following functions and variables are used throughout this file:

/**
 * @constructor
 * @param {string} name
 * @param {number} def
 * @param {number=} min defaults to zero
 * @param {number=} max defaults to Infinity
 * @class
 * This FigureParameter class describes various properties each parameter uses in figures.
 */
function FigureParameter(name, def, min, max) {
  if (min === undefined /*notpresent*/ ) min = 0.0;
  if (max === undefined /*notpresent*/ ) max = Infinity;
  /** @type {string} */
  this._name = name;
  /** @type {number} */
  this._defaultValue = def;
  /** @type {number} */
  this._minimum = min;
  /** @type {number} */
  this._maximum = max;
};

// Public properties

/**
* Gets or sets the name of the figure.
* @name FigureParamater#name

* @return {string}
*/
Object.defineProperty(FigureParameter.prototype, "name", {
  get: function() { return this._name; },
  set: function(val) {
    if (typeof val !== "string" || val === "") throw new Error("Shape name must be a valid string.");
    this._name = val;
  }
});

/**
 * Gets or sets the default value for the parameter.
 * @name FigureParameter#defaultValue
 * @function
 * @return {number}
 */
Object.defineProperty(FigureParameter.prototype, "defaultValue", {
  get: function() { return this._defaultValue; },
  set: function(val) {
    if (typeof val !== "number" || isNaN(val)) throw new Error("The default value must be a real number, not: " + val);
    this._defaultValue = val;
  }
});

/**
* Gets or sets the minimum value allowed for the figure parameter.
* @name FigureParameter#minimum

* @return {number}
*/
Object.defineProperty(FigureParameter.prototype, "minimum", {
  get: function() { return this._minimum; },
  set: function(val) {
    if (typeof val !== "number" || isNaN(val)) throw new Error("Minimum must be a real number, not: " + val);
    this._minimum = val;
  }
});

/**
* Gets or sets the maximum value allowed for the figure parameter.
* @name FigureParameter#maximum

* @return {number}
*/
Object.defineProperty(FigureParameter.prototype, "maximum", {
  get: function() { return this._maximum; },
  set: function(val) {
    if (typeof val !== "number" || isNaN(val)) throw new Error("Maximum must be a real number, not: " + val);
    this._maximum = val;
  }
});


go.Shape._FigureParameters = {};

/*
 * This static function gets a FigureParameter for a particular figure name.
 * @param {String} figurename
 * @param {number} index, currently must be either 0 or 1
 * @return {FigureParameter}
 */
go.Shape.getFigureParameter = function(figurename, index) {
  var arr = go.Shape._FigureParameters[figurename];
  if (!arr) return null;
  return /** @type {FigureParmeter} */ (arr[index]);
};

/*
 * This static function sets a FigureParameter for a particular figure name.
 * @param {String} figurename
 * @param {number} index, currently must be either 0 or 1
 * @param {FigureParameter} figparam
 */
go.Shape.setFigureParameter = function(figurename, index, figparam) {
  if (!(figparam instanceof FigureParameter)) throw new Error("Third argument to Shape.setFigureParameter is not FigureParameter: " + figparam);
  if (figparam.defaultValue < figparam.minimum || figparam.defaultValue > figparam.maximum) throw new Error("defaultValue must be between minimum and maximum, not: " + figparam.defaultValue);
  var arr = go.Shape._FigureParameters[figurename];
  if (!arr) {
    arr = [];
    go.Shape._FigureParameters[figurename] = arr;
  }
  arr[index] = figparam;
};

go.Shape.defineFigureGenerator("Terminal", function(shape, w, h) {
  var geo = new go.Geometry();
  var fig = new go.PathFigure(w * 0, h * .10, false);
  geo.add(fig);

  fig.add(new go.PathSegment(go.PathSegment.Line, w * 1, h * .10));
  fig.add(new go.PathSegment(go.PathSegment.Line, w * 1, h * .90));
  fig.add(new go.PathSegment(go.PathSegment.Line, w * 0, h * .90).close());
  var fig2 = new go.PathFigure(w * .10, h * .20, true); // is filled in our not
  geo.add(fig2);
  fig2.add(new go.PathSegment(go.PathSegment.Line, w * .10, h * .25));
  fig2.add(new go.PathSegment(go.PathSegment.Line, w * .22, h * .285)); // midpoint
  fig2.add(new go.PathSegment(go.PathSegment.Line, w * .10, h * .32));
  fig2.add(new go.PathSegment(go.PathSegment.Line, w * .10, h * .37));
  fig2.add(new go.PathSegment(go.PathSegment.Line, w * .275, h * .32));
  fig2.add(new go.PathSegment(go.PathSegment.Line, w * .275, h * .25).close());
  var fig3 = new go.PathFigure(w * .28, h * .37, true); // is filled in our not
  geo.add(fig3);
  fig3.add(new go.PathSegment(go.PathSegment.Line, w * .45, h * .37));
  fig3.add(new go.PathSegment(go.PathSegment.Line, w * .45, h * .41));
  fig3.add(new go.PathSegment(go.PathSegment.Line, w * .28, h * .41).close());
  return geo;
});