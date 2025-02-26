// mingo.js 1.3.3
// Copyright (c) 2017 Francis Asante
// https://github.com/kofrasa/mingo
// MIT

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.mingo = factory());
}(this, (function () { 'use strict';

/**
 * Polyfill to add native methods for non-supported environments.
 */

// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_objects/Function/bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new Error('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs = Array.prototype.slice.call(arguments, 1);
    var fToBind = this;
    var fNOP = function fNOP() {};
    var fBound = function fBound() {
      return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
    };

    if (this.prototype) {
      // Function.prototype doesn't have a prototype property
      fNOP.prototype = this.prototype;
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function value(predicate) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);
      var len = o.length >>> 0;

      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      var thisArg = arguments[1];
      var k = 0;

      while (k < len) {
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        k++;
      }
      return undefined;
    }
  });
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function value(predicate) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);
      var len = o.length >>> 0;

      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      var thisArg = arguments[1];
      var k = 0;
      while (k < len) {
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        k++;
      }
      return -1;
    }
  });
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function value(searchElement, fromIndex) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);
      var len = o.length >>> 0;

      if (len === 0) {
        return false;
      }
      var n = fromIndex | 0;
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
      }

      while (k < len) {
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        k++;
      }
      return false;
    }
  });
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign != 'function') {
  Object.assign = function (target, varArgs) {
    // .length of function is 2

    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);
    var args = Array.prototype.slice.call(arguments);

    for (var index = 1; index < args.length; index++) {
      var nextSource = args[index];

      if (nextSource != null) {
        // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (nextSource.hasOwnProperty(nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// http://tokenposts.blogspot.co.za/2012/04/javascript-objectkeys-browser.html
if (!Object.keys) {
  Object.keys = function (o) {
    if (o !== Object(o)) {
      throw new TypeError('Object.keys called on a non-object');
    }

    var result = [];
    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        result.push(k);
      }
    }
    return result;
  };
}

// https://github.com/es-shims/Object.values/blob/master/implementation.js
if (!Object.values) {
  Object.values = function (o) {
    if (o !== Object(o)) {
      throw new TypeError('Object.values called on a non-object');
    }
    var result = [];
    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        result.push(o[k]);
      }
    }
    return result;
  };
}

// Javascript native types
var T_NULL = 'null';
var T_UNDEFINED = 'undefined';
var T_BOOL = 'bool';
var T_BOOLEAN = 'boolean';
var T_NUMBER = 'number';
var T_STRING = 'string';
var T_DATE = 'date';
var T_REGEX = 'regex';
var T_REGEXP = 'regexp';
var T_ARRAY = 'array';
var T_OBJECT = 'object';
var T_FUNCTION = 'function';

// no array, object, or function types
var JS_SIMPLE_TYPES = [T_NULL, T_UNDEFINED, T_BOOLEAN, T_NUMBER, T_STRING, T_DATE, T_REGEXP];

// operator classes
var OP_AGGREGATE = 'aggregate';
var OP_GROUP = 'group';
var OP_PIPELINE = 'pipeline';
var OP_PROJECTION = 'projection';
var OP_QUERY = 'query';

/**
 * Utility functions
 */

function assert(condition, message) {
  if (falsey(condition)) err(message);
}

/**
 * Deep clone an object
 * @param obj
 * @returns {*}
 */
function clone(obj) {
  switch (jsType(obj)) {
    case T_ARRAY:
      return obj.map(clone);
    case T_OBJECT:
      return map(obj, clone);
    default:
      return obj;
  }
}

function getType(v) {
  if (v === null) return 'Null';
  if (v === undefined) return 'Undefined';
  return v.constructor.name;
}
function jsType(v) {
  return getType(v).toLowerCase();
}
function isBoolean(v) {
  return jsType(v) === T_BOOLEAN;
}
function isString(v) {
  return jsType(v) === T_STRING;
}
function isNumber(v) {
  return jsType(v) === T_NUMBER;
}
function isArray(v) {
  return jsType(v) === T_ARRAY;
}
function isArrayLike(v) {
  return !isNil(v) && has(v, 'length');
}
function isObject(v) {
  return jsType(v) === T_OBJECT;
}
function isObjectLike(v) {
  return v === Object(v);
} // objects, arrays, functions, date, custom object
function isDate(v) {
  return jsType(v) === T_DATE;
}
function isRegExp(v) {
  return jsType(v) === T_REGEXP;
}
function isFunction(v) {
  return jsType(v) === T_FUNCTION;
}
function isNil(v) {
  return isNull(v) || isUndefined(v);
}
function isNull(v) {
  return jsType(v) === T_NULL;
}
function isUndefined(v) {
  return jsType(v) === T_UNDEFINED;
}
function inArray(arr, item) {
  return arr.includes(item);
}
function notInArray(arr, item) {
  return !arr.includes(item);
}
function truthy(arg) {
  return !!arg;
}
function falsey(arg) {
  return !arg;
}
function isEmpty(x) {
  return isNil(x) || isArray(x) && x.length === 0 || isObject(x) && keys(x).length === 0 || !x;
}
// ensure a value is an array
function array(x) {
  return isArray(x) ? x : [x];
}
function has(obj, prop) {
  return obj.hasOwnProperty(prop);
}
function err(s) {
  throw new Error(s);
}
function keys(o) {
  return Object.keys(o);
}

// ////////////////// UTILS ////////////////////

// internal constants
var __MINGO_META = '__mingo__';

function addMeta(obj, value) {
  obj[__MINGO_META] = Object.assign(obj[__MINGO_META] || {}, value);
}

function hasMeta(obj, value) {
  return has(obj, __MINGO_META) && isObject(value) && isEqual(Object.assign({}, obj[__MINGO_META], value), obj[__MINGO_META]);
}

function dropMeta(obj) {
  if (has(obj, __MINGO_META)) delete obj[__MINGO_META];
}

/**
 * Iterate over an array or object
 * @param  {Array|Object} obj An object-like value
 * @param  {Function} fn The callback to run per item
 * @param  {*}   ctx  The object to use a context
 * @return {void}
 */
function each(obj, fn) {
  var ctx = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  assert(obj === Object(obj), "Cannot iterate over object of type '" + jsType(obj) + "'");

  if (isArrayLike(obj)) {
    for (var i = 0, len = obj.length; i < len; i++) {
      if (fn.call(ctx, obj[i], i, obj) === false) break;
    }
  } else {
    for (var k in obj) {
      if (has(obj, k)) {
        if (fn.call(ctx, obj[k], k, obj) === false) break;
      }
    }
  }
}

/**
 * Transform values in a collection
 *
 * @param  {Array|Object}   obj   An array/object whose values to transform
 * @param  {Function} fn The transform function
 * @param  {*}   ctx The value to use as the "this" context for the transform
 * @return {Array|Object} Result object after applying the transform
 */
function map(obj, fn) {
  var ctx = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (isArray(obj)) {
    return obj.map(fn, ctx);
  } else if (isObject(obj)) {
    var o = {};
    each(obj, function (v, k) {
      return o[k] = fn.call(ctx, v, k);
    }, obj);
    return o;
  }
}

/**
 * Reduce any array-like object
 * @param collection
 * @param fn
 * @param accumulator
 * @returns {*}
 */
function reduce(collection, fn, accumulator) {
  if (isArray(collection)) return collection.reduce(fn, accumulator);
  // array-like objects
  each(collection, function (v, k) {
    return accumulator = fn(accumulator, v, k, collection);
  });
  return accumulator;
}

/**
 * Returns the intersection between two arrays
 *
 * @param  {Array} xs The first array
 * @param  {Array} ys The second array
 * @return {Array}    Result array
 */
function intersection(xs, ys) {
  return xs.filter(inArray.bind(null, ys));
}

/**
 * Returns the union of two arrays
 *
 * @param  {Array} xs The first array
 * @param  {Array} ys The second array
 * @return {Array}   The result array
 */
function union(xs, ys) {
  return into(into([], xs), ys.filter(notInArray.bind(null, xs)));
}

/**
 * Flatten the array
 *
 * @param  {Array} xs The array to flatten
 * @param {Number} depth The number of nested lists to iterate
 */


/**
 * Determine whether two values are the same or strictly equivalent
 *
 * @param  {*}  a The first value
 * @param  {*}  b The second value
 * @return {Boolean}   Result of comparison
 */
function isEqual(a, b) {
  // strictly equal must be equal.
  if (a === b) return true;

  // unequal types and functions cannot be equal.
  var type = jsType(a);
  if (type !== jsType(b) || type === T_FUNCTION) return false;

  // we treat NaN as the same
  if (type === T_NUMBER && isNaN(a) && isNaN(b)) return true;

  // leverage toString for Date and RegExp types
  if (inArray([T_DATE, T_REGEXP], type)) return a.toString() === b.toString();

  if (type === T_ARRAY) {
    if (a.length === b.length && a.length === 0) return true;
    if (a.length !== b.length) return false;
    for (var i = 0, len = a.length; i < len; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
  } else if (type === T_OBJECT) {
    // deep compare objects
    var ka = keys(a);
    var kb = keys(b);

    // check length of keys early
    if (ka.length !== kb.length) return false;

    // we know keys are strings so we sort before comparing
    ka.sort();
    kb.sort();

    // compare keys
    if (!isEqual(ka, kb)) return false;

    // back to the drawing board
    for (var _i = 0, _len = ka.length; _i < _len; _i++) {
      var temp = ka[_i];
      if (!isEqual(a[temp], b[temp])) return false;
    }
  } else {
    // we do not know how to compare custom types so we guess
    return getHash(a) === getHash(b);
  }
  // best effort says values are equal :)
  return true;
}

/**
 * Return a new unique version of the collection
 * @param  {Array} xs The input collection
 * @return {Array}    A new collection with unique values
 */
function unique(xs) {
  var h = {};
  var arr = [];
  each(xs, function (item) {
    var k = getHash(item);
    if (!has(h, k)) {
      arr.push(item);
      h[k] = 0;
    }
  });
  return arr;
}

/**
 * Generates a random string of max length range [24,27]
 * @param n Size of string to return
 * @returns {*}
 */
function randomString(n) {
  return (Math.E + Math.random()).toString(36).slice(2, n + 2);
}

/**
 * Encode value using a simple optimistic stable scheme.
 * @param value
 * @returns {*}
 */
function encode(value) {
  var type = jsType(value);
  switch (type) {
    case T_FUNCTION:
      return randomString(7);
    case T_BOOLEAN:
    case T_NUMBER:
    case T_REGEXP:
      return value.toString();
    case T_STRING:
      return JSON.stringify(value);
    case T_DATE:
      return value.toISOString();
    case T_NULL:
    case T_UNDEFINED:
      return type;
    case T_ARRAY:
      return '[' + map(value, function (v) {
        return '' + encode(v);
      }) + ']';
    default:
      var prefix = type === T_OBJECT ? '' : getType(value) + '|';
      var objKeys = keys(value);
      objKeys.sort();
      return prefix + '{' + map(objKeys, function (k) {
        return encode(k) + ':' + encode(value[k]);
      }) + '}';
  }
}

/**
 * Generate hash code
 * http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 *
 * @param value
 * @returns {*}
 */
function getHash(value) {
  var hash = 0,
      i = void 0,
      chr = void 0,
      len = void 0,
      s = encode(value);
  if (s.length === 0) return hash;
  for (i = 0, len = s.length; i < len; i++) {
    chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}

/**
 * Returns a (stably) sorted copy of list, ranked in ascending order by the results of running each value through iteratee
 *
 * This implementation treats null/undefined sort keys as less than every other type
 *
 * @param  {Array}   collection
 * @param  {Function} fn The function used to resolve sort keys
 * @param {Object} ctx The context to use for calling `fn`
 * @return {Array} Returns a new sorted array by the given iteratee
 */
function sortBy(collection, fn) {
  var ctx = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  var sortKeys = {};
  var sorted = [];
  var len = collection.length;
  var result = [];

  for (var i = 0; i < len; i++) {
    var obj = collection[i];
    var key = fn.call(ctx, obj, i);
    if (isNil(key)) {
      // objects with null keys will go in first
      result.push(obj);
    } else {
      var hash = getHash(obj);
      if (!has(sortKeys, hash)) {
        sortKeys[hash] = [key, i];
      }
      sorted.push(obj);
    }
  }
  // use native array sorting but enforce stableness
  sorted.sort(function (a, b) {
    var A = sortKeys[getHash(a)];
    var B = sortKeys[getHash(b)];
    if (A[0] < B[0]) return -1;
    if (A[0] > B[0]) return 1;
    if (A[1] < B[1]) return -1;
    if (A[1] > B[1]) return 1;
    return 0;
  });
  return into(result, sorted);
}

/**
 * Groups the collection into sets by the returned key
 *
 * @param collection
 * @param fn {Function} to compute the group key of an item in the collection
 * @param ctx {Object} The context to use for calling `fn`
 * @returns {{keys: Array, groups: Array}}
 */
function groupBy(collection, fn, ctx) {
  var result = {
    'keys': [],
    'groups': []
  };
  var lookup = {};
  each(collection, function (obj) {
    var key = fn.call(ctx, obj);
    var hash = getHash(key);
    var index = -1;

    if (isUndefined(lookup[hash])) {
      index = result.keys.length;
      lookup[hash] = index;
      result.keys.push(key);
      result.groups.push([]);
    }
    index = lookup[hash];
    result.groups[index].push(obj);
  });
  return result;
}

/**
 * Push elements in given array into target array
 *
 * @param {*} target The array to push into
 * @param {*} xs The array of elements to push
 */
function into(target, xs) {
  Array.prototype.push.apply(target, xs);
  return target;
}

/**
 * Find the insert index for the given key in a sorted array.
 *
 * @param {*} array The sorted array to search
 * @param {*} key The search key
 */
function findInsertIndex(array, key) {
  // uses binary search
  var lo = 0;
  var hi = array.length - 1;
  while (lo <= hi) {
    var mid = Math.round(lo + (hi - lo) / 2);
    if (key < array[mid]) {
      hi = mid - 1;
    } else if (key > array[mid]) {
      lo = mid + 1;
    } else {
      return mid;
    }
  }
  return lo;
}

/**
 * This is a generic memoization function
 *
 * This implementation uses a cache independent of the function being memoized
 * to allow old values to be garbage collected when the memoized function goes out of scope.
 *
 * @param {*} fn The function object to memoize
 */
function memoize(fn) {
  var _this = this;

  return function (cache) {
    return function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key = 0; _key < _len2; _key++) {
        args[_key] = arguments[_key];
      }

      var key = getHash(args);
      if (!has(cache, key)) {
        cache[key] = fn.apply(_this, args);
      }
      return cache[key];
    };
  }({/* storage */});
}

/**
 * Group stage Accumulator Operators. https://docs.mongodb.com/manual/reference/operator/aggregation-group/
 */

var groupOperators = {

  /**
   * Returns an array of all the unique values for the selected field among for each document in that group.
   *
   * @param collection
   * @param expr
   * @returns {*}
   */
  $addToSet: function $addToSet(collection, expr) {
    return unique(this.$push(collection, expr));
  },


  /**
   * Returns the sum of all the values in a group.
   *
   * @param collection
   * @param expr
   * @returns {*}
   */
  $sum: function $sum(collection, expr) {
    if (!isArray(collection)) return 0;

    if (isNumber(expr)) {
      // take a short cut if expr is number literal
      return collection.length * expr;
    }
    return reduce(this.$push(collection, expr).filter(isNumber), function (acc, n) {
      return acc + n;
    }, 0);
  },


  /**
   * Returns the highest value in a group.
   *
   * @param collection
   * @param expr
   * @returns {*}
   */
  $max: function $max(collection, expr) {
    var mapped = this.$push(collection, expr);
    return reduce(mapped, function (acc, n) {
      return isNil(acc) || n > acc ? n : acc;
    }, undefined);
  },


  /**
   * Returns the lowest value in a group.
   *
   * @param collection
   * @param expr
   * @returns {*}
   */
  $min: function $min(collection, expr) {
    var mapped = this.$push(collection, expr);
    return reduce(mapped, function (acc, n) {
      return isNil(acc) || n < acc ? n : acc;
    }, undefined);
  },


  /**
   * Returns an average of all the values in a group.
   *
   * @param collection
   * @param expr
   * @returns {number}
   */
  $avg: function $avg(collection, expr) {
    var data = this.$push(collection, expr).filter(isNumber);
    var sum = reduce(data, function (acc, n) {
      return acc + n;
    }, 0);
    return sum / (data.length || 1);
  },


  /**
   * Returns an array of all values for the selected field among for each document in that group.
   *
   * @param collection
   * @param expr
   * @returns {Array|*}
   */
  $push: function $push(collection, expr) {
    if (isNil(expr)) return collection;
    return map(collection, function (obj) {
      return computeValue(obj, expr);
    });
  },


  /**
   * Returns the first value in a group.
   *
   * @param collection
   * @param expr
   * @returns {*}
   */
  $first: function $first(collection, expr) {
    return collection.length > 0 ? computeValue(collection[0], expr) : undefined;
  },


  /**
   * Returns the last value in a group.
   *
   * @param collection
   * @param expr
   * @returns {*}
   */
  $last: function $last(collection, expr) {
    return collection.length > 0 ? computeValue(collection[collection.length - 1], expr) : undefined;
  },


  /**
   * Returns the population standard deviation of the input values.
   * @param  {Array} collection
   * @param  {Object} expr
   * @return {Number}
   */
  $stdDevPop: function $stdDevPop(collection, expr) {
    var data = this.$push(collection, expr).filter(isNumber);
    return stddev({ data: data, sampled: false });
  },


  /**
   * Returns the sample standard deviation of the input values.
   * @param  {Array} collection
   * @param  {Object} expr
   * @return {Number|null}
   */
  $stdDevSamp: function $stdDevSamp(collection, expr) {
    var data = this.$push(collection, expr).filter(isNumber);
    return stddev({ data: data, sampled: true });
  }
};

/**
 * Projection Operators. https://docs.mongodb.com/manual/reference/operator/projection/
 */
var projectionOperators = {

  /**
   * Projects the first element in an array that matches the query condition.
   *
   * @param obj
   * @param field
   * @param expr
   */
  $: function $(obj, expr, field) {
    err('$ not implemented');
  },


  /**
   * Projects only the first element from an array that matches the specified $elemMatch condition.
   *
   * @param obj
   * @param field
   * @param expr
   * @returns {*}
   */
  $elemMatch: function $elemMatch(obj, expr, field) {
    var arr = resolve(obj, field);
    var query = new Query(expr);

    if (isNil(arr) || !isArray(arr)) {
      return undefined;
    }

    for (var i = 0; i < arr.length; i++) {
      if (query.test(arr[i])) {
        return [arr[i]];
      }
    }

    return undefined;
  },


  /**
   * Limits the number of elements projected from an array. Supports skip and limit slices.
   *
   * @param obj
   * @param field
   * @param expr
   */
  $slice: function $slice(obj, expr, field) {
    var xs = resolve(obj, field);

    if (!isArray(xs)) return xs;

    if (isArray(expr)) {
      return slice(xs, expr[0], expr[1]);
    } else if (isNumber(expr)) {
      return slice(xs, expr);
    } else {
      err('Invalid argument type for $slice projection operator');
    }
  },


  /**
   * Returns the population standard deviation of the input values.
   * @param  {Object} obj
   * @param  {Object} expr
   * @param  {String} field
   * @return {Number}
   */
  $stdDevPop: function $stdDevPop(obj, expr, field) {
    return stddev({
      data: computeValue(obj, expr, field),
      sampled: false
    });
  },


  /**
   * Returns the sample standard deviation of the input values.
   * @param  {Object} obj
   * @param  {Object} expr
   * @param  {String} field
   * @return {Number|null}
   */
  $stdDevSamp: function $stdDevSamp(obj, expr, field) {
    return stddev({
      data: computeValue(obj, expr, field),
      sampled: true
    });
  }
};

/**
 * Pipeline Aggregation Stages. https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/
 */
var pipelineOperators = {

  /**
   * Adds new fields to documents.
   * Outputs documents that contain all existing fields from the input documents and newly added fields.
   *
   * @param {Array} collection
   * @param {*} expr
   */
  $addFields: function $addFields(collection, expr) {
    var newFields = keys(expr);

    return collection.map(function (obj) {
      obj = clone(obj);
      each(newFields, function (field) {
        var subExpr = expr[field];
        var newValue = computeValue(obj, subExpr);
        traverse(obj, field, function (o, key) {
          o[key] = newValue;
        }, true);
      });
      return obj;
    });
  },


  /**
   * Groups documents together for the purpose of calculating aggregate values based on a collection of documents.
   *
   * @param collection
   * @param expr
   * @returns {Array}
   */
  $group: function $group(collection, expr) {
    // lookup key for grouping
    var ID_KEY = idKey();
    var objectId = expr[ID_KEY];

    var partitions = groupBy(collection, function (obj) {
      return computeValue(obj, objectId, objectId);
    });

    var result = [];

    // remove the group key
    delete expr[ID_KEY];

    each(partitions.keys, function (value, i) {
      var obj = {};

      // exclude undefined key value
      if (!isUndefined(value)) {
        obj[ID_KEY] = value;
      }

      // compute remaining keys in expression
      each(expr, function (val, key) {
        obj[key] = accumulate(partitions.groups[i], key, val);
      });
      result.push(obj);
    });

    return result;
  },


  /**
   * Performs a left outer join to another collection in the same database to filter in documents from the “joined” collection for processing.
   *
   * @param collection
   * @param expr
   */
  $lookup: function $lookup(collection, expr) {
    var joinColl = expr.from;
    var localField = expr.localField;
    var foreignField = expr.foreignField;
    var asField = expr.as;

    var errorMsg = "Invalid $lookup expression. ";
    assert(isArray(joinColl), errorMsg + "'from' must be an array");
    assert(isString(foreignField), errorMsg + "'foreignField' must be a string");
    assert(isString(localField), errorMsg + "'localField' must be a string");
    assert(isString(asField), errorMsg + "'as' must be a string");

    var result = [];
    var hash = {};

    function hashCode(v) {
      return getHash(isNil(v) ? null : v);
    }

    if (joinColl.length <= collection.length) {
      each(joinColl, function (obj, i) {
        var k = hashCode(obj[foreignField]);
        hash[k] = hash[k] || [];
        hash[k].push(i);
      });

      each(collection, function (obj) {
        var k = hashCode(obj[localField]);
        var indexes = hash[k] || [];
        var newObj = clone(obj);
        newObj[asField] = indexes.map(function (i) {
          return clone(joinColl[i]);
        });
        result.push(newObj);
      });
    } else {

      each(collection, function (obj, i) {
        var k = hashCode(obj[localField]);
        hash[k] = hash[k] || [];
        hash[k].push(i);
      });

      var tempResult = {};
      each(joinColl, function (obj) {
        var k = hashCode(obj[foreignField]);
        var indexes = hash[k] || [];
        each(indexes, function (i) {
          var newObj = tempResult[i] || clone(collection[i]);
          newObj[asField] = newObj[asField] || [];
          newObj[asField].push(clone(obj));
          tempResult[i] = newObj;
        });
      });
      for (var i = 0, len = keys(tempResult).length; i < len; i++) {
        result.push(tempResult[i]);
      }
    }

    return result;
  },


  /**
   * Filters the document stream, and only allows matching documents to pass into the next pipeline stage.
   * $match uses standard MongoDB queries.
   *
   * @param collection
   * @param expr
   * @returns {Array|*}
   */
  $match: function $match(collection, expr) {
    return new Query(expr).find(collection).all();
  },


  /**
   * Reshapes a document stream.
   * $project can rename, add, or remove fields as well as create computed values and sub-documents.
   *
   * @param collection
   * @param expr
   * @returns {Array}
   */
  $project: function $project(collection, expr) {
    if (isEmpty(expr)) {
      return collection;
    }

    // result collection
    var projected = [];
    var objKeys = keys(expr);
    var idOnlyExcludedExpression = false;
    var ID_KEY = idKey();

    // validate inclusion and exclusion
    var check = [false, false];
    each(expr, function (v, k) {
      if (k === ID_KEY) return;
      if (v === 0 || v === false) {
        check[0] = true;
      } else {
        check[1] = true;
      }
      assert(check[0] !== check[1], 'Projection cannot have a mix of inclusion and exclusion.');
    });

    if (inArray(objKeys, ID_KEY)) {
      var id = expr[ID_KEY];
      if (id === 0 || id === false) {
        objKeys = objKeys.filter(notInArray.bind(null, [ID_KEY]));
        assert(notInArray(objKeys, ID_KEY), 'Must not contain collections id key');
        idOnlyExcludedExpression = isEmpty(objKeys);
      }
    } else {
      // if not specified the add the ID field
      objKeys.push(ID_KEY);
    }

    each(collection, function (obj) {
      var cloneObj = {};
      var foundSlice = false;
      var foundExclusion = false;
      var dropKeys = [];

      if (idOnlyExcludedExpression) {
        dropKeys.push(ID_KEY);
      }

      each(objKeys, function (key) {
        var subExpr = expr[key];
        var value = void 0; // final computed value of the key

        if (key !== ID_KEY && subExpr === 0) {
          foundExclusion = true;
        }

        if (key === ID_KEY && isEmpty(subExpr)) {
          // tiny optimization here to skip over id
          value = obj[key];
        } else if (isString(subExpr)) {
          value = computeValue(obj, subExpr, key);
        } else if (subExpr === 1 || subExpr === true) {
          // For direct projections, we use the resolved object value
        } else if (isObject(subExpr)) {
          var operator = keys(subExpr);
          operator = operator.length > 1 ? false : operator[0];

          if (inArray(ops(OP_PROJECTION), operator)) {
            // apply the projection operator on the operator expression for the key
            if (operator === '$slice') {
              // $slice is handled differently for aggregation and projection operations
              if (array(subExpr[operator]).every(isNumber)) {
                // $slice for projection operation
                value = projectionOperators[operator](obj, subExpr[operator], key);
                foundSlice = true;
              } else {
                // $slice for aggregation operation
                value = computeValue(obj, subExpr, key);
              }
            } else {
              value = projectionOperators[operator](obj, subExpr[operator], key);
            }
          } else {
            // compute the value for the sub expression for the key
            value = computeValue(obj, subExpr, key);
          }
        } else {
          dropKeys.push(key);
          return;
        }

        // clone resolved values
        var objValue = clone(resolveObj(obj, key));

        if (!isUndefined(objValue)) {
          Object.assign(cloneObj, objValue);
        }
        if (!isUndefined(value)) {
          setValue(cloneObj, key, clone(value));
        }
      });
      // if projection included $slice operator
      // Also if exclusion fields are found or we want to exclude only the id field
      // include keys that were not explicitly excluded
      if (foundSlice || foundExclusion || idOnlyExcludedExpression) {
        cloneObj = Object.assign(clone(obj), cloneObj);
        each(dropKeys, function (key) {
          return removeValue(cloneObj, key);
        });
      }
      projected.push(cloneObj);
    });

    return projected;
  },


  /**
   * Restricts the number of documents in an aggregation pipeline.
   *
   * @param collection
   * @param value
   * @returns {Object|*}
   */
  $limit: function $limit(collection, value) {
    return collection.slice(0, value);
  },


  /**
   * Skips over a specified number of documents from the pipeline and returns the rest.
   *
   * @param collection
   * @param value
   * @returns {*}
   */
  $skip: function $skip(collection, value) {
    return collection.slice(value);
  },


  /**
   * Takes an array of documents and returns them as a stream of documents.
   *
   * @param collection
   * @param expr
   * @returns {Array}
   */
  $unwind: function $unwind(collection, expr) {
    var result = [];
    var field = expr.substr(1);
    each(collection, function (obj) {
      // must throw an error if value is not an array
      var value = getValue(obj, field);

      assert(isArray(value), "Target field '" + field + "' is not of type Array.");

      each(value, function (item) {
        var tmp = clone(obj);
        tmp[field] = item;
        result.push(tmp);
      });
    });
    return result;
  },


  /**
   * Takes all input documents and returns them in a stream of sorted documents.
   *
   * @param collection
   * @param sortKeys
   * @returns {*}
   */
  $sort: function $sort(collection, sortKeys) {
    if (!isEmpty(sortKeys) && isObject(sortKeys)) {
      var modifiers = keys(sortKeys);
      each(modifiers.reverse(), function (key) {
        var grouped = groupBy(collection, function (obj) {
          return resolve(obj, key);
        });
        var sortedIndex = {};
        var getIndex = function getIndex(k) {
          return sortedIndex[getHash(k)];
        };

        var indexKeys = sortBy(grouped.keys, function (item, i) {
          sortedIndex[getHash(item)] = i;
          return item;
        });

        if (sortKeys[key] === -1) {
          indexKeys.reverse();
        }
        collection = [];
        each(indexKeys, function (item) {
          return into(collection, grouped.groups[getIndex(item)]);
        });
      });
    }
    return collection;
  },


  /**
   * Groups incoming documents based on the value of a specified expression,
   * then computes the count of documents in each distinct group.
   *
   * https://docs.mongodb.com/manual/reference/operator/aggregation/sortByCount/
   *
   * @param  {Array} collection
   * @param  {Object} expr
   * @return {*}
   */
  $sortByCount: function $sortByCount(collection, expr) {
    var newExpr = { count: { $sum: 1 } };
    newExpr[idKey()] = expr;

    return this.$sort(this.$group(collection, newExpr), { count: -1 });
  },


  /**
   * Randomly selects the specified number of documents from its input.
   * https://docs.mongodb.com/manual/reference/operator/aggregation/sample/
   *
   * @param  {Array} collection
   * @param  {Object} expr
   * @return {*}
   */
  $sample: function $sample(collection, expr) {
    var size = expr.size;
    assert(isNumber(size), '$sample size must be a positive integer');

    var result = [];
    var len = collection.length;
    for (var i = 0; i < size; i++) {
      var n = Math.floor(Math.random() * len);
      result.push(collection[n]);
    }
    return result;
  },


  /**
   * Returns a document that contains a count of the number of documents input to the stage.
   * @param  {Array} collection
   * @param  {String} expr
   * @return {Object}
   */
  $count: function $count(collection, expr) {
    assert(isString(expr) && expr.trim() !== '' && expr.indexOf('.') === -1 && expr.trim()[0] !== '$', 'Invalid expression value for $count');

    var result = {};
    result[expr] = collection.length;
    return result;
  },


  /**
   * Replaces a document with the specified embedded document or new one.
   * The replacement document can be any valid expression that resolves to a document.
   *
   * https://docs.mongodb.com/manual/reference/operator/aggregation/replaceRoot/
   *
   * @param  {Array} collection
   * @param  {Object} expr
   * @return {*}
   */
  $replaceRoot: function $replaceRoot(collection, expr) {
    var newRoot = expr.newRoot;
    var result = [];
    each(collection, function (obj) {
      obj = computeValue(obj, newRoot);
      assert(isObject(obj), '$replaceRoot expression must return a valid JS object');
      result.push(obj);
    });
    return result;
  },


  /**
   * Restricts the contents of the documents based on information stored in the documents themselves.
   *
   * https://docs.mongodb.com/manual/reference/operator/aggregation/redact/
   */
  $redact: function $redact(collection, expr) {
    return collection.map(function (obj) {
      return redactObj(clone(obj), expr);
    });
  },


  /**
   * Categorizes incoming documents into groups, called buckets, based on a specified expression and bucket boundaries.
   *
   * https://docs.mongodb.com/manual/reference/operator/aggregation/bucket/
   */
  $bucket: function $bucket(collection, expr) {
    var boundaries = expr.boundaries;
    var defaultKey = expr.default;
    var lower = boundaries[0]; // inclusive
    var upper = boundaries[boundaries.length - 1]; // exclusive
    var outputExpr = expr.output || { 'count': { '$sum': 1 } };

    assert(boundaries.length > 2, "$bucket 'boundaries' expression must have at least 3 elements");
    var boundType = getType(lower);

    for (var i = 0, len = boundaries.length - 1; i < len; i++) {
      assert(boundType === getType(boundaries[i + 1]), "$bucket 'boundaries' must all be of the same type");
      assert(boundaries[i] < boundaries[i + 1], "$bucket 'boundaries' must be sorted in ascending order");
    }

    if (!isNil(defaultKey) && getType(expr.default) === getType(lower)) {
      assert(lower > expr.default || upper < expr.default, "$bucket 'default' expression must be out of boundaries range");
    }

    var grouped = {};
    each(boundaries, function (k) {
      return grouped[k] = [];
    });

    // add default key if provided
    if (!isNil(defaultKey)) grouped[defaultKey] = [];

    each(collection, function (obj) {
      var key = computeValue(obj, expr.groupBy);

      if (isNil(key) || key < lower || key >= upper) {
        assert(!isNil(defaultKey), '$bucket require a default for out of range values');
        grouped[defaultKey].push(obj);
      } else if (key >= lower && key < upper) {
        var index = findInsertIndex(boundaries, key);
        var boundKey = boundaries[Math.max(0, index - 1)];
        grouped[boundKey].push(obj);
      } else {
        err("$bucket 'groupBy' expression must resolve to a value in range of boundaries");
      }
    });

    // upper bound is exclusive so we remove it
    boundaries.pop();
    if (!isNil(defaultKey)) boundaries.push(defaultKey);

    return map(boundaries, function (key) {
      var acc = accumulate(grouped[key], null, outputExpr);
      return Object.assign(acc, { '_id': key });
    });
  },
  $bucketAuto: function $bucketAuto(collection, expr) {
    var outputExpr = expr.output || { 'count': { '$sum': 1 } };
    var groupByExpr = expr.groupBy;
    var bucketCount = expr.buckets;

    assert(bucketCount > 0, "The $bucketAuto 'buckets' field must be greater than 0, but found: " + bucketCount);

    var approxBucketSize = Math.round(collection.length / bucketCount);
    if (approxBucketSize < 1) {
      approxBucketSize = 1;
    }

    var computeValueOptimized = memoize(computeValue);
    var grouped = {};
    var remaining = [];
    var sorted = sortBy(collection, function (o) {
      var key = computeValueOptimized(o, groupByExpr);
      if (isNil(key)) {
        remaining.push(o);
      } else {
        grouped[key] || (grouped[key] = []);
        grouped[key].push(o);
      }
      return key;
    });

    var ID_KEY = idKey();
    var result = [];
    var index = 0; // counter for sorted collection

    for (var i = 0, len = sorted.length; i < bucketCount && index < len; i++) {
      var boundaries = {};
      var bucketItems = [];

      for (var j = 0; j < approxBucketSize && index < len; j++) {
        var key = computeValueOptimized(sorted[index], groupByExpr);

        if (isNil(key)) key = null;

        // populate current bucket with all values for current key
        into(bucketItems, isNil(key) ? remaining : grouped[key]);

        // increase sort index by number of items added
        index += isNil(key) ? remaining.length : grouped[key].length;

        // set the min key boundary if not already present
        if (!has(boundaries, 'min')) boundaries.min = key;

        if (result.length > 0) {
          var lastBucket = result[result.length - 1];
          lastBucket[ID_KEY].max = boundaries.min;
        }
      }

      // if is last bucket add remaining items
      if (i == bucketCount - 1) {
        into(bucketItems, sorted.slice(index));
      }

      result.push(Object.assign(accumulate(bucketItems, null, outputExpr), { '_id': boundaries }));
    }

    if (result.length > 0) {
      result[result.length - 1][ID_KEY].max = computeValueOptimized(sorted[sorted.length - 1], groupByExpr);
    }

    return result;
  },


  /**
   * Processes multiple aggregation pipelines within a single stage on the same set of input documents.
   * Enables the creation of multi-faceted aggregations capable of characterizing data across multiple dimensions, or facets, in a single stage.
   */
  $facet: function $facet(collection, expr) {
    return map(expr, function (pipeline) {
      return aggregate(collection, pipeline);
    });
  }
};

/**
 * Returns the result of evaluating a $group operation over a collection
 *
 * @param collection
 * @param field the name of the aggregate operator or field
 * @param expr the expression of the aggregate operator for the field
 * @returns {*}
 */
function accumulate(collection, field, expr) {
  if (inArray(ops(OP_GROUP), field)) {
    return groupOperators[field](collection, expr);
  }

  if (isObject(expr)) {
    var result = {};
    each(expr, function (val, key) {
      result[key] = accumulate(collection, key, expr[key]);
      // must run ONLY one group operator per expression
      // if so, return result of the computed value
      if (inArray(ops(OP_GROUP), key)) {
        result = result[key];
        // if there are more keys in expression this is bad
        assert(keys(expr).length === 1, "Invalid $group expression '" + JSON.stringify(expr) + "'");
        return false; // break
      }
    });
    return result;
  }

  return undefined;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/**
 * Aggregator for defining filter using mongoDB aggregation pipeline syntax
 *
 * @param operators an Array of pipeline operators
 * @constructor
 */
var Aggregator = function () {
  function Aggregator(operators) {
    classCallCheck(this, Aggregator);

    this.__operators = operators;
  }

  /**
   * Apply the pipeline operations over the collection by order of the sequence added
   *
   * @param collection an array of objects to process
   * @param query the `Query` object to use as context
   * @returns {Array}
   */


  createClass(Aggregator, [{
    key: 'run',
    value: function run(collection, query) {
      if (!isEmpty(this.__operators)) {
        // run aggregation pipeline
        each(this.__operators, function (operator) {
          var key = keys(operator);
          assert(key.length === 1 && inArray(ops(OP_PIPELINE), key[0]), 'Invalid aggregation operator ' + key);
          key = key[0];
          if (query && query instanceof Query) {
            collection = pipelineOperators[key].call(query, collection, operator[key]);
          } else {
            collection = pipelineOperators[key](collection, operator[key]);
          }
        });
      }
      return collection;
    }
  }]);
  return Aggregator;
}();

/**
 * Return the result collection after running the aggregation pipeline for the given collection
 *
 * @param collection
 * @param pipeline
 * @returns {Array}
 */
function aggregate(collection, pipeline) {
  assert(isArray(pipeline), 'Aggregation pipeline must be an array');
  return new Aggregator(pipeline).run(collection);
}

/**
 * Cursor to iterate and perform filtering on matched objects
 * @param collection
 * @param query
 * @param projection
 * @constructor
 */
var Cursor = function () {
  function Cursor(collection, query, projection) {
    classCallCheck(this, Cursor);

    this.__query = query;
    this.__collection = collection;
    this.__projection = projection || query.__projection;
    this.__operators = {};
    this.__result = false;
    this.__position = 0;
  }

  createClass(Cursor, [{
    key: '_fetch',
    value: function _fetch() {
      var _this = this;

      if (this.__result !== false) {
        return this.__result;
      }

      // inject projection operator
      if (isObject(this.__projection)) {
        Object.assign(this.__operators, { '$project': this.__projection });
      }

      assert(isArray(this.__collection), 'Input collection is not of valid type. Must be an Array.');

      // filter collection
      this.__result = this.__collection.filter(this.__query.test, this.__query);
      var pipeline = [];

      each(['$sort', '$skip', '$limit', '$project'], function (op) {
        if (has(_this.__operators, op)) {
          var selected = {};
          selected[op] = _this.__operators[op];
          pipeline.push(selected);
        }
      });

      if (pipeline.length > 0) {
        var aggregator = new Aggregator(pipeline);
        this.__result = aggregator.run(this.__result, this.__query);
      }
      return this.__result;
    }

    /**
     * Fetch and return all matched results
     * @returns {Array}
     */

  }, {
    key: 'all',
    value: function all() {
      return this._fetch();
    }

    /**
     * Fetch and return the first matching result
     * @returns {Object}
     */

  }, {
    key: 'first',
    value: function first() {
      return this.count() > 0 ? this._fetch()[0] : null;
    }

    /**
     * Fetch and return the last matching object from the result
     * @returns {Object}
     */

  }, {
    key: 'last',
    value: function last() {
      return this.count() > 0 ? this._fetch()[this.count() - 1] : null;
    }

    /**
     * Counts the number of matched objects found
     * @returns {Number}
     */

  }, {
    key: 'count',
    value: function count() {
      return this._fetch().length;
    }

    /**
     * Returns a cursor that begins returning results only after passing or skipping a number of documents.
     * @param {Number} n the number of results to skip.
     * @return {Cursor} Returns the cursor, so you can chain this call.
     */

  }, {
    key: 'skip',
    value: function skip(n) {
      Object.assign(this.__operators, { '$skip': n });
      return this;
    }

    /**
     * Constrains the size of a cursor's result set.
     * @param {Number} n the number of results to limit to.
     * @return {Cursor} Returns the cursor, so you can chain this call.
     */

  }, {
    key: 'limit',
    value: function limit(n) {
      Object.assign(this.__operators, { '$limit': n });
      return this;
    }

    /**
     * Returns results ordered according to a sort specification.
     * @param {Object} modifier an object of key and values specifying the sort order. 1 for ascending and -1 for descending
     * @return {Cursor} Returns the cursor, so you can chain this call.
     */

  }, {
    key: 'sort',
    value: function sort(modifier) {
      Object.assign(this.__operators, { '$sort': modifier });
      return this;
    }

    /**
     * Returns the next document in a cursor.
     * @returns {Object | Boolean}
     */

  }, {
    key: 'next',
    value: function next() {
      if (this.hasNext()) {
        return this._fetch()[this.__position++];
      }
      return null;
    }

    /**
     * Returns true if the cursor has documents and can be iterated.
     * @returns {boolean}
     */

  }, {
    key: 'hasNext',
    value: function hasNext() {
      return this.count() > this.__position;
    }

    /**
     * Specifies the exclusive upper bound for a specific field
     * @param expr
     * @returns {Number}
     */

  }, {
    key: 'max',
    value: function max(expr) {
      return groupOperators.$max(this._fetch(), expr);
    }

    /**
     * Specifies the inclusive lower bound for a specific field
     * @param expr
     * @returns {Number}
     */

  }, {
    key: 'min',
    value: function min(expr) {
      return groupOperators.$min(this._fetch(), expr);
    }

    /**
     * Applies a function to each document in a cursor and collects the return values in an array.
     * @param callback
     * @returns {Array}
     */

  }, {
    key: 'map',
    value: function map$$1(callback) {
      return this._fetch().map(callback);
    }

    /**
     * Applies a JavaScript function for every document in a cursor.
     * @param callback
     */

  }, {
    key: 'forEach',
    value: function forEach(callback) {
      each(this._fetch(), callback);
    }

    /**
     * Applies an [ES2015 Iteration protocol][] compatible implementation
     * [ES2015 Iteration protocol]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
     * @returns {Object}
     */

  }, {
    key: Symbol.iterator,
    value: function value() {
      var self = this;
      return {
        next: function next() {
          if (!self.hasNext()) {
            return { done: true };
          }
          return {
            done: false,
            value: self.next()
          };
        }
      };
    }
  }]);
  return Cursor;
}();

/**
 * Query and Projection Operators. https://docs.mongodb.com/manual/reference/operator/query/
 */
var simpleOperators = {

  /**
   * Checks that two values are equal.
   *
   * @param a         The lhs operand as resolved from the object by the given selector
   * @param b         The rhs operand provided by the user
   * @returns {*}
   */
  $eq: function $eq(a, b) {
    // start with simple equality check
    if (isEqual(a, b)) return true;

    // https://docs.mongodb.com/manual/tutorial/query-for-null-fields/
    if (isNil(a) && isNil(b)) return true;

    if (isArray(a)) {
      // is multi-valued lhs so we check each separately
      if (hasMeta(a, { isMulti: true })) {
        try {
          for (var i = 0; i < a.length; i++) {
            if (this.$eq(a[i], b)) {
              return true;
            }
          }
        } finally {
          dropMeta(a);
        }
      } else {
        // check one level deep
        return a.findIndex(isEqual.bind(null, b)) !== -1;
      }
    }
    return false;
  },


  /**
   * Matches all values that are not equal to the value specified in the query.
   *
   * @param a
   * @param b
   * @returns {boolean}
   */
  $ne: function $ne(a, b) {
    return !this.$eq(a, b);
  },


  /**
   * Matches any of the values that exist in an array specified in the query.
   *
   * @param a
   * @param b
   * @returns {*}
   */
  $in: function $in(a, b) {
    a = array(a);
    return intersection(a, b).length > 0;
  },


  /**
   * Matches values that do not exist in an array specified to the query.
   *
   * @param a
   * @param b
   * @returns {*|boolean}
   */
  $nin: function $nin(a, b) {
    return isNil(a) || !this.$in(a, b);
  },


  /**
   * Matches values that are less than the value specified in the query.
   *
   * @param a
   * @param b
   * @returns {boolean}
   */
  $lt: function $lt(a, b) {
    a = array(a).find(function (val) {
      return val < b;
    });
    return a !== undefined;
  },


  /**
   * Matches values that are less than or equal to the value specified in the query.
   *
   * @param a
   * @param b
   * @returns {boolean}
   */
  $lte: function $lte(a, b) {
    a = array(a).find(function (val) {
      return val <= b;
    });
    return a !== undefined;
  },


  /**
   * Matches values that are greater than the value specified in the query.
   *
   * @param a
   * @param b
   * @returns {boolean}
   */
  $gt: function $gt(a, b) {
    a = array(a).find(function (val) {
      return val > b;
    });
    return a !== undefined;
  },


  /**
   * Matches values that are greater than or equal to the value specified in the query.
   *
   * @param a
   * @param b
   * @returns {boolean}
   */
  $gte: function $gte(a, b) {
    a = array(a).find(function (val) {
      return val >= b;
    });
    return a !== undefined;
  },


  /**
   * Performs a modulo operation on the value of a field and selects documents with a specified result.
   *
   * @param a
   * @param b
   * @returns {boolean}
   */
  $mod: function $mod(a, b) {
    a = array(a).find(function (val) {
      return isNumber(val) && isArray(b) && b.length === 2 && val % b[0] === b[1];
    });
    return a !== undefined;
  },


  /**
   * Selects documents where values match a specified regular expression.
   *
   * @param a
   * @param b
   * @returns {boolean}
   */
  $regex: function $regex(a, b) {
    a = array(a).find(function (val) {
      return isString(val) && isRegExp(b) && !!val.match(b);
    });
    return a !== undefined;
  },


  /**
   * Matches documents that have the specified field.
   *
   * @param a
   * @param b
   * @returns {boolean}
   */
  $exists: function $exists(a, b) {
    return (b === false || b === 0) && isNil(a) || (b === true || b === 1) && !isNil(a);
  },


  /**
   * Matches arrays that contain all elements specified in the query.
   *
   * @param a
   * @param b
   * @returns boolean
   */
  $all: function $all(a, b) {
    var matched = false;
    if (isArray(a) && isArray(b)) {
      for (var i = 0, len = b.length; i < len; i++) {
        if (isObject(b[i]) && inArray(keys(b[i]), '$elemMatch')) {
          matched = matched || this.$elemMatch(a, b[i].$elemMatch);
        } else {
          // order of arguments matter
          return intersection(b, a).length === len;
        }
      }
    }
    return matched;
  },


  /**
   * Selects documents if the array field is a specified size.
   *
   * @param a
   * @param b
   * @returns {*|boolean}
   */
  $size: function $size(a, b) {
    return isArray(a) && isNumber(b) && a.length === b;
  },


  /**
   * Selects documents if element in the array field matches all the specified $elemMatch condition.
   *
   * @param a
   * @param b
   */
  $elemMatch: function $elemMatch(a, b) {
    if (isArray(a) && !isEmpty(a)) {
      var query = new Query(b);
      for (var i = 0, len = a.length; i < len; i++) {
        if (query.test(a[i])) {
          return true;
        }
      }
    }
    return false;
  },


  /**
   * Selects documents if a field is of the specified type.
   *
   * @param a
   * @param b
   * @returns {boolean}
   */
  $type: function $type(a, b) {
    switch (b) {
      case 1:
      case 'double':
        return isNumber(a) && (a + '').indexOf('.') !== -1;
      case 2:
      case T_STRING:
        return isString(a);
      case 3:
      case T_OBJECT:
        return isObject(a);
      case 4:
      case T_ARRAY:
        return isArray(a);
      case 6:
      case T_UNDEFINED:
        return isNil(a);
      case 8:
      case T_BOOL:
        return isBoolean(a);
      case 9:
      case T_DATE:
        return isDate(a);
      case 10:
      case T_NULL:
        return isNull(a);
      case 11:
      case T_REGEX:
        return isRegExp(a);
      case 16:
      case 'int':
        return isNumber(a) && a <= 2147483647 && (a + '').indexOf('.') === -1;
      case 18:
      case 'long':
        return isNumber(a) && a > 2147483647 && a <= 9223372036854775807 && (a + '').indexOf('.') === -1;
      case 19:
      case 'decimal':
        return isNumber(a);
      default:
        return false;
    }
  }
};

var queryOperators = {

  /**
   * Joins query clauses with a logical AND returns all documents that match the conditions of both clauses.
   *
   * @param selector
   * @param value
   * @returns {{test: Function}}
   */
  $and: function $and(selector, value) {
    assert(isArray(value), 'Invalid expression: $and expects value to be an Array');

    var queries = [];
    each(value, function (expr) {
      return queries.push(new Query(expr));
    });

    return {
      test: function test(obj) {
        for (var i = 0; i < queries.length; i++) {
          if (!queries[i].test(obj)) {
            return false;
          }
        }
        return true;
      }
    };
  },


  /**
   * Joins query clauses with a logical OR returns all documents that match the conditions of either clause.
   *
   * @param selector
   * @param value
   * @returns {{test: Function}}
   */
  $or: function $or(selector, value) {
    assert(isArray(value), 'Invalid expression. $or expects value to be an Array');

    var queries = [];
    each(value, function (expr) {
      return queries.push(new Query(expr));
    });

    return {
      test: function test(obj) {
        for (var i = 0; i < queries.length; i++) {
          if (queries[i].test(obj)) {
            return true;
          }
        }
        return false;
      }
    };
  },


  /**
   * Joins query clauses with a logical NOR returns all documents that fail to match both clauses.
   *
   * @param selector
   * @param value
   * @returns {{test: Function}}
   */
  $nor: function $nor(selector, value) {
    assert(isArray(value), 'Invalid expression. $nor expects value to be an Array');
    var query = this.$or('$or', value);
    return {
      test: function test(obj) {
        return !query.test(obj);
      }
    };
  },


  /**
   * Inverts the effect of a query expression and returns documents that do not match the query expression.
   *
   * @param selector
   * @param value
   * @returns {{test: Function}}
   */
  $not: function $not(selector, value) {
    var criteria = {};
    criteria[selector] = normalize(value);
    var query = new Query(criteria);
    return {
      test: function test(obj) {
        return !query.test(obj);
      }
    };
  },


  /**
   * Matches documents that satisfy a JavaScript expression.
   *
   * @param selector
   * @param value
   * @returns {{test: test}}
   */
  $where: function $where(selector, value) {
    if (!isFunction(value)) {
      value = new Function('return ' + value + ';');
    }
    return {
      test: function test(obj) {
        return value.call(obj) === true;
      }
    };
  }
};

// add simple query operators
each(simpleOperators, function (fn, op) {
  queryOperators[op] = function (f, ctx) {
    return function (selector, value) {
      return {
        test: function test(obj) {
          // value of field must be fully resolved.
          var lhs = resolve(obj, selector);
          return f.call(ctx, lhs, value);
        }
      };
    };
  }(fn, simpleOperators);
});

/**
 * Query object to test collection elements with
 * @param criteria the pass criteria for the query
 * @param projection optional projection specifiers
 * @constructor
 */
var Query = function () {
  function Query(criteria) {
    var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, Query);

    this.__criteria = criteria;
    this.__projection = projection;
    this.__compiled = [];
    this._compile();
  }

  createClass(Query, [{
    key: '_compile',
    value: function _compile() {
      var _this = this;

      if (isEmpty(this.__criteria)) return;

      assert(isObject(this.__criteria), 'Criteria must be of type Object');

      var whereOperator = void 0;

      each(this.__criteria, function (expr, field) {
        // save $where operators to be executed after other operators
        if ('$where' === field) {
          whereOperator = { field: field, expr: expr };
        } else if (inArray(['$and', '$or', '$nor'], field)) {
          _this._processOperator(field, field, expr);
        } else {
          // normalize expression
          expr = normalize(expr);
          each(expr, function (val, op) {
            _this._processOperator(field, op, val);
          });
        }

        if (isObject(whereOperator)) {
          _this._processOperator(whereOperator.field, whereOperator.field, whereOperator.expr);
        }
      });
    }
  }, {
    key: '_processOperator',
    value: function _processOperator(field, operator, value) {
      if (inArray(ops(OP_QUERY), operator)) {
        this.__compiled.push(queryOperators[operator](field, value));
      } else {
        err("Invalid query operator '" + operator + "' detected");
      }
    }

    /**
     * Checks if the object passes the query criteria. Returns true if so, false otherwise.
     * @param obj
     * @returns {boolean}
     */

  }, {
    key: 'test',
    value: function test(obj) {
      for (var i = 0, len = this.__compiled.length; i < len; i++) {
        if (!this.__compiled[i].test(obj)) {
          return false;
        }
      }
      return true;
    }

    /**
     * Performs a query on a collection and returns a cursor object.
     * @param collection
     * @param projection
     * @returns {Cursor}
     */

  }, {
    key: 'find',
    value: function find(collection, projection) {
      return new Cursor(collection, this, projection);
    }

    /**
     * Remove matched documents from the collection returning the remainder
     * @param collection
     * @returns {Array}
     */

  }, {
    key: 'remove',
    value: function remove(collection) {
      var _this2 = this;

      return reduce(collection, function (acc, obj) {
        if (!_this2.test(obj)) acc.push(obj);
        return acc;
      }, []);
    }
  }]);
  return Query;
}();

/**
 * Performs a query on a collection and returns a cursor object.
 *
 * @param collection
 * @param criteria
 * @param projection
 * @returns {Cursor}
 */
function find(collection, criteria, projection) {
  return new Query(criteria).find(collection, projection);
}

/**
 * Returns a new array without objects which match the criteria
 *
 * @param collection
 * @param criteria
 * @returns {Array}
 */
function remove(collection, criteria) {
  return new Query(criteria).remove(collection);
}

var arithmeticOperators = {

  /**
   * Returns the absolute value of a number.
   * https://docs.mongodb.com/manual/reference/operator/aggregation/abs/#exp._S_abs
   * @param obj
   * @param expr
   * @return {Number|null|NaN}
   */
  $abs: function $abs(obj, expr) {
    var val = computeValue(obj, expr);
    return val === null || val === undefined ? null : Math.abs(val);
  },


  /**
   * Computes the sum of an array of numbers.
   *
   * @param obj
   * @param expr
   * @returns {Object}
   */
  $add: function $add(obj, expr) {
    var args = computeValue(obj, expr);
    return reduce(args, function (acc, num) {
      return acc + num;
    }, 0);
  },


  /**
   * Returns the smallest integer greater than or equal to the specified number.
   *
   * @param obj
   * @param expr
   * @returns {number}
   */
  $ceil: function $ceil(obj, expr) {
    var arg = computeValue(obj, expr);
    if (isNaN(arg)) return NaN;
    if (isNil(arg)) return null;
    assert(isNumber(arg), '$ceil must be a valid expression that resolves to a number.');
    return Math.ceil(arg);
  },


  /**
   * Takes two numbers and divides the first number by the second.
   *
   * @param obj
   * @param expr
   * @returns {number}
   */
  $divide: function $divide(obj, expr) {
    var args = computeValue(obj, expr);
    return args[0] / args[1];
  },


  /**
   * Raises Euler’s number (i.e. e ) to the specified exponent and returns the result.
   *
   * @param obj
   * @param expr
   * @returns {number}
   */
  $exp: function $exp(obj, expr) {
    var arg = computeValue(obj, expr);
    if (isNaN(arg)) return NaN;
    if (isNil(arg)) return null;
    assert(isNumber(arg), '$exp must be a valid expression that resolves to a number.');
    return Math.exp(arg);
  },


  /**
   * Returns the largest integer less than or equal to the specified number.
   *
   * @param obj
   * @param expr
   * @returns {number}
   */
  $floor: function $floor(obj, expr) {
    var arg = computeValue(obj, expr);
    if (isNaN(arg)) return NaN;
    if (isNil(arg)) return null;
    assert(isNumber(arg), '$floor must be a valid expression that resolves to a number.');
    return Math.floor(arg);
  },


  /**
   * Calculates the natural logarithm ln (i.e loge) of a number and returns the result as a double.
   *
   * @param obj
   * @param expr
   * @returns {number}
   */
  $ln: function $ln(obj, expr) {
    var arg = computeValue(obj, expr);
    if (isNaN(arg)) return NaN;
    if (isNil(arg)) return null;
    assert(isNumber(arg), '$ln must be a valid expression that resolves to a number.');
    return Math.log(arg);
  },


  /**
   * Calculates the log of a number in the specified base and returns the result as a double.
   *
   * @param obj
   * @param expr
   * @returns {number}
   */
  $log: function $log(obj, expr) {
    var args = computeValue(obj, expr);
    assert(isArray(args) && args.length === 2, '$log must be a valid expression that resolves to an array of 2 items');
    if (args.some(isNaN)) return NaN;
    if (args.some(isNil)) return null;
    assert(args.every(isNumber), '$log expression must resolve to array of 2 numbers');
    return Math.log10(args[0]) / Math.log10(args[1]);
  },


  /**
   * Calculates the log base 10 of a number and returns the result as a double.
   *
   * @param obj
   * @param expr
   * @returns {number}
   */
  $log10: function $log10(obj, expr) {
    var arg = computeValue(obj, expr);
    if (isNaN(arg)) return NaN;
    if (isNil(arg)) return null;
    assert(isNumber(arg), '$log10 must be a valid expression that resolves to a number.');
    return Math.log10(arg);
  },


  /**
   * Takes two numbers and calculates the modulo of the first number divided by the second.
   *
   * @param obj
   * @param expr
   * @returns {number}
   */
  $mod: function $mod(obj, expr) {
    var args = computeValue(obj, expr);
    return args[0] % args[1];
  },


  /**
   * Computes the product of an array of numbers.
   *
   * @param obj
   * @param expr
   * @returns {Object}
   */
  $multiply: function $multiply(obj, expr) {
    var args = computeValue(obj, expr);
    return reduce(args, function (acc, num) {
      return acc * num;
    }, 1);
  },


  /**
   * Raises a number to the specified exponent and returns the result.
   *
   * @param obj
   * @param expr
   * @returns {Object}
   */
  $pow: function $pow(obj, expr) {
    var args = computeValue(obj, expr);

    assert(isArray(args) && args.length === 2 && args.every(isNumber), '$pow expression must resolve to an array of 2 numbers');
    assert(!(args[0] === 0 && args[1] < 0), '$pow cannot raise 0 to a negative exponent');

    return Math.pow(args[0], args[1]);
  },


  /**
   * Calculates the square root of a positive number and returns the result as a double.
   *
   * @param obj
   * @param expr
   * @returns {number}
   */
  $sqrt: function $sqrt(obj, expr) {
    var n = computeValue(obj, expr);
    if (isNaN(n)) return NaN;
    if (isNil(n)) return null;
    assert(isNumber(n) && n > 0, '$sqrt expression must resolve to non-negative number.');
    return Math.sqrt(n);
  },


  /**
   * Takes an array that contains two numbers or two dates and subtracts the second value from the first.
   *
   * @param obj
   * @param expr
   * @returns {number}
   */
  $subtract: function $subtract(obj, expr) {
    var args = computeValue(obj, expr);
    return args[0] - args[1];
  },


  /**
   * Truncates a number to its integer.
   *
   * @param obj
   * @param expr
   * @returns {number}
   */
  $trunc: function $trunc(obj, expr) {
    var n = computeValue(obj, expr);
    if (isNaN(n)) return NaN;
    if (isNil(n)) return null;
    assert(isNumber(n) && n > 0, '$trunc must be a valid expression that resolves to a non-negative number.');
    return Math.trunc(n);
  }
};

var arrayOperators = {
  /**
   * Returns the element at the specified array index.
   *
   * @param  {Object} obj
   * @param  {*} expr
   * @return {*}
   */
  $arrayElemAt: function $arrayElemAt(obj, expr) {
    var arr = computeValue(obj, expr);
    assert(isArray(arr) && arr.length === 2, '$arrayElemAt expression must resolve to an array of 2 elements');
    assert(isArray(arr[0]), 'First operand to $arrayElemAt must resolve to an array');
    assert(isNumber(arr[1]), 'Second operand to $arrayElemAt must resolve to an integer');
    var idx = arr[1];
    arr = arr[0];
    if (idx < 0 && Math.abs(idx) <= arr.length) {
      return arr[idx + arr.length];
    } else if (idx >= 0 && idx < arr.length) {
      return arr[idx];
    }
    return undefined;
  },


  /**
   * Converts an array of key value pairs to a document.
   */
  $arrayToObject: function $arrayToObject(obj, expr) {
    var arr = computeValue(obj, expr);
    assert(isArray(arr), '$arrayToObject expression must resolve to an array');
    return reduce(arr, function (newObj, val) {
      if (isArray(val) && val.length == 2) newObj[val[0]] = val[1];else if (isObject(val) && has(val, 'k') && has(val, 'v')) newObj[val.k] = val.v;else err('$arrayToObject expression is invalid.');
      return newObj;
    }, {});
  },


  /**
   * Concatenates arrays to return the concatenated array.
   *
   * @param  {Object} obj
   * @param  {*} expr
   * @return {*}
   */
  $concatArrays: function $concatArrays(obj, expr) {
    var arr = computeValue(obj, expr, null);
    assert(isArray(arr) && arr.length === 2, '$concatArrays expression must resolve to an array of 2 elements');

    if (arr.some(isNil)) return null;

    return arr[0].concat(arr[1]);
  },


  /**
   * Selects a subset of the array to return an array with only the elements that match the filter condition.
   *
   * @param  {Object} obj  [description]
   * @param  {*} expr [description]
   * @return {*}      [description]
   */
  $filter: function $filter(obj, expr) {
    var input = computeValue(obj, expr.input);
    var asVar = expr['as'];
    var condExpr = expr['cond'];

    assert(isArray(input), "$filter 'input' expression must resolve to an array");

    return input.filter(function (o) {
      // inject variable
      var tempObj = {};
      tempObj['$' + asVar] = o;
      return computeValue(tempObj, condExpr) === true;
    });
  },


  /**
   * Returns a boolean indicating whether a specified value is in an array.
   *
   * @param {Object} obj
   * @param {Array} expr
   */
  $in: function $in(obj, expr) {
    var val = computeValue(obj, expr[0]);
    var arr = computeValue(obj, expr[1]);
    assert(isArray(arr), '$in second argument must be an array');
    return inArray(arr, val);
  },


  /**
   * Searches an array for an occurrence of a specified value and returns the array index of the first occurrence.
   * If the substring is not found, returns -1.
   *
   * @param  {Object} obj
   * @param  {*} expr
   * @return {*}
   */
  $indexOfArray: function $indexOfArray(obj, expr) {
    var args = computeValue(obj, expr);
    if (isNil(args)) return null;

    var arr = args[0];
    if (isNil(arr)) return null;

    assert(isArray(arr), '$indexOfArray expression must resolve to an array.');

    var searchValue = args[1];
    if (isNil(searchValue)) return null;

    var start = args[2] || 0;
    var end = args[3] || arr.length;

    if (end < arr.length) {
      arr = arr.slice(start, end);
    }

    return arr.indexOf(searchValue, start);
  },


  /**
   * Determines if the operand is an array. Returns a boolean.
   *
   * @param  {Object}  obj
   * @param  {*}  expr
   * @return {Boolean}
   */
  $isArray: function $isArray(obj, expr) {
    return isArray(computeValue(obj, expr));
  },


  /**
   * Applies a sub-expression to each element of an array and returns the array of resulting values in order.
   *
   * @param obj
   * @param expr
   * @returns {Array|*}
   */
  $map: function $map(obj, expr) {
    var inputExpr = computeValue(obj, expr.input);
    assert(isArray(inputExpr), '$map \'input\' expression must resolve to an array');

    var asExpr = expr['as'];
    var inExpr = expr['in'];

    // HACK: add the "as" expression as a value on the object to take advantage of "resolve()"
    // which will reduce to that value when invoked. The reference to the as expression will be prefixed with "$$".
    // But since a "$" is stripped of before passing the name to "resolve()" we just need to prepend "$" to the key.
    var tempKey = '$' + asExpr;
    // let's save any value that existed, kinda useless but YOU CAN NEVER BE TOO SURE, CAN YOU :)
    var original = obj[tempKey];
    return map(inputExpr, function (item) {
      obj[tempKey] = item;
      var value = computeValue(obj, inExpr);
      // cleanup and restore
      if (isUndefined(original)) {
        delete obj[tempKey];
      } else {
        obj[tempKey] = original;
      }
      return value;
    });
  },


  /**
   * Converts a document to an array of documents representing key-value pairs.
   */
  $objectToArray: function $objectToArray(obj, expr) {
    var val = computeValue(obj, expr);
    assert(isObject(val), '$objectToArray expression must resolve to an object');
    var arr = [];
    each(val, function (v, k) {
      return arr.push({ k: k, v: v });
    });
    return arr;
  },


  /**
   * Returns an array whose elements are a generated sequence of numbers.
   *
   * @param  {Object} obj
   * @param  {*} expr
   * @return {*}
   */
  $range: function $range(obj, expr) {
    var arr = computeValue(obj, expr);
    var start = arr[0];
    var end = arr[1];
    var step = arr[2] || 1;

    var result = [];

    while (start < end && step > 0 || start > end && step < 0) {
      result.push(start);
      start += step;
    }

    return result;
  },


  /**
   * Applies an expression to each element in an array and combines them into a single value.
   *
   * @param {Object} obj
   * @param {*} expr
   */
  $reduce: function $reduce(obj, expr) {
    var input = computeValue(obj, expr.input);
    var initialValue = computeValue(obj, expr.initialValue);
    var inExpr = expr['in'];

    if (isNil(input)) return null;
    assert(isArray(input), "$reduce 'input' expression must resolve to an array");
    return reduce(input, function (acc, n) {
      return computeValue({ '$value': acc, '$this': n }, inExpr);
    }, initialValue);
  },


  /**
   * Returns an array with the elements in reverse order.
   *
   * @param  {Object} obj
   * @param  {*} expr
   * @return {*}
   */
  $reverseArray: function $reverseArray(obj, expr) {
    var arr = computeValue(obj, expr);

    if (isNil(arr)) return null;
    assert(isArray(arr), '$reverseArray expression must resolve to an array');

    var result = [];
    into(result, arr);
    result.reverse();
    return result;
  },


  /**
   * Counts and returns the total the number of items in an array.
   *
   * @param obj
   * @param expr
   */
  $size: function $size(obj, expr) {
    var value = computeValue(obj, expr);
    return isArray(value) ? value.length : undefined;
  },


  /**
   * Returns a subset of an array.
   *
   * @param  {Object} obj
   * @param  {*} expr
   * @return {*}
   */
  $slice: function $slice(obj, expr) {
    var arr = computeValue(obj, expr);
    return slice(arr[0], arr[1], arr[2]);
  },


  /**
   * Merge two lists together.
   *
   * Transposes an array of input arrays so that the first element of the output array would be an array containing,
   * the first element of the first input array, the first element of the second input array, etc.
   *
   * @param  {Obj} obj
   * @param  {*} expr
   * @return {*}
   */
  $zip: function $zip(obj, expr) {
    var inputs = computeValue(obj, expr.inputs);
    var useLongestLength = expr.useLongestLength || false;

    assert(isArray(inputs), "'inputs' expression must resolve to an array");
    assert(isBoolean(useLongestLength), "'useLongestLength' must be a boolean");

    if (isArray(expr.defaults)) {
      assert(truthy(useLongestLength), "'useLongestLength' must be set to true to use 'defaults'");
    }

    var zipCount = 0;

    for (var i = 0, len = inputs.length; i < len; i++) {
      var arr = inputs[i];

      if (isNil(arr)) return null;

      assert(isArray(arr), "'inputs' expression values must resolve to an array or null");

      zipCount = useLongestLength ? Math.max(zipCount, arr.length) : Math.min(zipCount || arr.length, arr.length);
    }

    var result = [];
    var defaults = expr.defaults || [];

    var _loop = function _loop(_i) {
      var temp = inputs.map(function (val, index) {
        return isNil(val[_i]) ? defaults[index] || null : val[_i];
      });
      result.push(temp);
    };

    for (var _i = 0; _i < zipCount; _i++) {
      _loop(_i);
    }

    return result;
  }
};

var booleanOperators = {
  /**
   * Returns true only when all its expressions evaluate to true. Accepts any number of argument expressions.
   *
   * @param obj
   * @param expr
   * @returns {boolean}
   */
  $and: function $and(obj, expr) {
    var value = computeValue(obj, expr);
    return truthy(value) && value.every(truthy);
  },

  /**
   * Returns true when any of its expressions evaluates to true. Accepts any number of argument expressions.
   *
   * @param obj
   * @param expr
   * @returns {boolean}
   */
  $or: function $or(obj, expr) {
    var value = computeValue(obj, expr);
    return truthy(value) && value.some(truthy);
  },

  /**
   * Returns the boolean value that is the opposite of its argument expression. Accepts a single argument expression.
   *
   * @param obj
   * @param expr
   * @returns {boolean}
   */
  $not: function $not(obj, expr) {
    return !computeValue(obj, expr[0]);
  }
};

var comparisonOperators = {
  /**
   * Compares two values and returns the result of the comparison as an integer.
   *
   * @param obj
   * @param expr
   * @returns {number}
   */
  $cmp: function $cmp(obj, expr) {
    var args = computeValue(obj, expr);
    if (args[0] > args[1]) return 1;
    if (args[0] < args[1]) return -1;
    return 0;
  }
};
// mixin comparison operators
each(['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin'], function (op) {
  comparisonOperators[op] = function (obj, expr) {
    var args = computeValue(obj, expr);
    return simpleOperators[op](args[0], args[1]);
  };
});

/**
 * Conditional operators
 */

var conditionalOperators = {

  /**
   * A ternary operator that evaluates one expression,
   * and depending on the result returns the value of one following expressions.
   *
   * @param obj
   * @param expr
   */
  $cond: function $cond(obj, expr) {
    var ifExpr = void 0,
        thenExpr = void 0,
        elseExpr = void 0;
    if (isArray(expr)) {
      assert(expr.length === 3, 'Invalid arguments for $cond operator');
      ifExpr = expr[0];
      thenExpr = expr[1];
      elseExpr = expr[2];
    } else if (isObject(expr)) {
      ifExpr = expr['if'];
      thenExpr = expr['then'];
      elseExpr = expr['else'];
    }
    var condition = computeValue(obj, ifExpr);
    return condition ? computeValue(obj, thenExpr, null) : computeValue(obj, elseExpr);
  },


  /**
   * An operator that evaluates a series of case expressions. When it finds an expression which
   * evaluates to true, it returns the resulting expression for that case. If none of the cases
   * evaluate to true, it returns the default expression.
   *
   * @param obj
   * @param expr
   */
  $switch: function $switch(obj, expr) {
    assert(expr.branches, 'Invalid arguments for $switch operator');

    var validBranch = expr.branches.find(function (branch) {
      assert(branch['case'] && branch['then'], 'Invalid arguments for $switch operator');
      return computeValue(obj, branch['case']);
    });

    if (validBranch) {
      return computeValue(obj, validBranch.then);
    } else if (!expr.default) {
      err('Invalid arguments for $switch operator');
    } else {
      return computeValue(obj, expr.default);
    }
  },


  /**
   * Evaluates an expression and returns the first expression if it evaluates to a non-null value.
   * Otherwise, $ifNull returns the second expression's value.
   *
   * @param obj
   * @param expr
   * @returns {*}
   */
  $ifNull: function $ifNull(obj, expr) {
    assert(isArray(expr) && expr.length === 2, 'Invalid arguments for $ifNull operator');
    var args = computeValue(obj, expr);
    return args[0] === null || args[0] === undefined ? args[1] : args[0];
  }
};

// used for formatting dates in $dateToString operator
var DATE_SYM_TABLE = {
  '%Y': ['$year', 4],
  '%m': ['$month', 2],
  '%d': ['$dayOfMonth', 2],
  '%H': ['$hour', 2],
  '%M': ['$minute', 2],
  '%S': ['$second', 2],
  '%L': ['$millisecond', 3],
  '%j': ['$dayOfYear', 3],
  '%w': ['$dayOfWeek', 1],
  '%U': ['$week', 2],
  '%%': '%'
};

var dateOperators = {
  /**
   * Returns the day of the year for a date as a number between 1 and 366 (leap year).
   * @param obj
   * @param expr
   */
  $dayOfYear: function $dayOfYear(obj, expr) {
    var d = computeValue(obj, expr);
    if (isDate(d)) {
      var start = new Date(d.getFullYear(), 0, 0);
      var diff = d - start;
      var oneDay = 1000 * 60 * 60 * 24;
      return Math.round(diff / oneDay);
    }
    return undefined;
  },


  /**
   * Returns the day of the month for a date as a number between 1 and 31.
   * @param obj
   * @param expr
   */
  $dayOfMonth: function $dayOfMonth(obj, expr) {
    var d = computeValue(obj, expr);
    return isDate(d) ? d.getDate() : undefined;
  },


  /**
   * Returns the day of the week for a date as a number between 1 (Sunday) and 7 (Saturday).
   * @param obj
   * @param expr
   */
  $dayOfWeek: function $dayOfWeek(obj, expr) {
    var d = computeValue(obj, expr);
    return isDate(d) ? d.getDay() + 1 : undefined;
  },


  /**
   * Returns the year for a date as a number (e.g. 2014).
   * @param obj
   * @param expr
   */
  $year: function $year(obj, expr) {
    var d = computeValue(obj, expr);
    return isDate(d) ? d.getFullYear() : undefined;
  },


  /**
   * Returns the month for a date as a number between 1 (January) and 12 (December).
   * @param obj
   * @param expr
   */
  $month: function $month(obj, expr) {
    var d = computeValue(obj, expr);
    return isDate(d) ? d.getMonth() + 1 : undefined;
  },


  /**
   * Returns the week number for a date as a number between 0
   * (the partial week that precedes the first Sunday of the year) and 53 (leap year).
   * @param obj
   * @param expr
   */
  $week: function $week(obj, expr) {
    // source: http://stackoverflow.com/a/6117889/1370481
    var d = computeValue(obj, expr);

    // Copy date so don't modify original
    d = new Date(+d);
    d.setHours(0, 0, 0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    // Get first day of year
    var yearStart = new Date(d.getFullYear(), 0, 1);
    // Calculate full weeks to nearest Thursday
    return Math.floor(((d - yearStart) / 8.64e7 + 1) / 7);
  },


  /**
   * Returns the hour for a date as a number between 0 and 23.
   * @param obj
   * @param expr
   */
  $hour: function $hour(obj, expr) {
    var d = computeValue(obj, expr);
    return isDate(d) ? d.getUTCHours() : undefined;
  },


  /**
   * Returns the minute for a date as a number between 0 and 59.
   * @param obj
   * @param expr
   */
  $minute: function $minute(obj, expr) {
    var d = computeValue(obj, expr);
    return isDate(d) ? d.getMinutes() : undefined;
  },


  /**
   * Returns the seconds for a date as a number between 0 and 60 (leap seconds).
   * @param obj
   * @param expr
   */
  $second: function $second(obj, expr) {
    var d = computeValue(obj, expr);
    return isDate(d) ? d.getSeconds() : undefined;
  },


  /**
   * Returns the milliseconds of a date as a number between 0 and 999.
   * @param obj
   * @param expr
   */
  $millisecond: function $millisecond(obj, expr) {
    var d = computeValue(obj, expr);
    return isDate(d) ? d.getMilliseconds() : undefined;
  },


  /**
   * Returns the date as a formatted string.
   *
   * %Y  Year (4 digits, zero padded)  0000-9999
   * %m  Month (2 digits, zero padded)  01-12
   * %d  Day of Month (2 digits, zero padded)  01-31
   * %H  Hour (2 digits, zero padded, 24-hour clock)  00-23
   * %M  Minute (2 digits, zero padded)  00-59
   * %S  Second (2 digits, zero padded)  00-60
   * %L  Millisecond (3 digits, zero padded)  000-999
   * %j  Day of year (3 digits, zero padded)  001-366
   * %w  Day of week (1-Sunday, 7-Saturday)  1-7
   * %U  Week of year (2 digits, zero padded)  00-53
   * %%  Percent Character as a Literal  %
   *
   * @param obj current object
   * @param expr operator expression
   */
  $dateToString: function $dateToString(obj, expr) {
    var fmt = expr['format'];
    var date = computeValue(obj, expr['date']);
    var matches = fmt.match(/(%%|%Y|%m|%d|%H|%M|%S|%L|%j|%w|%U)/g);

    for (var i = 0, len = matches.length; i < len; i++) {
      var hdlr = DATE_SYM_TABLE[matches[i]];
      var value = hdlr;

      if (isArray(hdlr)) {
        // reuse date operators
        var fn = this[hdlr[0]];
        var pad = hdlr[1];
        value = padDigits(fn.call(this, obj, date), pad);
      }
      // replace the match with resolved value
      fmt = fmt.replace(matches[i], value);
    }

    return fmt;
  }
};

function padDigits(number, digits) {
  return new Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
}

var literalOperators = {
  /**
   * Return a value without parsing.
   * @param obj
   * @param expr
   */
  $literal: function $literal(obj, expr) {
    return expr;
  }
};

var setOperators = {
  /**
   * Returns true if two sets have the same elements.
   * @param obj
   * @param expr
   */
  $setEquals: function $setEquals(obj, expr) {
    var args = computeValue(obj, expr);
    var xs = unique(args[0]);
    var ys = unique(args[1]);
    return xs.length === ys.length && xs.length === intersection(xs, ys).length;
  },


  /**
   * Returns the common elements of the input sets.
   * @param obj
   * @param expr
   */
  $setIntersection: function $setIntersection(obj, expr) {
    var args = computeValue(obj, expr);
    return intersection(args[0], args[1]);
  },


  /**
   * Returns elements of a set that do not appear in a second set.
   * @param obj
   * @param expr
   */
  $setDifference: function $setDifference(obj, expr) {
    var args = computeValue(obj, expr);
    return args[0].filter(notInArray.bind(null, args[1]));
  },


  /**
   * Returns a set that holds all elements of the input sets.
   * @param obj
   * @param expr
   */
  $setUnion: function $setUnion(obj, expr) {
    var args = computeValue(obj, expr);
    return union(args[0], args[1]);
  },


  /**
   * Returns true if all elements of a set appear in a second set.
   * @param obj
   * @param expr
   */
  $setIsSubset: function $setIsSubset(obj, expr) {
    var args = computeValue(obj, expr);
    return intersection(args[0], args[1]).length === args[0].length;
  },


  /**
   * Returns true if any elements of a set evaluate to true, and false otherwise.
   * @param obj
   * @param expr
   */
  $anyElementTrue: function $anyElementTrue(obj, expr) {
    // mongodb nests the array expression in another
    var args = computeValue(obj, expr)[0];
    return args.some(truthy);
  },


  /**
   * Returns true if all elements of a set evaluate to true, and false otherwise.
   * @param obj
   * @param expr
   */
  $allElementsTrue: function $allElementsTrue(obj, expr) {
    // mongodb nests the array expression in another
    var args = computeValue(obj, expr)[0];
    return args.every(truthy);
  }
};

var stringOperators = {

  /**
   * Concatenates two strings.
   *
   * @param obj
   * @param expr
   * @returns {string|*}
   */
  $concat: function $concat(obj, expr) {
    var args = computeValue(obj, expr);
    // does not allow concatenation with nulls
    if ([null, undefined].some(inArray.bind(null, args))) {
      return null;
    }
    return args.join('');
  },


  /**
   * Searches a string for an occurence of a substring and returns the UTF-8 code point index of the first occurence.
   * If the substring is not found, returns -1.
   *
   * @param  {Object} obj
   * @param  {*} expr
   * @return {*}
   */
  $indexOfBytes: function $indexOfBytes(obj, expr) {
    var arr = computeValue(obj, expr);

    if (isNil(arr[0])) return null;

    assert(isString(arr[0]), '$indexOfBytes first operand must resolve to a string');
    assert(isString(arr[1]), '$indexOfBytes second operand must resolve to a string');

    var str = arr[0];
    var searchStr = arr[1];
    var start = arr[2];
    var end = arr[3];

    assert(isNil(start) || isNumber(start) && start >= 0 && Math.round(start) === start, '$indexOfBytes third operand must resolve to a non-negative integer');
    start = start || 0;

    assert(isNil(end) || isNumber(end) && end >= 0 && Math.round(end) === end, '$indexOfBytes fourth operand must resolve to a non-negative integer');
    end = end || str.length;

    if (start > end) return -1;

    var index = str.substring(start, end).indexOf(searchStr);
    return index > -1 ? index + start : index;
  },


  /**
   * Splits a string into substrings based on a delimiter.
   * If the delimiter is not found within the string, returns an array containing the original string.
   *
   * @param  {Object} obj
   * @param  {Array} expr
   * @return {Array} Returns an array of substrings.
   */
  $split: function $split(obj, expr) {
    var args = computeValue(obj, expr);
    assert(isString(args[0]), '$split requires an expression that evaluates to a string as a first argument, found: ' + getType(args[0]));
    assert(isString(args[1]), '$split requires an expression that evaluates to a string as a second argument, found: ' + getType(args[1]));
    return args[0].split(args[1]);
  },


  /**
   * Compares two strings and returns an integer that reflects the comparison.
   *
   * @param obj
   * @param expr
   * @returns {number}
   */
  $strcasecmp: function $strcasecmp(obj, expr) {
    var args = computeValue(obj, expr);
    args[0] = isEmpty(args[0]) ? '' : args[0].toUpperCase();
    args[1] = isEmpty(args[1]) ? '' : args[1].toUpperCase();
    if (args[0] > args[1]) {
      return 1;
    }
    return args[0] < args[1] ? -1 : 0;
  },


  /**
   * Returns a substring of a string, starting at a specified index position and including the specified number of characters.
   * The index is zero-based.
   *
   * @param obj
   * @param expr
   * @returns {string}
   */
  $substr: function $substr(obj, expr) {
    var args = computeValue(obj, expr);
    if (isString(args[0])) {
      if (args[1] < 0) {
        return '';
      } else if (args[2] < 0) {
        return args[0].substr(args[1]);
      } else {
        return args[0].substr(args[1], args[2]);
      }
    }
    return '';
  },


  /**
   * Converts a string to lowercase.
   *
   * @param obj
   * @param expr
   * @returns {string}
   */
  $toLower: function $toLower(obj, expr) {
    var value = computeValue(obj, expr);
    return isEmpty(value) ? '' : value.toLowerCase();
  },


  /**
   * Converts a string to uppercase.
   *
   * @param obj
   * @param expr
   * @returns {string}
   */
  $toUpper: function $toUpper(obj, expr) {
    var value = computeValue(obj, expr);
    return isEmpty(value) ? '' : value.toUpperCase();
  }
};

/**
 * Aggregation framework variable operators
 */

var variableOperators = {
  /**
   * Defines variables for use within the scope of a sub-expression and returns the result of the sub-expression.
   *
   * @param obj
   * @param expr
   * @returns {*}
   */
  $let: function $let(obj, expr) {
    var varsExpr = expr['vars'];
    var inExpr = expr['in'];

    // resolve vars
    var originals = {};
    var varsKeys = keys(varsExpr);
    each(varsKeys, function (key) {
      var val = computeValue(obj, varsExpr[key]);
      var tempKey = '$' + key;
      // set value on object using same technique as in "$map"
      originals[tempKey] = obj[tempKey];
      obj[tempKey] = val;
    });

    var value = computeValue(obj, inExpr);

    // cleanup and restore
    each(varsKeys, function (key) {
      var tempKey = '$' + key;
      if (isUndefined(originals[tempKey])) {
        delete obj[tempKey];
      } else {
        obj[tempKey] = originals[tempKey];
      }
    });

    return value;
  }
};

// combine aggregate operators
var aggregateOperators = Object.assign({}, arithmeticOperators, arrayOperators, booleanOperators, comparisonOperators, conditionalOperators, dateOperators, literalOperators, setOperators, stringOperators, variableOperators);

// operator definitions
var OPERATORS = {
  'aggregate': aggregateOperators,
  'group': groupOperators,
  'pipeline': pipelineOperators,
  'projection': projectionOperators,
  'query': queryOperators

  /**
   * Returns the operators defined for the given operator classes
   */
};function ops() {
  return reduce(arguments, function (acc, cls) {
    return into(acc, keys(OPERATORS[cls]));
  }, []);
}

/**
 * Add new operators
 *
 * @param opClass the operator class to extend
 * @param fn a function returning an object of new operators
 */
function addOperators(opClass, fn) {

  var newOperators = fn(_internal());

  // ensure correct type specified
  assert(has(OPERATORS, opClass), 'Invalid operator class ' + opClass);

  var operators = OPERATORS[opClass];

  // check for existing operators
  each(newOperators, function (fn, op) {
    assert(/^\$\w+$/.test(op), 'Invalid operator name ' + op);
    assert(!has(operators, op), op + ' already exists for \'' + opClass + '\' operators');
  });

  var wrapped = {};

  switch (opClass) {
    case OP_QUERY:
      each(newOperators, function (fn, op) {
        wrapped[op] = function (f, ctx) {
          return function (selector, value) {
            return {
              test: function test(obj) {
                // value of field must be fully resolved.
                var lhs = resolve(obj, selector);
                var result = f.call(ctx, selector, lhs, value);
                if (isBoolean(result)) {
                  return result;
                } else if (result instanceof Query) {
                  return result.test(obj);
                } else {
                  err("Invalid return type for '" + op + "'. Must return a Boolean or Query");
                }
              }
            };
          };
        }(fn, newOperators);
      });
      break;
    case OP_PROJECTION:
      each(newOperators, function (fn, op) {
        wrapped[op] = function (f, ctx) {
          return function (obj, expr, selector) {
            var lhs = resolve(obj, selector);
            return f.call(ctx, selector, lhs, expr);
          };
        }(fn, newOperators);
      });
      break;
    default:
      each(newOperators, function (fn, op) {
        wrapped[op] = function (f, ctx) {
          return function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return f.apply(ctx, args);
          };
        }(fn, newOperators);
      });
  }

  // toss the operator salad :)
  Object.assign(OPERATORS[opClass], wrapped);
}

/**
 * Internal functions
 */

// Settings used by Mingo internally
var settings = {
  key: '_id'

  /**
   * Setup default settings for Mingo
   * @param options
   */
};function setup(options) {
  Object.assign(settings, options || {});
}

/**
 * Implementation of system variables
 * @type {Object}
 */
var systemVariables = {
  '$$ROOT': function $$ROOT(obj, expr, opt) {
    return opt.root;
  },
  '$$CURRENT': function $$CURRENT(obj, expr, opt) {
    return obj;
  }
};

/**
 * Implementation of $redact variables
 *
 * Each function accepts 3 arguments (obj, expr, opt)
 *
 * @type {Object}
 */
var redactVariables = {
  '$$KEEP': function $$KEEP(obj) {
    return obj;
  },
  '$$PRUNE': function $$PRUNE() {
    return undefined;
  },
  '$$DESCEND': function $$DESCEND(obj, expr, opt) {
    // traverse nested documents iff there is a $cond
    if (!has(expr, '$cond')) return obj;

    var result = void 0;

    each(obj, function (current, key) {
      if (isObjectLike(current)) {
        if (isArray(current)) {
          result = [];
          each(current, function (elem) {
            if (isObject(elem)) {
              elem = redactObj(elem, expr, opt);
            }
            if (!isNil(elem)) result.push(elem);
          });
        } else {
          result = redactObj(current, expr, opt);
        }

        if (isNil(result)) {
          delete obj[key]; // pruned result
        } else {
          obj[key] = result;
        }
      }
    });
    return obj;
  }
};

// system variables
var SYS_VARS = keys(systemVariables);
var REDACT_VARS = keys(redactVariables);

/**
 * Returns the key used as the collection's objects ids
 */
function idKey() {
  return settings.key;
}

/**
 * Retrieve the value of a given key on an object
 * @param obj
 * @param field
 * @returns {*}
 * @private
 */
function getValue(obj, field) {
  return obj[field];
}

/**
 * Resolve the value of the field (dot separated) on the given object
 * @param obj {Object} the object context
 * @param selector {String} dot separated path to field
 * @param deepFlag {Boolean} flag whether to iterate deeply (default: false)
 * @returns {*}
 */
function resolve(obj, selector) {
  var deepFlag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var names = selector.split('.');
  var value = obj;

  var _loop = function _loop(i) {
    var isText = names[i].match(/^\d+$/) === null;

    if (isText && isArray(value)) {
      // On the first iteration, we check if we received a stop flag.
      // If so, we stop to prevent iterating over a nested array value
      // on consecutive object keys in the selector.
      if (deepFlag === true && i === 0) {
        return {
          v: value
        };
      }

      value = value.map(function (item) {
        return resolve(item, names[i], true);
      });

      // we mark this value as being multi-valued
      addMeta(value, { isMulti: true });

      // we unwrap for arrays of unit length
      // this avoids excess wrapping when resolving deeply nested arrays
      if (value.length === 1) {
        value = value[0];
      }
    } else {
      value = getValue(value, names[i]);
      deepFlag = false; // reset stop flag when we do a direct lookup
    }

    if (isNil(value)) return 'break';
  };

  _loop2: for (var i = 0; i < names.length; i++) {
    var _ret = _loop(i);

    switch (_ret) {
      case 'break':
        break _loop2;

      default:
        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }
  }

  return value;
}

/**
 * Returns the full object to the resolved value given by the selector.
 * This function excludes empty values as they aren't practically useful.
 *
 * @param obj {Object} the object context
 * @param selector {String} dot separated path to field
 */
function resolveObj(obj, selector) {
  if (isNil(obj)) return;

  var names = selector.split('.');
  var key = names[0];
  // get the next part of the selector
  var next = names.length === 1 || names.slice(1).join('.');
  var isIndex = key.match(/^\d+$/) !== null;
  var hasNext = names.length > 1;
  var result = void 0;
  var value = void 0;

  try {
    if (isArray(obj)) {
      if (isIndex) {
        result = getValue(obj, key);
        if (hasNext) {
          result = resolveObj(result, next);
        }
        assert(!isUndefined(result));
        result = [result];
      } else {
        result = [];
        each(obj, function (item) {
          value = resolveObj(item, selector);
          if (!isNil(value)) result.push(value);
        });
        assert(result.length > 0);
      }
    } else {
      value = getValue(obj, key);
      if (hasNext) {
        value = resolveObj(value, next);
      }
      assert(!isUndefined(value));
      result = {};
      result[key] = value;
    }
  } catch (e) {
    result = undefined;
  }

  return result;
}

/**
 * Walk the object graph and execute the given transform function
 * @param  {Object|Array} obj   The object to traverse
 * @param  {String} selector    The selector
 * @param  {Function} fn Function to execute for value at the end the traversal
 * @param  {Boolean} force Force generating missing parts of object graph
 * @return {*}
 */
function traverse(obj, selector, fn) {
  var force = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  var names = selector.split('.');
  var key = names[0];
  var next = names.length === 1 || names.slice(1).join('.');

  if (names.length === 1) {
    fn(obj, key);
  } else {
    // nested objects
    if (isArray(obj) && !/^\d+$/.test(key)) {
      each(obj, function (item) {
        traverse(item, selector, fn, force);
      });
    } else {
      // force the rest of the graph while traversing
      if (force === true) {
        var exists = has(obj, key);
        if (!exists || isNil(obj[key])) {
          obj[key] = {};
        }
      }
      traverse(obj[key], next, fn, force);
    }
  }
}

/**
 * Set the value of the given object field
 *
 * @param obj {Object|Array} the object context
 * @param selector {String} path to field
 * @param value {*} the value to set
 */
function setValue(obj, selector, value) {
  traverse(obj, selector, function (item, key) {
    item[key] = value;
  }, true);
}

function removeValue(obj, selector) {
  traverse(obj, selector, function (item, key) {
    if (isArray(item) && /^\d+$/.test(key)) {
      item.splice(parseInt(key), 1);
    } else if (isObject(item)) {
      delete item[key];
    }
  });
}

/**
 * Simplify expression for easy evaluation with query operators map
 * @param expr
 * @returns {*}
 */
function normalize(expr) {
  // normalized primitives
  if (inArray(JS_SIMPLE_TYPES, jsType(expr))) {
    return isRegExp(expr) ? { '$regex': expr } : { '$eq': expr };
  }

  // normalize object expression
  if (isObjectLike(expr)) {
    var exprKeys = keys(expr);
    var noQuery = intersection(ops(OP_QUERY), exprKeys).length === 0;

    // no valid query operator found, so we do simple comparison
    if (noQuery) {
      return { '$eq': expr };
    }

    // ensure valid regex
    if (inArray(exprKeys, '$regex')) {
      var regex = expr['$regex'];
      var options = expr['$options'] || '';
      var modifiers = '';
      if (isString(regex)) {
        modifiers += regex.ignoreCase || options.indexOf('i') >= 0 ? 'i' : '';
        modifiers += regex.multiline || options.indexOf('m') >= 0 ? 'm' : '';
        modifiers += regex.global || options.indexOf('g') >= 0 ? 'g' : '';
        regex = new RegExp(regex, modifiers);
      }
      expr['$regex'] = regex;
      delete expr['$options'];
    }
  }

  return expr;
}

/**
 * Computes the actual value of the expression using the given object as context
 *
 * @param obj the current object from the collection
 * @param expr the expression for the given field
 * @param field the field name (may also be an aggregate operator)
 * @param opt {Object} extra options
 * @returns {*}
 */
function computeValue(obj, expr) {
  var field = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var opt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  opt.root = opt.root || obj;

  // if the field of the object is a valid operator
  if (inArray(ops(OP_AGGREGATE), field)) {
    return aggregateOperators[field](obj, expr, opt);
  }

  // we also handle $group accumulator operators
  if (inArray(ops(OP_GROUP), field)) {
    // we first fully resolve the expression
    obj = computeValue(obj, expr, null, opt);
    assert(isArray(obj), field + ' expression must resolve to an array');
    // we pass a null expression because all values have been resolved
    return groupOperators[field](obj, null, opt);
  }

  // if expr is a variable for an object field
  // field not used in this case
  if (isString(expr) && expr.length > 0 && expr[0] === '$') {
    // we return system variables as literals
    if (inArray(SYS_VARS, expr)) {
      return systemVariables[expr](obj, null, opt);
    } else if (inArray(REDACT_VARS, expr)) {
      return expr;
    }

    // handle selectors with explicit prefix
    var sysVar = SYS_VARS.filter(function (v) {
      return expr.indexOf(v + '.') === 0;
    });

    if (sysVar.length === 1) {
      sysVar = sysVar[0];
      if (sysVar === '$$ROOT') {
        obj = opt.root;
      }
      expr = expr.substr(sysVar.length); // '.' prefix will be sliced off below
    }

    return resolve(obj, expr.slice(1));
  }

  // check and return value if already in a resolved state
  switch (jsType(expr)) {
    case T_ARRAY:
      return expr.map(function (item) {
        return computeValue(obj, item);
      });
    case T_OBJECT:
      var result = {};
      each(expr, function (val, key) {
        result[key] = computeValue(obj, val, key, opt);
        // must run ONLY one aggregate operator per expression
        // if so, return result of the computed value
        if (inArray(ops(OP_AGGREGATE, OP_GROUP), key)) {
          // there should be only one operator
          assert(keys(expr).length === 1, "Invalid aggregation expression '" + JSON.stringify(expr) + "'");
          result = result[key];
          return false; // break
        }
      });
      return result;
    default:
      return expr;
  }
}

/**
 * Returns a slice of the array
 *
 * @param  {Array} xs
 * @param  {Number} skip
 * @param  {Number} limit
 * @return {Array}
 */
function slice(xs, skip) {
  var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  // MongoDB $slice works a bit differently from Array.slice
  // Uses single argument for 'limit' and array argument [skip, limit]
  if (isNil(limit)) {
    if (skip < 0) {
      skip = Math.max(0, xs.length + skip);
      limit = xs.length - skip + 1;
    } else {
      limit = skip;
      skip = 0;
    }
  } else {
    if (skip < 0) {
      skip = Math.max(0, xs.length + skip);
    }
    assert(limit > 0, 'Invalid argument value for $slice operator. Limit must be a positive number');
    limit += skip;
  }
  return Array.prototype.slice.apply(xs, [skip, limit]);
}

/**
 * Compute the standard deviation of the data set
 * @param  {Object} ctx An object of the context. Includes "data:Array" and "sampled:Boolean".
 * @return {Number}
 */
function stddev(ctx) {
  var sum = reduce(ctx.data, function (acc, n) {
    return acc + n;
  }, 0);
  var N = ctx.data.length || 1;
  var correction = ctx.sampled === true ? 1 : 0;
  var avg = sum / (N - correction);
  return Math.sqrt(reduce(ctx.data, function (acc, n) {
    return acc + Math.pow(n - avg, 2);
  }, 0) / N);
}

/**
 * Redact an object
 * @param  {Object} obj The object to redact
 * @param  {*} expr The redact expression
 * @param  {*} opt  Options for value
 * @return {*} Returns the redacted value
 */
function redactObj(obj, expr) {
  var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  opt.root = opt.root || obj;

  var result = computeValue(obj, expr, null, opt);
  return inArray(REDACT_VARS, result) ? redactVariables[result](obj, expr, opt) : result;
}

/**
 * Exported to the users to allow writing custom operators
 */
function _internal() {
  return {
    computeValue: computeValue,
    idKey: idKey,
    ops: ops,
    resolve: resolve,
    assert: assert,
    clone: clone,
    each: each,
    err: err,
    getType: getType,
    has: has,
    isArray: isArray,
    isBoolean: isBoolean,
    isDate: isDate,
    isEmpty: isEmpty,
    isEqual: isEqual,
    isFunction: isFunction,
    isNil: isNil,
    isNull: isNull,
    isNumber: isNumber,
    isObject: isObject,
    isRegExp: isRegExp,
    isString: isString,
    isUndefined: isUndefined,
    keys: keys,
    map: map
  };
}

/**
 * Mixin for Collection types that provide a method `toJSON() -> Array[Object]`
 */
var CollectionMixin = {

  /**
   * Runs a query and returns a cursor to the result
   * @param criteria
   * @param projection
   * @returns {Cursor}
   */
  query: function query(criteria, projection) {
    return new Query(criteria).find(this.toJSON(), projection);
  },


  /**
   * Runs the given aggregation operators on this collection
   * @params pipeline
   * @returns {Array}
   */
  aggregate: function aggregate$$1(pipeline) {
    return new Aggregator(pipeline).run(this.toJSON());
  }
};

var VERSION = '1.3.3';

// mingo!
var index = {
  _internal: _internal,
  Aggregator: Aggregator,
  CollectionMixin: CollectionMixin,
  Cursor: Cursor,
  OP_AGGREGATE: OP_AGGREGATE,
  OP_GROUP: OP_GROUP,
  OP_PIPELINE: OP_PIPELINE,
  OP_PROJECTION: OP_PROJECTION,
  OP_QUERY: OP_QUERY,
  Query: Query,
  VERSION: VERSION,
  addOperators: addOperators,
  aggregate: aggregate,
  find: find,
  remove: remove,
  setup: setup
};

return index;

})));
