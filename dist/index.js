'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ecc = require('@bitcoinerlab/secp256k1');
var CryptoJS = require('crypto-js');
var ecpair = require('ecpair');
var bitcoinjsLib = require('bitcoinjs-lib');
var ethers = require('ethers');
var BIP32Factory = require('bip32');
var Web3 = require('web3');
var ethereumjsWallet = require('ethereumjs-wallet');
var jsSha3 = require('js-sha3');
var wif = require('wif');
var axios = require('axios');
var satsConnect = require('sats-connect');
var varuint = require('varuint-bitcoin');
var maxBy = require('lodash/maxBy');
var bip39 = require('bip39');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var ecc__namespace = /*#__PURE__*/_interopNamespace(ecc);
var CryptoJS__namespace = /*#__PURE__*/_interopNamespace(CryptoJS);
var BIP32Factory__default = /*#__PURE__*/_interopDefaultLegacy(BIP32Factory);
var Web3__default = /*#__PURE__*/_interopDefaultLegacy(Web3);
var wif__default = /*#__PURE__*/_interopDefaultLegacy(wif);
var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var varuint__default = /*#__PURE__*/_interopDefaultLegacy(varuint);
var maxBy__default = /*#__PURE__*/_interopDefaultLegacy(maxBy);
var bip39__namespace = /*#__PURE__*/_interopNamespace(bip39);

/*
 *      bignumber.js v9.1.1
 *      A JavaScript library for arbitrary-precision arithmetic.
 *      https://github.com/MikeMcl/bignumber.js
 *      Copyright (c) 2022 Michael Mclaughlin <M8ch88l@gmail.com>
 *      MIT Licensed.
 *
 *      BigNumber.prototype methods     |  BigNumber methods
 *                                      |
 *      absoluteValue            abs    |  clone
 *      comparedTo                      |  config               set
 *      decimalPlaces            dp     |      DECIMAL_PLACES
 *      dividedBy                div    |      ROUNDING_MODE
 *      dividedToIntegerBy       idiv   |      EXPONENTIAL_AT
 *      exponentiatedBy          pow    |      RANGE
 *      integerValue                    |      CRYPTO
 *      isEqualTo                eq     |      MODULO_MODE
 *      isFinite                        |      POW_PRECISION
 *      isGreaterThan            gt     |      FORMAT
 *      isGreaterThanOrEqualTo   gte    |      ALPHABET
 *      isInteger                       |  isBigNumber
 *      isLessThan               lt     |  maximum              max
 *      isLessThanOrEqualTo      lte    |  minimum              min
 *      isNaN                           |  random
 *      isNegative                      |  sum
 *      isPositive                      |
 *      isZero                          |
 *      minus                           |
 *      modulo                   mod    |
 *      multipliedBy             times  |
 *      negated                         |
 *      plus                            |
 *      precision                sd     |
 *      shiftedBy                       |
 *      squareRoot               sqrt   |
 *      toExponential                   |
 *      toFixed                         |
 *      toFormat                        |
 *      toFraction                      |
 *      toJSON                          |
 *      toNumber                        |
 *      toPrecision                     |
 *      toString                        |
 *      valueOf                         |
 *
 */


var
  isNumeric = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,
  mathceil = Math.ceil,
  mathfloor = Math.floor,

  bignumberError = '[BigNumber Error] ',
  tooManyDigits = bignumberError + 'Number primitive has more than 15 significant digits: ',

  BASE = 1e14,
  LOG_BASE = 14,
  MAX_SAFE_INTEGER = 0x1fffffffffffff,         // 2^53 - 1
  // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
  POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
  SQRT_BASE = 1e7,

  // EDITABLE
  // The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
  // the arguments to toExponential, toFixed, toFormat, and toPrecision.
  MAX = 1E9;                                   // 0 to MAX_INT32


/*
 * Create and return a BigNumber constructor.
 */
function clone(configObject) {
  var div, convertBase, parseNumeric,
    P = BigNumber.prototype = { constructor: BigNumber, toString: null, valueOf: null },
    ONE = new BigNumber(1),


    //----------------------------- EDITABLE CONFIG DEFAULTS -------------------------------


    // The default values below must be integers within the inclusive ranges stated.
    // The values can also be changed at run-time using BigNumber.set.

    // The maximum number of decimal places for operations involving division.
    DECIMAL_PLACES = 20,                     // 0 to MAX

    // The rounding mode used when rounding to the above decimal places, and when using
    // toExponential, toFixed, toFormat and toPrecision, and round (default value).
    // UP         0 Away from zero.
    // DOWN       1 Towards zero.
    // CEIL       2 Towards +Infinity.
    // FLOOR      3 Towards -Infinity.
    // HALF_UP    4 Towards nearest neighbour. If equidistant, up.
    // HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
    // HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
    // HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
    // HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
    ROUNDING_MODE = 4,                       // 0 to 8

    // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]

    // The exponent value at and beneath which toString returns exponential notation.
    // Number type: -7
    TO_EXP_NEG = -7,                         // 0 to -MAX

    // The exponent value at and above which toString returns exponential notation.
    // Number type: 21
    TO_EXP_POS = 21,                         // 0 to MAX

    // RANGE : [MIN_EXP, MAX_EXP]

    // The minimum exponent value, beneath which underflow to zero occurs.
    // Number type: -324  (5e-324)
    MIN_EXP = -1e7,                          // -1 to -MAX

    // The maximum exponent value, above which overflow to Infinity occurs.
    // Number type:  308  (1.7976931348623157e+308)
    // For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
    MAX_EXP = 1e7,                           // 1 to MAX

    // Whether to use cryptographically-secure random number generation, if available.
    CRYPTO = false,                          // true or false

    // The modulo mode used when calculating the modulus: a mod n.
    // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
    // The remainder (r) is calculated as: r = a - n * q.
    //
    // UP        0 The remainder is positive if the dividend is negative, else is negative.
    // DOWN      1 The remainder has the same sign as the dividend.
    //             This modulo mode is commonly known as 'truncated division' and is
    //             equivalent to (a % n) in JavaScript.
    // FLOOR     3 The remainder has the same sign as the divisor (Python %).
    // HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
    // EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
    //             The remainder is always positive.
    //
    // The truncated division, floored division, Euclidian division and IEEE 754 remainder
    // modes are commonly used for the modulus operation.
    // Although the other rounding modes can also be used, they may not give useful results.
    MODULO_MODE = 1,                         // 0 to 9

    // The maximum number of significant digits of the result of the exponentiatedBy operation.
    // If POW_PRECISION is 0, there will be unlimited significant digits.
    POW_PRECISION = 0,                       // 0 to MAX

    // The format specification used by the BigNumber.prototype.toFormat method.
    FORMAT = {
      prefix: '',
      groupSize: 3,
      secondaryGroupSize: 0,
      groupSeparator: ',',
      decimalSeparator: '.',
      fractionGroupSize: 0,
      fractionGroupSeparator: '\xA0',        // non-breaking space
      suffix: ''
    },

    // The alphabet used for base conversion. It must be at least 2 characters long, with no '+',
    // '-', '.', whitespace, or repeated character.
    // '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
    ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz',
    alphabetHasNormalDecimalDigits = true;


  //------------------------------------------------------------------------------------------


  // CONSTRUCTOR


  /*
   * The BigNumber constructor and exported function.
   * Create and return a new instance of a BigNumber object.
   *
   * v {number|string|BigNumber} A numeric value.
   * [b] {number} The base of v. Integer, 2 to ALPHABET.length inclusive.
   */
  function BigNumber(v, b) {
    var alphabet, c, caseChanged, e, i, isNum, len, str,
      x = this;

    // Enable constructor call without `new`.
    if (!(x instanceof BigNumber)) return new BigNumber(v, b);

    if (b == null) {

      if (v && v._isBigNumber === true) {
        x.s = v.s;

        if (!v.c || v.e > MAX_EXP) {
          x.c = x.e = null;
        } else if (v.e < MIN_EXP) {
          x.c = [x.e = 0];
        } else {
          x.e = v.e;
          x.c = v.c.slice();
        }

        return;
      }

      if ((isNum = typeof v == 'number') && v * 0 == 0) {

        // Use `1 / n` to handle minus zero also.
        x.s = 1 / v < 0 ? (v = -v, -1) : 1;

        // Fast path for integers, where n < 2147483648 (2**31).
        if (v === ~~v) {
          for (e = 0, i = v; i >= 10; i /= 10, e++);

          if (e > MAX_EXP) {
            x.c = x.e = null;
          } else {
            x.e = e;
            x.c = [v];
          }

          return;
        }

        str = String(v);
      } else {

        if (!isNumeric.test(str = String(v))) return parseNumeric(x, str, isNum);

        x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
      }

      // Decimal point?
      if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

      // Exponential form?
      if ((i = str.search(/e/i)) > 0) {

        // Determine exponent.
        if (e < 0) e = i;
        e += +str.slice(i + 1);
        str = str.substring(0, i);
      } else if (e < 0) {

        // Integer.
        e = str.length;
      }

    } else {

      // '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
      intCheck(b, 2, ALPHABET.length, 'Base');

      // Allow exponential notation to be used with base 10 argument, while
      // also rounding to DECIMAL_PLACES as with other bases.
      if (b == 10 && alphabetHasNormalDecimalDigits) {
        x = new BigNumber(v);
        return round(x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE);
      }

      str = String(v);

      if (isNum = typeof v == 'number') {

        // Avoid potential interpretation of Infinity and NaN as base 44+ values.
        if (v * 0 != 0) return parseNumeric(x, str, isNum, b);

        x.s = 1 / v < 0 ? (str = str.slice(1), -1) : 1;

        // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
        if (BigNumber.DEBUG && str.replace(/^0\.0*|\./, '').length > 15) {
          throw Error
           (tooManyDigits + v);
        }
      } else {
        x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
      }

      alphabet = ALPHABET.slice(0, b);
      e = i = 0;

      // Check that str is a valid base b number.
      // Don't use RegExp, so alphabet can contain special characters.
      for (len = str.length; i < len; i++) {
        if (alphabet.indexOf(c = str.charAt(i)) < 0) {
          if (c == '.') {

            // If '.' is not the first character and it has not be found before.
            if (i > e) {
              e = len;
              continue;
            }
          } else if (!caseChanged) {

            // Allow e.g. hexadecimal 'FF' as well as 'ff'.
            if (str == str.toUpperCase() && (str = str.toLowerCase()) ||
                str == str.toLowerCase() && (str = str.toUpperCase())) {
              caseChanged = true;
              i = -1;
              e = 0;
              continue;
            }
          }

          return parseNumeric(x, String(v), isNum, b);
        }
      }

      // Prevent later check for length on converted number.
      isNum = false;
      str = convertBase(str, b, 10, x.s);

      // Decimal point?
      if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');
      else e = str.length;
    }

    // Determine leading zeros.
    for (i = 0; str.charCodeAt(i) === 48; i++);

    // Determine trailing zeros.
    for (len = str.length; str.charCodeAt(--len) === 48;);

    if (str = str.slice(i, ++len)) {
      len -= i;

      // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
      if (isNum && BigNumber.DEBUG &&
        len > 15 && (v > MAX_SAFE_INTEGER || v !== mathfloor(v))) {
          throw Error
           (tooManyDigits + (x.s * v));
      }

       // Overflow?
      if ((e = e - i - 1) > MAX_EXP) {

        // Infinity.
        x.c = x.e = null;

      // Underflow?
      } else if (e < MIN_EXP) {

        // Zero.
        x.c = [x.e = 0];
      } else {
        x.e = e;
        x.c = [];

        // Transform base

        // e is the base 10 exponent.
        // i is where to slice str to get the first element of the coefficient array.
        i = (e + 1) % LOG_BASE;
        if (e < 0) i += LOG_BASE;  // i < 1

        if (i < len) {
          if (i) x.c.push(+str.slice(0, i));

          for (len -= LOG_BASE; i < len;) {
            x.c.push(+str.slice(i, i += LOG_BASE));
          }

          i = LOG_BASE - (str = str.slice(i)).length;
        } else {
          i -= len;
        }

        for (; i--; str += '0');
        x.c.push(+str);
      }
    } else {

      // Zero.
      x.c = [x.e = 0];
    }
  }


  // CONSTRUCTOR PROPERTIES


  BigNumber.clone = clone;

  BigNumber.ROUND_UP = 0;
  BigNumber.ROUND_DOWN = 1;
  BigNumber.ROUND_CEIL = 2;
  BigNumber.ROUND_FLOOR = 3;
  BigNumber.ROUND_HALF_UP = 4;
  BigNumber.ROUND_HALF_DOWN = 5;
  BigNumber.ROUND_HALF_EVEN = 6;
  BigNumber.ROUND_HALF_CEIL = 7;
  BigNumber.ROUND_HALF_FLOOR = 8;
  BigNumber.EUCLID = 9;


  /*
   * Configure infrequently-changing library-wide settings.
   *
   * Accept an object with the following optional properties (if the value of a property is
   * a number, it must be an integer within the inclusive range stated):
   *
   *   DECIMAL_PLACES   {number}           0 to MAX
   *   ROUNDING_MODE    {number}           0 to 8
   *   EXPONENTIAL_AT   {number|number[]}  -MAX to MAX  or  [-MAX to 0, 0 to MAX]
   *   RANGE            {number|number[]}  -MAX to MAX (not zero)  or  [-MAX to -1, 1 to MAX]
   *   CRYPTO           {boolean}          true or false
   *   MODULO_MODE      {number}           0 to 9
   *   POW_PRECISION       {number}           0 to MAX
   *   ALPHABET         {string}           A string of two or more unique characters which does
   *                                       not contain '.'.
   *   FORMAT           {object}           An object with some of the following properties:
   *     prefix                 {string}
   *     groupSize              {number}
   *     secondaryGroupSize     {number}
   *     groupSeparator         {string}
   *     decimalSeparator       {string}
   *     fractionGroupSize      {number}
   *     fractionGroupSeparator {string}
   *     suffix                 {string}
   *
   * (The values assigned to the above FORMAT object properties are not checked for validity.)
   *
   * E.g.
   * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
   *
   * Ignore properties/parameters set to null or undefined, except for ALPHABET.
   *
   * Return an object with the properties current values.
   */
  BigNumber.config = BigNumber.set = function (obj) {
    var p, v;

    if (obj != null) {

      if (typeof obj == 'object') {

        // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
        // '[BigNumber Error] DECIMAL_PLACES {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'DECIMAL_PLACES')) {
          v = obj[p];
          intCheck(v, 0, MAX, p);
          DECIMAL_PLACES = v;
        }

        // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
        // '[BigNumber Error] ROUNDING_MODE {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'ROUNDING_MODE')) {
          v = obj[p];
          intCheck(v, 0, 8, p);
          ROUNDING_MODE = v;
        }

        // EXPONENTIAL_AT {number|number[]}
        // Integer, -MAX to MAX inclusive or
        // [integer -MAX to 0 inclusive, 0 to MAX inclusive].
        // '[BigNumber Error] EXPONENTIAL_AT {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'EXPONENTIAL_AT')) {
          v = obj[p];
          if (v && v.pop) {
            intCheck(v[0], -MAX, 0, p);
            intCheck(v[1], 0, MAX, p);
            TO_EXP_NEG = v[0];
            TO_EXP_POS = v[1];
          } else {
            intCheck(v, -MAX, MAX, p);
            TO_EXP_NEG = -(TO_EXP_POS = v < 0 ? -v : v);
          }
        }

        // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
        // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
        // '[BigNumber Error] RANGE {not a primitive number|not an integer|out of range|cannot be zero}: {v}'
        if (obj.hasOwnProperty(p = 'RANGE')) {
          v = obj[p];
          if (v && v.pop) {
            intCheck(v[0], -MAX, -1, p);
            intCheck(v[1], 1, MAX, p);
            MIN_EXP = v[0];
            MAX_EXP = v[1];
          } else {
            intCheck(v, -MAX, MAX, p);
            if (v) {
              MIN_EXP = -(MAX_EXP = v < 0 ? -v : v);
            } else {
              throw Error
               (bignumberError + p + ' cannot be zero: ' + v);
            }
          }
        }

        // CRYPTO {boolean} true or false.
        // '[BigNumber Error] CRYPTO not true or false: {v}'
        // '[BigNumber Error] crypto unavailable'
        if (obj.hasOwnProperty(p = 'CRYPTO')) {
          v = obj[p];
          if (v === !!v) {
            if (v) {
              if (typeof crypto != 'undefined' && crypto &&
               (crypto.getRandomValues || crypto.randomBytes)) {
                CRYPTO = v;
              } else {
                CRYPTO = !v;
                throw Error
                 (bignumberError + 'crypto unavailable');
              }
            } else {
              CRYPTO = v;
            }
          } else {
            throw Error
             (bignumberError + p + ' not true or false: ' + v);
          }
        }

        // MODULO_MODE {number} Integer, 0 to 9 inclusive.
        // '[BigNumber Error] MODULO_MODE {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'MODULO_MODE')) {
          v = obj[p];
          intCheck(v, 0, 9, p);
          MODULO_MODE = v;
        }

        // POW_PRECISION {number} Integer, 0 to MAX inclusive.
        // '[BigNumber Error] POW_PRECISION {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'POW_PRECISION')) {
          v = obj[p];
          intCheck(v, 0, MAX, p);
          POW_PRECISION = v;
        }

        // FORMAT {object}
        // '[BigNumber Error] FORMAT not an object: {v}'
        if (obj.hasOwnProperty(p = 'FORMAT')) {
          v = obj[p];
          if (typeof v == 'object') FORMAT = v;
          else throw Error
           (bignumberError + p + ' not an object: ' + v);
        }

        // ALPHABET {string}
        // '[BigNumber Error] ALPHABET invalid: {v}'
        if (obj.hasOwnProperty(p = 'ALPHABET')) {
          v = obj[p];

          // Disallow if less than two characters,
          // or if it contains '+', '-', '.', whitespace, or a repeated character.
          if (typeof v == 'string' && !/^.?$|[+\-.\s]|(.).*\1/.test(v)) {
            alphabetHasNormalDecimalDigits = v.slice(0, 10) == '0123456789';
            ALPHABET = v;
          } else {
            throw Error
             (bignumberError + p + ' invalid: ' + v);
          }
        }

      } else {

        // '[BigNumber Error] Object expected: {v}'
        throw Error
         (bignumberError + 'Object expected: ' + obj);
      }
    }

    return {
      DECIMAL_PLACES: DECIMAL_PLACES,
      ROUNDING_MODE: ROUNDING_MODE,
      EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
      RANGE: [MIN_EXP, MAX_EXP],
      CRYPTO: CRYPTO,
      MODULO_MODE: MODULO_MODE,
      POW_PRECISION: POW_PRECISION,
      FORMAT: FORMAT,
      ALPHABET: ALPHABET
    };
  };


  /*
   * Return true if v is a BigNumber instance, otherwise return false.
   *
   * If BigNumber.DEBUG is true, throw if a BigNumber instance is not well-formed.
   *
   * v {any}
   *
   * '[BigNumber Error] Invalid BigNumber: {v}'
   */
  BigNumber.isBigNumber = function (v) {
    if (!v || v._isBigNumber !== true) return false;
    if (!BigNumber.DEBUG) return true;

    var i, n,
      c = v.c,
      e = v.e,
      s = v.s;

    out: if ({}.toString.call(c) == '[object Array]') {

      if ((s === 1 || s === -1) && e >= -MAX && e <= MAX && e === mathfloor(e)) {

        // If the first element is zero, the BigNumber value must be zero.
        if (c[0] === 0) {
          if (e === 0 && c.length === 1) return true;
          break out;
        }

        // Calculate number of digits that c[0] should have, based on the exponent.
        i = (e + 1) % LOG_BASE;
        if (i < 1) i += LOG_BASE;

        // Calculate number of digits of c[0].
        //if (Math.ceil(Math.log(c[0] + 1) / Math.LN10) == i) {
        if (String(c[0]).length == i) {

          for (i = 0; i < c.length; i++) {
            n = c[i];
            if (n < 0 || n >= BASE || n !== mathfloor(n)) break out;
          }

          // Last element cannot be zero, unless it is the only element.
          if (n !== 0) return true;
        }
      }

    // Infinity/NaN
    } else if (c === null && e === null && (s === null || s === 1 || s === -1)) {
      return true;
    }

    throw Error
      (bignumberError + 'Invalid BigNumber: ' + v);
  };


  /*
   * Return a new BigNumber whose value is the maximum of the arguments.
   *
   * arguments {number|string|BigNumber}
   */
  BigNumber.maximum = BigNumber.max = function () {
    return maxOrMin(arguments, P.lt);
  };


  /*
   * Return a new BigNumber whose value is the minimum of the arguments.
   *
   * arguments {number|string|BigNumber}
   */
  BigNumber.minimum = BigNumber.min = function () {
    return maxOrMin(arguments, P.gt);
  };


  /*
   * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
   * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
   * zeros are produced).
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp}'
   * '[BigNumber Error] crypto unavailable'
   */
  BigNumber.random = (function () {
    var pow2_53 = 0x20000000000000;

    // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
    // Check if Math.random() produces more than 32 bits of randomness.
    // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
    // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
    var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
     ? function () { return mathfloor(Math.random() * pow2_53); }
     : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
       (Math.random() * 0x800000 | 0); };

    return function (dp) {
      var a, b, e, k, v,
        i = 0,
        c = [],
        rand = new BigNumber(ONE);

      if (dp == null) dp = DECIMAL_PLACES;
      else intCheck(dp, 0, MAX);

      k = mathceil(dp / LOG_BASE);

      if (CRYPTO) {

        // Browsers supporting crypto.getRandomValues.
        if (crypto.getRandomValues) {

          a = crypto.getRandomValues(new Uint32Array(k *= 2));

          for (; i < k;) {

            // 53 bits:
            // ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
            // 11111 11111111 11111111 11111111 11100000 00000000 00000000
            // ((Math.pow(2, 32) - 1) >>> 11).toString(2)
            //                                     11111 11111111 11111111
            // 0x20000 is 2^21.
            v = a[i] * 0x20000 + (a[i + 1] >>> 11);

            // Rejection sampling:
            // 0 <= v < 9007199254740992
            // Probability that v >= 9e15, is
            // 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
            if (v >= 9e15) {
              b = crypto.getRandomValues(new Uint32Array(2));
              a[i] = b[0];
              a[i + 1] = b[1];
            } else {

              // 0 <= v <= 8999999999999999
              // 0 <= (v % 1e14) <= 99999999999999
              c.push(v % 1e14);
              i += 2;
            }
          }
          i = k / 2;

        // Node.js supporting crypto.randomBytes.
        } else if (crypto.randomBytes) {

          // buffer
          a = crypto.randomBytes(k *= 7);

          for (; i < k;) {

            // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
            // 0x100000000 is 2^32, 0x1000000 is 2^24
            // 11111 11111111 11111111 11111111 11111111 11111111 11111111
            // 0 <= v < 9007199254740992
            v = ((a[i] & 31) * 0x1000000000000) + (a[i + 1] * 0x10000000000) +
               (a[i + 2] * 0x100000000) + (a[i + 3] * 0x1000000) +
               (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];

            if (v >= 9e15) {
              crypto.randomBytes(7).copy(a, i);
            } else {

              // 0 <= (v % 1e14) <= 99999999999999
              c.push(v % 1e14);
              i += 7;
            }
          }
          i = k / 7;
        } else {
          CRYPTO = false;
          throw Error
           (bignumberError + 'crypto unavailable');
        }
      }

      // Use Math.random.
      if (!CRYPTO) {

        for (; i < k;) {
          v = random53bitInt();
          if (v < 9e15) c[i++] = v % 1e14;
        }
      }

      k = c[--i];
      dp %= LOG_BASE;

      // Convert trailing digits to zeros according to dp.
      if (k && dp) {
        v = POWS_TEN[LOG_BASE - dp];
        c[i] = mathfloor(k / v) * v;
      }

      // Remove trailing elements which are zero.
      for (; c[i] === 0; c.pop(), i--);

      // Zero?
      if (i < 0) {
        c = [e = 0];
      } else {

        // Remove leading elements which are zero and adjust exponent accordingly.
        for (e = -1 ; c[0] === 0; c.splice(0, 1), e -= LOG_BASE);

        // Count the digits of the first element of c to determine leading zeros, and...
        for (i = 1, v = c[0]; v >= 10; v /= 10, i++);

        // adjust the exponent accordingly.
        if (i < LOG_BASE) e -= LOG_BASE - i;
      }

      rand.e = e;
      rand.c = c;
      return rand;
    };
  })();


   /*
   * Return a BigNumber whose value is the sum of the arguments.
   *
   * arguments {number|string|BigNumber}
   */
  BigNumber.sum = function () {
    var i = 1,
      args = arguments,
      sum = new BigNumber(args[0]);
    for (; i < args.length;) sum = sum.plus(args[i++]);
    return sum;
  };


  // PRIVATE FUNCTIONS


  // Called by BigNumber and BigNumber.prototype.toString.
  convertBase = (function () {
    var decimal = '0123456789';

    /*
     * Convert string of baseIn to an array of numbers of baseOut.
     * Eg. toBaseOut('255', 10, 16) returns [15, 15].
     * Eg. toBaseOut('ff', 16, 10) returns [2, 5, 5].
     */
    function toBaseOut(str, baseIn, baseOut, alphabet) {
      var j,
        arr = [0],
        arrL,
        i = 0,
        len = str.length;

      for (; i < len;) {
        for (arrL = arr.length; arrL--; arr[arrL] *= baseIn);

        arr[0] += alphabet.indexOf(str.charAt(i++));

        for (j = 0; j < arr.length; j++) {

          if (arr[j] > baseOut - 1) {
            if (arr[j + 1] == null) arr[j + 1] = 0;
            arr[j + 1] += arr[j] / baseOut | 0;
            arr[j] %= baseOut;
          }
        }
      }

      return arr.reverse();
    }

    // Convert a numeric string of baseIn to a numeric string of baseOut.
    // If the caller is toString, we are converting from base 10 to baseOut.
    // If the caller is BigNumber, we are converting from baseIn to base 10.
    return function (str, baseIn, baseOut, sign, callerIsToString) {
      var alphabet, d, e, k, r, x, xc, y,
        i = str.indexOf('.'),
        dp = DECIMAL_PLACES,
        rm = ROUNDING_MODE;

      // Non-integer.
      if (i >= 0) {
        k = POW_PRECISION;

        // Unlimited precision.
        POW_PRECISION = 0;
        str = str.replace('.', '');
        y = new BigNumber(baseIn);
        x = y.pow(str.length - i);
        POW_PRECISION = k;

        // Convert str as if an integer, then restore the fraction part by dividing the
        // result by its base raised to a power.

        y.c = toBaseOut(toFixedPoint(coeffToString(x.c), x.e, '0'),
         10, baseOut, decimal);
        y.e = y.c.length;
      }

      // Convert the number as integer.

      xc = toBaseOut(str, baseIn, baseOut, callerIsToString
       ? (alphabet = ALPHABET, decimal)
       : (alphabet = decimal, ALPHABET));

      // xc now represents str as an integer and converted to baseOut. e is the exponent.
      e = k = xc.length;

      // Remove trailing zeros.
      for (; xc[--k] == 0; xc.pop());

      // Zero?
      if (!xc[0]) return alphabet.charAt(0);

      // Does str represent an integer? If so, no need for the division.
      if (i < 0) {
        --e;
      } else {
        x.c = xc;
        x.e = e;

        // The sign is needed for correct rounding.
        x.s = sign;
        x = div(x, y, dp, rm, baseOut);
        xc = x.c;
        r = x.r;
        e = x.e;
      }

      // xc now represents str converted to baseOut.

      // THe index of the rounding digit.
      d = e + dp + 1;

      // The rounding digit: the digit to the right of the digit that may be rounded up.
      i = xc[d];

      // Look at the rounding digits and mode to determine whether to round up.

      k = baseOut / 2;
      r = r || d < 0 || xc[d + 1] != null;

      r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
            : i > k || i == k &&(rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
             rm == (x.s < 0 ? 8 : 7));

      // If the index of the rounding digit is not greater than zero, or xc represents
      // zero, then the result of the base conversion is zero or, if rounding up, a value
      // such as 0.00001.
      if (d < 1 || !xc[0]) {

        // 1^-dp or 0
        str = r ? toFixedPoint(alphabet.charAt(1), -dp, alphabet.charAt(0)) : alphabet.charAt(0);
      } else {

        // Truncate xc to the required number of decimal places.
        xc.length = d;

        // Round up?
        if (r) {

          // Rounding up may mean the previous digit has to be rounded up and so on.
          for (--baseOut; ++xc[--d] > baseOut;) {
            xc[d] = 0;

            if (!d) {
              ++e;
              xc = [1].concat(xc);
            }
          }
        }

        // Determine trailing zeros.
        for (k = xc.length; !xc[--k];);

        // E.g. [4, 11, 15] becomes 4bf.
        for (i = 0, str = ''; i <= k; str += alphabet.charAt(xc[i++]));

        // Add leading zeros, decimal point and trailing zeros as required.
        str = toFixedPoint(str, e, alphabet.charAt(0));
      }

      // The caller will add the sign.
      return str;
    };
  })();


  // Perform division in the specified base. Called by div and convertBase.
  div = (function () {

    // Assume non-zero x and k.
    function multiply(x, k, base) {
      var m, temp, xlo, xhi,
        carry = 0,
        i = x.length,
        klo = k % SQRT_BASE,
        khi = k / SQRT_BASE | 0;

      for (x = x.slice(); i--;) {
        xlo = x[i] % SQRT_BASE;
        xhi = x[i] / SQRT_BASE | 0;
        m = khi * xlo + xhi * klo;
        temp = klo * xlo + ((m % SQRT_BASE) * SQRT_BASE) + carry;
        carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
        x[i] = temp % base;
      }

      if (carry) x = [carry].concat(x);

      return x;
    }

    function compare(a, b, aL, bL) {
      var i, cmp;

      if (aL != bL) {
        cmp = aL > bL ? 1 : -1;
      } else {

        for (i = cmp = 0; i < aL; i++) {

          if (a[i] != b[i]) {
            cmp = a[i] > b[i] ? 1 : -1;
            break;
          }
        }
      }

      return cmp;
    }

    function subtract(a, b, aL, base) {
      var i = 0;

      // Subtract b from a.
      for (; aL--;) {
        a[aL] -= i;
        i = a[aL] < b[aL] ? 1 : 0;
        a[aL] = i * base + a[aL] - b[aL];
      }

      // Remove leading zeros.
      for (; !a[0] && a.length > 1; a.splice(0, 1));
    }

    // x: dividend, y: divisor.
    return function (x, y, dp, rm, base) {
      var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
        yL, yz,
        s = x.s == y.s ? 1 : -1,
        xc = x.c,
        yc = y.c;

      // Either NaN, Infinity or 0?
      if (!xc || !xc[0] || !yc || !yc[0]) {

        return new BigNumber(

         // Return NaN if either NaN, or both Infinity or 0.
         !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN :

          // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
          xc && xc[0] == 0 || !yc ? s * 0 : s / 0
       );
      }

      q = new BigNumber(s);
      qc = q.c = [];
      e = x.e - y.e;
      s = dp + e + 1;

      if (!base) {
        base = BASE;
        e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
        s = s / LOG_BASE | 0;
      }

      // Result exponent may be one less then the current value of e.
      // The coefficients of the BigNumbers from convertBase may have trailing zeros.
      for (i = 0; yc[i] == (xc[i] || 0); i++);

      if (yc[i] > (xc[i] || 0)) e--;

      if (s < 0) {
        qc.push(1);
        more = true;
      } else {
        xL = xc.length;
        yL = yc.length;
        i = 0;
        s += 2;

        // Normalise xc and yc so highest order digit of yc is >= base / 2.

        n = mathfloor(base / (yc[0] + 1));

        // Not necessary, but to handle odd bases where yc[0] == (base / 2) - 1.
        // if (n > 1 || n++ == 1 && yc[0] < base / 2) {
        if (n > 1) {
          yc = multiply(yc, n, base);
          xc = multiply(xc, n, base);
          yL = yc.length;
          xL = xc.length;
        }

        xi = yL;
        rem = xc.slice(0, yL);
        remL = rem.length;

        // Add zeros to make remainder as long as divisor.
        for (; remL < yL; rem[remL++] = 0);
        yz = yc.slice();
        yz = [0].concat(yz);
        yc0 = yc[0];
        if (yc[1] >= base / 2) yc0++;
        // Not necessary, but to prevent trial digit n > base, when using base 3.
        // else if (base == 3 && yc0 == 1) yc0 = 1 + 1e-15;

        do {
          n = 0;

          // Compare divisor and remainder.
          cmp = compare(yc, rem, yL, remL);

          // If divisor < remainder.
          if (cmp < 0) {

            // Calculate trial digit, n.

            rem0 = rem[0];
            if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

            // n is how many times the divisor goes into the current remainder.
            n = mathfloor(rem0 / yc0);

            //  Algorithm:
            //  product = divisor multiplied by trial digit (n).
            //  Compare product and remainder.
            //  If product is greater than remainder:
            //    Subtract divisor from product, decrement trial digit.
            //  Subtract product from remainder.
            //  If product was less than remainder at the last compare:
            //    Compare new remainder and divisor.
            //    If remainder is greater than divisor:
            //      Subtract divisor from remainder, increment trial digit.

            if (n > 1) {

              // n may be > base only when base is 3.
              if (n >= base) n = base - 1;

              // product = divisor * trial digit.
              prod = multiply(yc, n, base);
              prodL = prod.length;
              remL = rem.length;

              // Compare product and remainder.
              // If product > remainder then trial digit n too high.
              // n is 1 too high about 5% of the time, and is not known to have
              // ever been more than 1 too high.
              while (compare(prod, rem, prodL, remL) == 1) {
                n--;

                // Subtract divisor from product.
                subtract(prod, yL < prodL ? yz : yc, prodL, base);
                prodL = prod.length;
                cmp = 1;
              }
            } else {

              // n is 0 or 1, cmp is -1.
              // If n is 0, there is no need to compare yc and rem again below,
              // so change cmp to 1 to avoid it.
              // If n is 1, leave cmp as -1, so yc and rem are compared again.
              if (n == 0) {

                // divisor < remainder, so n must be at least 1.
                cmp = n = 1;
              }

              // product = divisor
              prod = yc.slice();
              prodL = prod.length;
            }

            if (prodL < remL) prod = [0].concat(prod);

            // Subtract product from remainder.
            subtract(rem, prod, remL, base);
            remL = rem.length;

             // If product was < remainder.
            if (cmp == -1) {

              // Compare divisor and new remainder.
              // If divisor < new remainder, subtract divisor from remainder.
              // Trial digit n too low.
              // n is 1 too low about 5% of the time, and very rarely 2 too low.
              while (compare(yc, rem, yL, remL) < 1) {
                n++;

                // Subtract divisor from remainder.
                subtract(rem, yL < remL ? yz : yc, remL, base);
                remL = rem.length;
              }
            }
          } else if (cmp === 0) {
            n++;
            rem = [0];
          } // else cmp === 1 and n will be 0

          // Add the next digit, n, to the result array.
          qc[i++] = n;

          // Update the remainder.
          if (rem[0]) {
            rem[remL++] = xc[xi] || 0;
          } else {
            rem = [xc[xi]];
            remL = 1;
          }
        } while ((xi++ < xL || rem[0] != null) && s--);

        more = rem[0] != null;

        // Leading zero?
        if (!qc[0]) qc.splice(0, 1);
      }

      if (base == BASE) {

        // To calculate q.e, first get the number of digits of qc[0].
        for (i = 1, s = qc[0]; s >= 10; s /= 10, i++);

        round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);

      // Caller is convertBase.
      } else {
        q.e = e;
        q.r = +more;
      }

      return q;
    };
  })();


  /*
   * Return a string representing the value of BigNumber n in fixed-point or exponential
   * notation rounded to the specified decimal places or significant digits.
   *
   * n: a BigNumber.
   * i: the index of the last digit required (i.e. the digit that may be rounded up).
   * rm: the rounding mode.
   * id: 1 (toExponential) or 2 (toPrecision).
   */
  function format(n, i, rm, id) {
    var c0, e, ne, len, str;

    if (rm == null) rm = ROUNDING_MODE;
    else intCheck(rm, 0, 8);

    if (!n.c) return n.toString();

    c0 = n.c[0];
    ne = n.e;

    if (i == null) {
      str = coeffToString(n.c);
      str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS)
       ? toExponential(str, ne)
       : toFixedPoint(str, ne, '0');
    } else {
      n = round(new BigNumber(n), i, rm);

      // n.e may have changed if the value was rounded up.
      e = n.e;

      str = coeffToString(n.c);
      len = str.length;

      // toPrecision returns exponential notation if the number of significant digits
      // specified is less than the number of digits necessary to represent the integer
      // part of the value in fixed-point notation.

      // Exponential notation.
      if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {

        // Append zeros?
        for (; len < i; str += '0', len++);
        str = toExponential(str, e);

      // Fixed-point notation.
      } else {
        i -= ne;
        str = toFixedPoint(str, e, '0');

        // Append zeros?
        if (e + 1 > len) {
          if (--i > 0) for (str += '.'; i--; str += '0');
        } else {
          i += e - len;
          if (i > 0) {
            if (e + 1 == len) str += '.';
            for (; i--; str += '0');
          }
        }
      }
    }

    return n.s < 0 && c0 ? '-' + str : str;
  }


  // Handle BigNumber.max and BigNumber.min.
  function maxOrMin(args, method) {
    var n,
      i = 1,
      m = new BigNumber(args[0]);

    for (; i < args.length; i++) {
      n = new BigNumber(args[i]);

      // If any number is NaN, return NaN.
      if (!n.s) {
        m = n;
        break;
      } else if (method.call(m, n)) {
        m = n;
      }
    }

    return m;
  }


  /*
   * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
   * Called by minus, plus and times.
   */
  function normalise(n, c, e) {
    var i = 1,
      j = c.length;

     // Remove trailing zeros.
    for (; !c[--j]; c.pop());

    // Calculate the base 10 exponent. First get the number of digits of c[0].
    for (j = c[0]; j >= 10; j /= 10, i++);

    // Overflow?
    if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {

      // Infinity.
      n.c = n.e = null;

    // Underflow?
    } else if (e < MIN_EXP) {

      // Zero.
      n.c = [n.e = 0];
    } else {
      n.e = e;
      n.c = c;
    }

    return n;
  }


  // Handle values that fail the validity test in BigNumber.
  parseNumeric = (function () {
    var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
      dotAfter = /^([^.]+)\.$/,
      dotBefore = /^\.([^.]+)$/,
      isInfinityOrNaN = /^-?(Infinity|NaN)$/,
      whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

    return function (x, str, isNum, b) {
      var base,
        s = isNum ? str : str.replace(whitespaceOrPlus, '');

      // No exception on ±Infinity or NaN.
      if (isInfinityOrNaN.test(s)) {
        x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
      } else {
        if (!isNum) {

          // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
          s = s.replace(basePrefix, function (m, p1, p2) {
            base = (p2 = p2.toLowerCase()) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
            return !b || b == base ? p1 : m;
          });

          if (b) {
            base = b;

            // E.g. '1.' to '1', '.1' to '0.1'
            s = s.replace(dotAfter, '$1').replace(dotBefore, '0.$1');
          }

          if (str != s) return new BigNumber(s, base);
        }

        // '[BigNumber Error] Not a number: {n}'
        // '[BigNumber Error] Not a base {b} number: {n}'
        if (BigNumber.DEBUG) {
          throw Error
            (bignumberError + 'Not a' + (b ? ' base ' + b : '') + ' number: ' + str);
        }

        // NaN
        x.s = null;
      }

      x.c = x.e = null;
    }
  })();


  /*
   * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
   * If r is truthy, it is known that there are more digits after the rounding digit.
   */
  function round(x, sd, rm, r) {
    var d, i, j, k, n, ni, rd,
      xc = x.c,
      pows10 = POWS_TEN;

    // if x is not Infinity or NaN...
    if (xc) {

      // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
      // n is a base 1e14 number, the value of the element of array x.c containing rd.
      // ni is the index of n within x.c.
      // d is the number of digits of n.
      // i is the index of rd within n including leading zeros.
      // j is the actual index of rd within n (if < 0, rd is a leading zero).
      out: {

        // Get the number of digits of the first element of xc.
        for (d = 1, k = xc[0]; k >= 10; k /= 10, d++);
        i = sd - d;

        // If the rounding digit is in the first element of xc...
        if (i < 0) {
          i += LOG_BASE;
          j = sd;
          n = xc[ni = 0];

          // Get the rounding digit at index j of n.
          rd = n / pows10[d - j - 1] % 10 | 0;
        } else {
          ni = mathceil((i + 1) / LOG_BASE);

          if (ni >= xc.length) {

            if (r) {

              // Needed by sqrt.
              for (; xc.length <= ni; xc.push(0));
              n = rd = 0;
              d = 1;
              i %= LOG_BASE;
              j = i - LOG_BASE + 1;
            } else {
              break out;
            }
          } else {
            n = k = xc[ni];

            // Get the number of digits of n.
            for (d = 1; k >= 10; k /= 10, d++);

            // Get the index of rd within n.
            i %= LOG_BASE;

            // Get the index of rd within n, adjusted for leading zeros.
            // The number of leading zeros of n is given by LOG_BASE - d.
            j = i - LOG_BASE + d;

            // Get the rounding digit at index j of n.
            rd = j < 0 ? 0 : n / pows10[d - j - 1] % 10 | 0;
          }
        }

        r = r || sd < 0 ||

        // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
         xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);

        r = rm < 4
         ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
         : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 &&

          // Check whether the digit to the left of the rounding digit is odd.
          ((i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10) & 1 ||
           rm == (x.s < 0 ? 8 : 7));

        if (sd < 1 || !xc[0]) {
          xc.length = 0;

          if (r) {

            // Convert sd to decimal places.
            sd -= x.e + 1;

            // 1, 0.1, 0.01, 0.001, 0.0001 etc.
            xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
            x.e = -sd || 0;
          } else {

            // Zero.
            xc[0] = x.e = 0;
          }

          return x;
        }

        // Remove excess digits.
        if (i == 0) {
          xc.length = ni;
          k = 1;
          ni--;
        } else {
          xc.length = ni + 1;
          k = pows10[LOG_BASE - i];

          // E.g. 56700 becomes 56000 if 7 is the rounding digit.
          // j > 0 means i > number of leading zeros of n.
          xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
        }

        // Round up?
        if (r) {

          for (; ;) {

            // If the digit to be rounded up is in the first element of xc...
            if (ni == 0) {

              // i will be the length of xc[0] before k is added.
              for (i = 1, j = xc[0]; j >= 10; j /= 10, i++);
              j = xc[0] += k;
              for (k = 1; j >= 10; j /= 10, k++);

              // if i != k the length has increased.
              if (i != k) {
                x.e++;
                if (xc[0] == BASE) xc[0] = 1;
              }

              break;
            } else {
              xc[ni] += k;
              if (xc[ni] != BASE) break;
              xc[ni--] = 0;
              k = 1;
            }
          }
        }

        // Remove trailing zeros.
        for (i = xc.length; xc[--i] === 0; xc.pop());
      }

      // Overflow? Infinity.
      if (x.e > MAX_EXP) {
        x.c = x.e = null;

      // Underflow? Zero.
      } else if (x.e < MIN_EXP) {
        x.c = [x.e = 0];
      }
    }

    return x;
  }


  function valueOf(n) {
    var str,
      e = n.e;

    if (e === null) return n.toString();

    str = coeffToString(n.c);

    str = e <= TO_EXP_NEG || e >= TO_EXP_POS
      ? toExponential(str, e)
      : toFixedPoint(str, e, '0');

    return n.s < 0 ? '-' + str : str;
  }


  // PROTOTYPE/INSTANCE METHODS


  /*
   * Return a new BigNumber whose value is the absolute value of this BigNumber.
   */
  P.absoluteValue = P.abs = function () {
    var x = new BigNumber(this);
    if (x.s < 0) x.s = 1;
    return x;
  };


  /*
   * Return
   *   1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
   *   -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
   *   0 if they have the same value,
   *   or null if the value of either is NaN.
   */
  P.comparedTo = function (y, b) {
    return compare(this, new BigNumber(y, b));
  };


  /*
   * If dp is undefined or null or true or false, return the number of decimal places of the
   * value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
   *
   * Otherwise, if dp is a number, return a new BigNumber whose value is the value of this
   * BigNumber rounded to a maximum of dp decimal places using rounding mode rm, or
   * ROUNDING_MODE if rm is omitted.
   *
   * [dp] {number} Decimal places: integer, 0 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
   */
  P.decimalPlaces = P.dp = function (dp, rm) {
    var c, n, v,
      x = this;

    if (dp != null) {
      intCheck(dp, 0, MAX);
      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);

      return round(new BigNumber(x), dp + x.e + 1, rm);
    }

    if (!(c = x.c)) return null;
    n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;

    // Subtract the number of trailing zeros of the last number.
    if (v = c[v]) for (; v % 10 == 0; v /= 10, n--);
    if (n < 0) n = 0;

    return n;
  };


  /*
   *  n / 0 = I
   *  n / N = N
   *  n / I = 0
   *  0 / n = 0
   *  0 / 0 = N
   *  0 / N = N
   *  0 / I = 0
   *  N / n = N
   *  N / 0 = N
   *  N / N = N
   *  N / I = N
   *  I / n = I
   *  I / 0 = I
   *  I / N = N
   *  I / I = N
   *
   * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
   * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
   */
  P.dividedBy = P.div = function (y, b) {
    return div(this, new BigNumber(y, b), DECIMAL_PLACES, ROUNDING_MODE);
  };


  /*
   * Return a new BigNumber whose value is the integer part of dividing the value of this
   * BigNumber by the value of BigNumber(y, b).
   */
  P.dividedToIntegerBy = P.idiv = function (y, b) {
    return div(this, new BigNumber(y, b), 0, 1);
  };


  /*
   * Return a BigNumber whose value is the value of this BigNumber exponentiated by n.
   *
   * If m is present, return the result modulo m.
   * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
   * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using ROUNDING_MODE.
   *
   * The modular power operation works efficiently when x, n, and m are integers, otherwise it
   * is equivalent to calculating x.exponentiatedBy(n).modulo(m) with a POW_PRECISION of 0.
   *
   * n {number|string|BigNumber} The exponent. An integer.
   * [m] {number|string|BigNumber} The modulus.
   *
   * '[BigNumber Error] Exponent not an integer: {n}'
   */
  P.exponentiatedBy = P.pow = function (n, m) {
    var half, isModExp, i, k, more, nIsBig, nIsNeg, nIsOdd, y,
      x = this;

    n = new BigNumber(n);

    // Allow NaN and ±Infinity, but not other non-integers.
    if (n.c && !n.isInteger()) {
      throw Error
        (bignumberError + 'Exponent not an integer: ' + valueOf(n));
    }

    if (m != null) m = new BigNumber(m);

    // Exponent of MAX_SAFE_INTEGER is 15.
    nIsBig = n.e > 14;

    // If x is NaN, ±Infinity, ±0 or ±1, or n is ±Infinity, NaN or ±0.
    if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {

      // The sign of the result of pow when x is negative depends on the evenness of n.
      // If +n overflows to ±Infinity, the evenness of n would be not be known.
      y = new BigNumber(Math.pow(+valueOf(x), nIsBig ? n.s * (2 - isOdd(n)) : +valueOf(n)));
      return m ? y.mod(m) : y;
    }

    nIsNeg = n.s < 0;

    if (m) {

      // x % m returns NaN if abs(m) is zero, or m is NaN.
      if (m.c ? !m.c[0] : !m.s) return new BigNumber(NaN);

      isModExp = !nIsNeg && x.isInteger() && m.isInteger();

      if (isModExp) x = x.mod(m);

    // Overflow to ±Infinity: >=2**1e10 or >=1.0000024**1e15.
    // Underflow to ±0: <=0.79**1e10 or <=0.9999975**1e15.
    } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0
      // [1, 240000000]
      ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7
      // [80000000000000]  [99999750000000]
      : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {

      // If x is negative and n is odd, k = -0, else k = 0.
      k = x.s < 0 && isOdd(n) ? -0 : 0;

      // If x >= 1, k = ±Infinity.
      if (x.e > -1) k = 1 / k;

      // If n is negative return ±0, else return ±Infinity.
      return new BigNumber(nIsNeg ? 1 / k : k);

    } else if (POW_PRECISION) {

      // Truncating each coefficient array to a length of k after each multiplication
      // equates to truncating significant digits to POW_PRECISION + [28, 41],
      // i.e. there will be a minimum of 28 guard digits retained.
      k = mathceil(POW_PRECISION / LOG_BASE + 2);
    }

    if (nIsBig) {
      half = new BigNumber(0.5);
      if (nIsNeg) n.s = 1;
      nIsOdd = isOdd(n);
    } else {
      i = Math.abs(+valueOf(n));
      nIsOdd = i % 2;
    }

    y = new BigNumber(ONE);

    // Performs 54 loop iterations for n of 9007199254740991.
    for (; ;) {

      if (nIsOdd) {
        y = y.times(x);
        if (!y.c) break;

        if (k) {
          if (y.c.length > k) y.c.length = k;
        } else if (isModExp) {
          y = y.mod(m);    //y = y.minus(div(y, m, 0, MODULO_MODE).times(m));
        }
      }

      if (i) {
        i = mathfloor(i / 2);
        if (i === 0) break;
        nIsOdd = i % 2;
      } else {
        n = n.times(half);
        round(n, n.e + 1, 1);

        if (n.e > 14) {
          nIsOdd = isOdd(n);
        } else {
          i = +valueOf(n);
          if (i === 0) break;
          nIsOdd = i % 2;
        }
      }

      x = x.times(x);

      if (k) {
        if (x.c && x.c.length > k) x.c.length = k;
      } else if (isModExp) {
        x = x.mod(m);    //x = x.minus(div(x, m, 0, MODULO_MODE).times(m));
      }
    }

    if (isModExp) return y;
    if (nIsNeg) y = ONE.div(y);

    return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
  };


  /*
   * Return a new BigNumber whose value is the value of this BigNumber rounded to an integer
   * using rounding mode rm, or ROUNDING_MODE if rm is omitted.
   *
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {rm}'
   */
  P.integerValue = function (rm) {
    var n = new BigNumber(this);
    if (rm == null) rm = ROUNDING_MODE;
    else intCheck(rm, 0, 8);
    return round(n, n.e + 1, rm);
  };


  /*
   * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
   * otherwise return false.
   */
  P.isEqualTo = P.eq = function (y, b) {
    return compare(this, new BigNumber(y, b)) === 0;
  };


  /*
   * Return true if the value of this BigNumber is a finite number, otherwise return false.
   */
  P.isFinite = function () {
    return !!this.c;
  };


  /*
   * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
   * otherwise return false.
   */
  P.isGreaterThan = P.gt = function (y, b) {
    return compare(this, new BigNumber(y, b)) > 0;
  };


  /*
   * Return true if the value of this BigNumber is greater than or equal to the value of
   * BigNumber(y, b), otherwise return false.
   */
  P.isGreaterThanOrEqualTo = P.gte = function (y, b) {
    return (b = compare(this, new BigNumber(y, b))) === 1 || b === 0;

  };


  /*
   * Return true if the value of this BigNumber is an integer, otherwise return false.
   */
  P.isInteger = function () {
    return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
  };


  /*
   * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
   * otherwise return false.
   */
  P.isLessThan = P.lt = function (y, b) {
    return compare(this, new BigNumber(y, b)) < 0;
  };


  /*
   * Return true if the value of this BigNumber is less than or equal to the value of
   * BigNumber(y, b), otherwise return false.
   */
  P.isLessThanOrEqualTo = P.lte = function (y, b) {
    return (b = compare(this, new BigNumber(y, b))) === -1 || b === 0;
  };


  /*
   * Return true if the value of this BigNumber is NaN, otherwise return false.
   */
  P.isNaN = function () {
    return !this.s;
  };


  /*
   * Return true if the value of this BigNumber is negative, otherwise return false.
   */
  P.isNegative = function () {
    return this.s < 0;
  };


  /*
   * Return true if the value of this BigNumber is positive, otherwise return false.
   */
  P.isPositive = function () {
    return this.s > 0;
  };


  /*
   * Return true if the value of this BigNumber is 0 or -0, otherwise return false.
   */
  P.isZero = function () {
    return !!this.c && this.c[0] == 0;
  };


  /*
   *  n - 0 = n
   *  n - N = N
   *  n - I = -I
   *  0 - n = -n
   *  0 - 0 = 0
   *  0 - N = N
   *  0 - I = -I
   *  N - n = N
   *  N - 0 = N
   *  N - N = N
   *  N - I = N
   *  I - n = I
   *  I - 0 = I
   *  I - N = N
   *  I - I = N
   *
   * Return a new BigNumber whose value is the value of this BigNumber minus the value of
   * BigNumber(y, b).
   */
  P.minus = function (y, b) {
    var i, j, t, xLTy,
      x = this,
      a = x.s;

    y = new BigNumber(y, b);
    b = y.s;

    // Either NaN?
    if (!a || !b) return new BigNumber(NaN);

    // Signs differ?
    if (a != b) {
      y.s = -b;
      return x.plus(y);
    }

    var xe = x.e / LOG_BASE,
      ye = y.e / LOG_BASE,
      xc = x.c,
      yc = y.c;

    if (!xe || !ye) {

      // Either Infinity?
      if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber(yc ? x : NaN);

      // Either zero?
      if (!xc[0] || !yc[0]) {

        // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
        return yc[0] ? (y.s = -b, y) : new BigNumber(xc[0] ? x :

         // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
         ROUNDING_MODE == 3 ? -0 : 0);
      }
    }

    xe = bitFloor(xe);
    ye = bitFloor(ye);
    xc = xc.slice();

    // Determine which is the bigger number.
    if (a = xe - ye) {

      if (xLTy = a < 0) {
        a = -a;
        t = xc;
      } else {
        ye = xe;
        t = yc;
      }

      t.reverse();

      // Prepend zeros to equalise exponents.
      for (b = a; b--; t.push(0));
      t.reverse();
    } else {

      // Exponents equal. Check digit by digit.
      j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;

      for (a = b = 0; b < j; b++) {

        if (xc[b] != yc[b]) {
          xLTy = xc[b] < yc[b];
          break;
        }
      }
    }

    // x < y? Point xc to the array of the bigger number.
    if (xLTy) t = xc, xc = yc, yc = t, y.s = -y.s;

    b = (j = yc.length) - (i = xc.length);

    // Append zeros to xc if shorter.
    // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
    if (b > 0) for (; b--; xc[i++] = 0);
    b = BASE - 1;

    // Subtract yc from xc.
    for (; j > a;) {

      if (xc[--j] < yc[j]) {
        for (i = j; i && !xc[--i]; xc[i] = b);
        --xc[i];
        xc[j] += BASE;
      }

      xc[j] -= yc[j];
    }

    // Remove leading zeros and adjust exponent accordingly.
    for (; xc[0] == 0; xc.splice(0, 1), --ye);

    // Zero?
    if (!xc[0]) {

      // Following IEEE 754 (2008) 6.3,
      // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
      y.s = ROUNDING_MODE == 3 ? -1 : 1;
      y.c = [y.e = 0];
      return y;
    }

    // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
    // for finite x and y.
    return normalise(y, xc, ye);
  };


  /*
   *   n % 0 =  N
   *   n % N =  N
   *   n % I =  n
   *   0 % n =  0
   *  -0 % n = -0
   *   0 % 0 =  N
   *   0 % N =  N
   *   0 % I =  0
   *   N % n =  N
   *   N % 0 =  N
   *   N % N =  N
   *   N % I =  N
   *   I % n =  N
   *   I % 0 =  N
   *   I % N =  N
   *   I % I =  N
   *
   * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
   * BigNumber(y, b). The result depends on the value of MODULO_MODE.
   */
  P.modulo = P.mod = function (y, b) {
    var q, s,
      x = this;

    y = new BigNumber(y, b);

    // Return NaN if x is Infinity or NaN, or y is NaN or zero.
    if (!x.c || !y.s || y.c && !y.c[0]) {
      return new BigNumber(NaN);

    // Return x if y is Infinity or x is zero.
    } else if (!y.c || x.c && !x.c[0]) {
      return new BigNumber(x);
    }

    if (MODULO_MODE == 9) {

      // Euclidian division: q = sign(y) * floor(x / abs(y))
      // r = x - qy    where  0 <= r < abs(y)
      s = y.s;
      y.s = 1;
      q = div(x, y, 0, 3);
      y.s = s;
      q.s *= s;
    } else {
      q = div(x, y, 0, MODULO_MODE);
    }

    y = x.minus(q.times(y));

    // To match JavaScript %, ensure sign of zero is sign of dividend.
    if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;

    return y;
  };


  /*
   *  n * 0 = 0
   *  n * N = N
   *  n * I = I
   *  0 * n = 0
   *  0 * 0 = 0
   *  0 * N = N
   *  0 * I = N
   *  N * n = N
   *  N * 0 = N
   *  N * N = N
   *  N * I = N
   *  I * n = I
   *  I * 0 = N
   *  I * N = N
   *  I * I = I
   *
   * Return a new BigNumber whose value is the value of this BigNumber multiplied by the value
   * of BigNumber(y, b).
   */
  P.multipliedBy = P.times = function (y, b) {
    var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
      base, sqrtBase,
      x = this,
      xc = x.c,
      yc = (y = new BigNumber(y, b)).c;

    // Either NaN, ±Infinity or ±0?
    if (!xc || !yc || !xc[0] || !yc[0]) {

      // Return NaN if either is NaN, or one is 0 and the other is Infinity.
      if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
        y.c = y.e = y.s = null;
      } else {
        y.s *= x.s;

        // Return ±Infinity if either is ±Infinity.
        if (!xc || !yc) {
          y.c = y.e = null;

        // Return ±0 if either is ±0.
        } else {
          y.c = [0];
          y.e = 0;
        }
      }

      return y;
    }

    e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
    y.s *= x.s;
    xcL = xc.length;
    ycL = yc.length;

    // Ensure xc points to longer array and xcL to its length.
    if (xcL < ycL) zc = xc, xc = yc, yc = zc, i = xcL, xcL = ycL, ycL = i;

    // Initialise the result array with zeros.
    for (i = xcL + ycL, zc = []; i--; zc.push(0));

    base = BASE;
    sqrtBase = SQRT_BASE;

    for (i = ycL; --i >= 0;) {
      c = 0;
      ylo = yc[i] % sqrtBase;
      yhi = yc[i] / sqrtBase | 0;

      for (k = xcL, j = i + k; j > i;) {
        xlo = xc[--k] % sqrtBase;
        xhi = xc[k] / sqrtBase | 0;
        m = yhi * xlo + xhi * ylo;
        xlo = ylo * xlo + ((m % sqrtBase) * sqrtBase) + zc[j] + c;
        c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
        zc[j--] = xlo % base;
      }

      zc[j] = c;
    }

    if (c) {
      ++e;
    } else {
      zc.splice(0, 1);
    }

    return normalise(y, zc, e);
  };


  /*
   * Return a new BigNumber whose value is the value of this BigNumber negated,
   * i.e. multiplied by -1.
   */
  P.negated = function () {
    var x = new BigNumber(this);
    x.s = -x.s || null;
    return x;
  };


  /*
   *  n + 0 = n
   *  n + N = N
   *  n + I = I
   *  0 + n = n
   *  0 + 0 = 0
   *  0 + N = N
   *  0 + I = I
   *  N + n = N
   *  N + 0 = N
   *  N + N = N
   *  N + I = N
   *  I + n = I
   *  I + 0 = I
   *  I + N = N
   *  I + I = I
   *
   * Return a new BigNumber whose value is the value of this BigNumber plus the value of
   * BigNumber(y, b).
   */
  P.plus = function (y, b) {
    var t,
      x = this,
      a = x.s;

    y = new BigNumber(y, b);
    b = y.s;

    // Either NaN?
    if (!a || !b) return new BigNumber(NaN);

    // Signs differ?
     if (a != b) {
      y.s = -b;
      return x.minus(y);
    }

    var xe = x.e / LOG_BASE,
      ye = y.e / LOG_BASE,
      xc = x.c,
      yc = y.c;

    if (!xe || !ye) {

      // Return ±Infinity if either ±Infinity.
      if (!xc || !yc) return new BigNumber(a / 0);

      // Either zero?
      // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
      if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber(xc[0] ? x : a * 0);
    }

    xe = bitFloor(xe);
    ye = bitFloor(ye);
    xc = xc.slice();

    // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
    if (a = xe - ye) {
      if (a > 0) {
        ye = xe;
        t = yc;
      } else {
        a = -a;
        t = xc;
      }

      t.reverse();
      for (; a--; t.push(0));
      t.reverse();
    }

    a = xc.length;
    b = yc.length;

    // Point xc to the longer array, and b to the shorter length.
    if (a - b < 0) t = yc, yc = xc, xc = t, b = a;

    // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
    for (a = 0; b;) {
      a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
      xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
    }

    if (a) {
      xc = [a].concat(xc);
      ++ye;
    }

    // No need to check for zero, as +x + +y != 0 && -x + -y != 0
    // ye = MAX_EXP + 1 possible
    return normalise(y, xc, ye);
  };


  /*
   * If sd is undefined or null or true or false, return the number of significant digits of
   * the value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
   * If sd is true include integer-part trailing zeros in the count.
   *
   * Otherwise, if sd is a number, return a new BigNumber whose value is the value of this
   * BigNumber rounded to a maximum of sd significant digits using rounding mode rm, or
   * ROUNDING_MODE if rm is omitted.
   *
   * sd {number|boolean} number: significant digits: integer, 1 to MAX inclusive.
   *                     boolean: whether to count integer-part trailing zeros: true or false.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
   */
  P.precision = P.sd = function (sd, rm) {
    var c, n, v,
      x = this;

    if (sd != null && sd !== !!sd) {
      intCheck(sd, 1, MAX);
      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);

      return round(new BigNumber(x), sd, rm);
    }

    if (!(c = x.c)) return null;
    v = c.length - 1;
    n = v * LOG_BASE + 1;

    if (v = c[v]) {

      // Subtract the number of trailing zeros of the last element.
      for (; v % 10 == 0; v /= 10, n--);

      // Add the number of digits of the first element.
      for (v = c[0]; v >= 10; v /= 10, n++);
    }

    if (sd && x.e + 1 > n) n = x.e + 1;

    return n;
  };


  /*
   * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
   * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
   *
   * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {k}'
   */
  P.shiftedBy = function (k) {
    intCheck(k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
    return this.times('1e' + k);
  };


  /*
   *  sqrt(-n) =  N
   *  sqrt(N) =  N
   *  sqrt(-I) =  N
   *  sqrt(I) =  I
   *  sqrt(0) =  0
   *  sqrt(-0) = -0
   *
   * Return a new BigNumber whose value is the square root of the value of this BigNumber,
   * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
   */
  P.squareRoot = P.sqrt = function () {
    var m, n, r, rep, t,
      x = this,
      c = x.c,
      s = x.s,
      e = x.e,
      dp = DECIMAL_PLACES + 4,
      half = new BigNumber('0.5');

    // Negative/NaN/Infinity/zero?
    if (s !== 1 || !c || !c[0]) {
      return new BigNumber(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
    }

    // Initial estimate.
    s = Math.sqrt(+valueOf(x));

    // Math.sqrt underflow/overflow?
    // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
    if (s == 0 || s == 1 / 0) {
      n = coeffToString(c);
      if ((n.length + e) % 2 == 0) n += '0';
      s = Math.sqrt(+n);
      e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);

      if (s == 1 / 0) {
        n = '5e' + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf('e') + 1) + e;
      }

      r = new BigNumber(n);
    } else {
      r = new BigNumber(s + '');
    }

    // Check for zero.
    // r could be zero if MIN_EXP is changed after the this value was created.
    // This would cause a division by zero (x/t) and hence Infinity below, which would cause
    // coeffToString to throw.
    if (r.c[0]) {
      e = r.e;
      s = e + dp;
      if (s < 3) s = 0;

      // Newton-Raphson iteration.
      for (; ;) {
        t = r;
        r = half.times(t.plus(div(x, t, dp, 1)));

        if (coeffToString(t.c).slice(0, s) === (n = coeffToString(r.c)).slice(0, s)) {

          // The exponent of r may here be one less than the final result exponent,
          // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
          // are indexed correctly.
          if (r.e < e) --s;
          n = n.slice(s - 3, s + 1);

          // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
          // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
          // iteration.
          if (n == '9999' || !rep && n == '4999') {

            // On the first iteration only, check to see if rounding up gives the
            // exact result as the nines may infinitely repeat.
            if (!rep) {
              round(t, t.e + DECIMAL_PLACES + 2, 0);

              if (t.times(t).eq(x)) {
                r = t;
                break;
              }
            }

            dp += 4;
            s += 4;
            rep = 1;
          } else {

            // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
            // result. If not, then there are further digits and m will be truthy.
            if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

              // Truncate to the first rounding digit.
              round(r, r.e + DECIMAL_PLACES + 2, 1);
              m = !r.times(r).eq(x);
            }

            break;
          }
        }
      }
    }

    return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
  };


  /*
   * Return a string representing the value of this BigNumber in exponential notation and
   * rounded using ROUNDING_MODE to dp fixed decimal places.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
   */
  P.toExponential = function (dp, rm) {
    if (dp != null) {
      intCheck(dp, 0, MAX);
      dp++;
    }
    return format(this, dp, rm, 1);
  };


  /*
   * Return a string representing the value of this BigNumber in fixed-point notation rounding
   * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
   *
   * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
   * but e.g. (-0.00001).toFixed(0) is '-0'.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
   */
  P.toFixed = function (dp, rm) {
    if (dp != null) {
      intCheck(dp, 0, MAX);
      dp = dp + this.e + 1;
    }
    return format(this, dp, rm);
  };


  /*
   * Return a string representing the value of this BigNumber in fixed-point notation rounded
   * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
   * of the format or FORMAT object (see BigNumber.set).
   *
   * The formatting object may contain some or all of the properties shown below.
   *
   * FORMAT = {
   *   prefix: '',
   *   groupSize: 3,
   *   secondaryGroupSize: 0,
   *   groupSeparator: ',',
   *   decimalSeparator: '.',
   *   fractionGroupSize: 0,
   *   fractionGroupSeparator: '\xA0',      // non-breaking space
   *   suffix: ''
   * };
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   * [format] {object} Formatting options. See FORMAT pbject above.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
   * '[BigNumber Error] Argument not an object: {format}'
   */
  P.toFormat = function (dp, rm, format) {
    var str,
      x = this;

    if (format == null) {
      if (dp != null && rm && typeof rm == 'object') {
        format = rm;
        rm = null;
      } else if (dp && typeof dp == 'object') {
        format = dp;
        dp = rm = null;
      } else {
        format = FORMAT;
      }
    } else if (typeof format != 'object') {
      throw Error
        (bignumberError + 'Argument not an object: ' + format);
    }

    str = x.toFixed(dp, rm);

    if (x.c) {
      var i,
        arr = str.split('.'),
        g1 = +format.groupSize,
        g2 = +format.secondaryGroupSize,
        groupSeparator = format.groupSeparator || '',
        intPart = arr[0],
        fractionPart = arr[1],
        isNeg = x.s < 0,
        intDigits = isNeg ? intPart.slice(1) : intPart,
        len = intDigits.length;

      if (g2) i = g1, g1 = g2, g2 = i, len -= i;

      if (g1 > 0 && len > 0) {
        i = len % g1 || g1;
        intPart = intDigits.substr(0, i);
        for (; i < len; i += g1) intPart += groupSeparator + intDigits.substr(i, g1);
        if (g2 > 0) intPart += groupSeparator + intDigits.slice(i);
        if (isNeg) intPart = '-' + intPart;
      }

      str = fractionPart
       ? intPart + (format.decimalSeparator || '') + ((g2 = +format.fractionGroupSize)
        ? fractionPart.replace(new RegExp('\\d{' + g2 + '}\\B', 'g'),
         '$&' + (format.fractionGroupSeparator || ''))
        : fractionPart)
       : intPart;
    }

    return (format.prefix || '') + str + (format.suffix || '');
  };


  /*
   * Return an array of two BigNumbers representing the value of this BigNumber as a simple
   * fraction with an integer numerator and an integer denominator.
   * The denominator will be a positive non-zero value less than or equal to the specified
   * maximum denominator. If a maximum denominator is not specified, the denominator will be
   * the lowest value necessary to represent the number exactly.
   *
   * [md] {number|string|BigNumber} Integer >= 1, or Infinity. The maximum denominator.
   *
   * '[BigNumber Error] Argument {not an integer|out of range} : {md}'
   */
  P.toFraction = function (md) {
    var d, d0, d1, d2, e, exp, n, n0, n1, q, r, s,
      x = this,
      xc = x.c;

    if (md != null) {
      n = new BigNumber(md);

      // Throw if md is less than one or is not an integer, unless it is Infinity.
      if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE)) {
        throw Error
          (bignumberError + 'Argument ' +
            (n.isInteger() ? 'out of range: ' : 'not an integer: ') + valueOf(n));
      }
    }

    if (!xc) return new BigNumber(x);

    d = new BigNumber(ONE);
    n1 = d0 = new BigNumber(ONE);
    d1 = n0 = new BigNumber(ONE);
    s = coeffToString(xc);

    // Determine initial denominator.
    // d is a power of 10 and the minimum max denominator that specifies the value exactly.
    e = d.e = s.length - x.e - 1;
    d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
    md = !md || n.comparedTo(d) > 0 ? (e > 0 ? d : n1) : n;

    exp = MAX_EXP;
    MAX_EXP = 1 / 0;
    n = new BigNumber(s);

    // n0 = d1 = 0
    n0.c[0] = 0;

    for (; ;)  {
      q = div(n, d, 0, 1);
      d2 = d0.plus(q.times(d1));
      if (d2.comparedTo(md) == 1) break;
      d0 = d1;
      d1 = d2;
      n1 = n0.plus(q.times(d2 = n1));
      n0 = d2;
      d = n.minus(q.times(d2 = d));
      n = d2;
    }

    d2 = div(md.minus(d0), d1, 0, 1);
    n0 = n0.plus(d2.times(n1));
    d0 = d0.plus(d2.times(d1));
    n0.s = n1.s = x.s;
    e = e * 2;

    // Determine which fraction is closer to x, n0/d0 or n1/d1
    r = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
        div(n0, d0, e, ROUNDING_MODE).minus(x).abs()) < 1 ? [n1, d1] : [n0, d0];

    MAX_EXP = exp;

    return r;
  };


  /*
   * Return the value of this BigNumber converted to a number primitive.
   */
  P.toNumber = function () {
    return +valueOf(this);
  };


  /*
   * Return a string representing the value of this BigNumber rounded to sd significant digits
   * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
   * necessary to represent the integer part of the value in fixed-point notation, then use
   * exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
   */
  P.toPrecision = function (sd, rm) {
    if (sd != null) intCheck(sd, 1, MAX);
    return format(this, sd, rm, 2);
  };


  /*
   * Return a string representing the value of this BigNumber in base b, or base 10 if b is
   * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
   * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
   * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
   * TO_EXP_NEG, return exponential notation.
   *
   * [b] {number} Integer, 2 to ALPHABET.length inclusive.
   *
   * '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
   */
  P.toString = function (b) {
    var str,
      n = this,
      s = n.s,
      e = n.e;

    // Infinity or NaN?
    if (e === null) {
      if (s) {
        str = 'Infinity';
        if (s < 0) str = '-' + str;
      } else {
        str = 'NaN';
      }
    } else {
      if (b == null) {
        str = e <= TO_EXP_NEG || e >= TO_EXP_POS
         ? toExponential(coeffToString(n.c), e)
         : toFixedPoint(coeffToString(n.c), e, '0');
      } else if (b === 10 && alphabetHasNormalDecimalDigits) {
        n = round(new BigNumber(n), DECIMAL_PLACES + e + 1, ROUNDING_MODE);
        str = toFixedPoint(coeffToString(n.c), n.e, '0');
      } else {
        intCheck(b, 2, ALPHABET.length, 'Base');
        str = convertBase(toFixedPoint(coeffToString(n.c), e, '0'), 10, b, s, true);
      }

      if (s < 0 && n.c[0]) str = '-' + str;
    }

    return str;
  };


  /*
   * Return as toString, but do not accept a base argument, and include the minus sign for
   * negative zero.
   */
  P.valueOf = P.toJSON = function () {
    return valueOf(this);
  };


  P._isBigNumber = true;

  P[Symbol.toStringTag] = 'BigNumber';

  // Node.js v10.12.0+
  P[Symbol.for('nodejs.util.inspect.custom')] = P.valueOf;

  if (configObject != null) BigNumber.set(configObject);

  return BigNumber;
}


// PRIVATE HELPER FUNCTIONS

// These functions don't need access to variables,
// e.g. DECIMAL_PLACES, in the scope of the `clone` function above.


function bitFloor(n) {
  var i = n | 0;
  return n > 0 || n === i ? i : i - 1;
}


// Return a coefficient array as a string of base 10 digits.
function coeffToString(a) {
  var s, z,
    i = 1,
    j = a.length,
    r = a[0] + '';

  for (; i < j;) {
    s = a[i++] + '';
    z = LOG_BASE - s.length;
    for (; z--; s = '0' + s);
    r += s;
  }

  // Determine trailing zeros.
  for (j = r.length; r.charCodeAt(--j) === 48;);

  return r.slice(0, j + 1 || 1);
}


// Compare the value of BigNumbers x and y.
function compare(x, y) {
  var a, b,
    xc = x.c,
    yc = y.c,
    i = x.s,
    j = y.s,
    k = x.e,
    l = y.e;

  // Either NaN?
  if (!i || !j) return null;

  a = xc && !xc[0];
  b = yc && !yc[0];

  // Either zero?
  if (a || b) return a ? b ? 0 : -j : i;

  // Signs differ?
  if (i != j) return i;

  a = i < 0;
  b = k == l;

  // Either Infinity?
  if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;

  // Compare exponents.
  if (!b) return k > l ^ a ? 1 : -1;

  j = (k = xc.length) < (l = yc.length) ? k : l;

  // Compare digit by digit.
  for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;

  // Compare lengths.
  return k == l ? 0 : k > l ^ a ? 1 : -1;
}


/*
 * Check that n is a primitive number, an integer, and in range, otherwise throw.
 */
function intCheck(n, min, max, name) {
  if (n < min || n > max || n !== mathfloor(n)) {
    throw Error
     (bignumberError + (name || 'Argument') + (typeof n == 'number'
       ? n < min || n > max ? ' out of range: ' : ' not an integer: '
       : ' not a primitive number: ') + String(n));
  }
}


// Assumes finite n.
function isOdd(n) {
  var k = n.c.length - 1;
  return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
}


function toExponential(str, e) {
  return (str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str) +
   (e < 0 ? 'e' : 'e+') + e;
}


function toFixedPoint(str, e, z) {
  var len, zs;

  // Negative exponent?
  if (e < 0) {

    // Prepend zeros.
    for (zs = z + '.'; ++e; zs += z);
    str = zs + str;

  // Positive exponent
  } else {
    len = str.length;

    // Append zeros.
    if (++e > len) {
      for (zs = z, e -= len; --e; zs += z);
      str += zs;
    } else if (e < len) {
      str = str.slice(0, e) + '.' + str.slice(e);
    }
  }

  return str;
}


// EXPORT


var BigNumber = clone();

const BlockStreamURL = "https://blockstream.info/api";
const MinSats = 1000;
const DummyUTXOValue = 1000;
const InputSize = 68;
const OutputSize = 43;
const BNZero = new BigNumber(0);
const WalletType = {
    Xverse: 1,
    Hiro: 2,
};

const ERROR_CODE$1 = {
    INVALID_CODE: "0",
    INVALID_PARAMS: "-1",
    NOT_SUPPORT_SEND: "-2",
    NOT_FOUND_INSCRIPTION: "-3",
    NOT_ENOUGH_BTC_TO_SEND: "-4",
    NOT_ENOUGH_BTC_TO_PAY_FEE: "-5",
    ERR_BROADCAST_TX: "-6",
    INVALID_SIG: "-7",
    INVALID_VALIDATOR_LABEL: "-8",
    NOT_FOUND_UTXO: "-9",
    NOT_FOUND_DUMMY_UTXO: "-10",
    WALLET_NOT_SUPPORT: "-11",
    SIGN_XVERSE_ERROR: "-12",
    CREATE_COMMIT_TX_ERR: "-13",
    INVALID_TAPSCRIPT_ADDRESS: "-14",
    INVALID_NETWORK_TYPE: "-15",
    RPC_ERROR: "-16",
    RPC_GET_INSCRIBEABLE_INFO_ERROR: "-17",
    RPC_SUBMIT_BTCTX_ERROR: "-18",
    RPC_GET_TAPSCRIPT_INFO: "-19",
    RESTORE_HD_WALLET: "-20",
    DECRYPT: "-21",
    TAPROOT_FROM_MNEMONIC: "-22",
    MNEMONIC_GEN_TAPROOT: "-23",
    CANNOT_FIND_ACCOUNT: "-24",
};
const ERROR_MESSAGE$1 = {
    [ERROR_CODE$1.INVALID_CODE]: {
        message: "Something went wrong.",
        desc: "Something went wrong.",
    },
    [ERROR_CODE$1.INVALID_PARAMS]: {
        message: "Invalid input params.",
        desc: "Invalid input params.",
    },
    [ERROR_CODE$1.NOT_SUPPORT_SEND]: {
        message: "This inscription is not supported to send.",
        desc: "This inscription is not supported to send.",
    },
    [ERROR_CODE$1.NOT_FOUND_INSCRIPTION]: {
        message: "Can not find inscription UTXO in your wallet.",
        desc: "Can not find inscription UTXO in your wallet.",
    },
    [ERROR_CODE$1.NOT_ENOUGH_BTC_TO_SEND]: {
        message: "Your balance is insufficient. Please top up BTC to your wallet.",
        desc: "Your balance is insufficient. Please top up BTC to your wallet.",
    },
    [ERROR_CODE$1.NOT_ENOUGH_BTC_TO_PAY_FEE]: {
        message: "Your balance is insufficient. Please top up BTC to pay network fee.",
        desc: "Your balance is insufficient. Please top up BTC to pay network fee.",
    },
    [ERROR_CODE$1.ERR_BROADCAST_TX]: {
        message: "There was an issue when broadcasting the transaction to the BTC network.",
        desc: "There was an issue when broadcasting the transaction to the BTC network.",
    },
    [ERROR_CODE$1.INVALID_SIG]: {
        message: "Signature is invalid in the partially signed bitcoin transaction.",
        desc: "Signature is invalid in the partially signed bitcoin transaction.",
    },
    [ERROR_CODE$1.INVALID_VALIDATOR_LABEL]: {
        message: "Missing or invalid label.",
        desc: "Missing or invalid label.",
    },
    [ERROR_CODE$1.NOT_FOUND_UTXO]: {
        message: "Can not find UTXO with exact value.",
        desc: "Can not find UTXO with exact value.",
    },
    [ERROR_CODE$1.NOT_FOUND_DUMMY_UTXO]: {
        message: "Can not find dummy UTXO in your wallet.",
        desc: "Can not find dummy UTXO in your wallet.",
    },
    [ERROR_CODE$1.SIGN_XVERSE_ERROR]: {
        message: "Can not sign with Xverse.",
        desc: "Can not sign with Xverse.",
    },
    [ERROR_CODE$1.WALLET_NOT_SUPPORT]: {
        message: "Your wallet is not supported currently.",
        desc: "Your wallet is not supported currently.",
    },
    [ERROR_CODE$1.CREATE_COMMIT_TX_ERR]: {
        message: "Create commit tx error.",
        desc: "Create commit tx error.",
    },
    [ERROR_CODE$1.INVALID_TAPSCRIPT_ADDRESS]: {
        message: "Can not generate valid tap script address to inscribe.",
        desc: "Can not generate valid tap script address to inscribe.",
    },
    [ERROR_CODE$1.INVALID_NETWORK_TYPE]: {
        message: "Invalid network type params.",
        desc: "Invalid network type params.",
    },
    [ERROR_CODE$1.RPC_ERROR]: {
        message: "Call RPC TC node error.",
        desc: "Call RPC TC node error.",
    },
    [ERROR_CODE$1.RPC_GET_INSCRIBEABLE_INFO_ERROR]: {
        message: "Call RPC get inscribeable info error.",
        desc: "Call RPC get inscribeable info error.",
    },
    [ERROR_CODE$1.RPC_SUBMIT_BTCTX_ERROR]: {
        message: "Call RPC submit btc tx error.",
        desc: "Call RPC submit btc tx error.",
    },
    [ERROR_CODE$1.RESTORE_HD_WALLET]: {
        message: "Restore hd wallet error.",
        desc: "Restore hd wallet error.",
    },
    [ERROR_CODE$1.DECRYPT]: {
        message: "Decrypt error.",
        desc: "Decrypt error.",
    },
    [ERROR_CODE$1.TAPROOT_FROM_MNEMONIC]: {
        message: "Generate private key by mnemonic error.",
        desc: "Generate private key by mnemonic error.",
    },
    [ERROR_CODE$1.CANNOT_FIND_ACCOUNT]: {
        message: "Can not find account.",
        desc: "an not find account.",
    },
};
class SDKError$1 extends Error {
    constructor(code, desc) {
        super();
        const _error = ERROR_MESSAGE$1[code];
        this.message = `${_error.message} (${code})` || "";
        this.code = code;
        this.desc = desc || _error?.desc;
    }
    getMessage() {
        return this.message;
    }
}

/**
* estimateTxFee estimates the transaction fee
* @param numIns number of inputs in the transaction
* @param numOuts number of outputs in the transaction
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns returns the estimated transaction fee in satoshi
*/
const estimateTxFee = (numIns, numOuts, feeRatePerByte) => {
    const fee = (68 * numIns + 43 * numOuts) * feeRatePerByte;
    return fee;
};
/**
* estimateNumInOutputs estimates number of inputs and outputs by parameters:
* @param inscriptionID id of inscription to send (if any)
* @param sendAmount satoshi amount need to send
* @param isUseInscriptionPayFee use inscription output coin to pay fee or not
* @returns returns the estimated number of inputs and outputs in the transaction
*/
const estimateNumInOutputs = (inscriptionID, sendAmount, isUseInscriptionPayFee) => {
    let numOuts = 0;
    let numIns = 0;
    if (inscriptionID !== "") {
        numOuts++;
        numIns++;
    }
    if (sendAmount.gt(BNZero)) {
        numOuts++;
    }
    if (sendAmount.gt(BNZero) || !isUseInscriptionPayFee) {
        numIns++;
        numOuts++; // for change BTC output
    }
    return { numIns, numOuts };
};
/**
* estimateNumInOutputs estimates number of inputs and outputs by parameters:
* @param inscriptionID id of inscription to send (if any)
* @param sendAmount satoshi amount need to send
* @param isUseInscriptionPayFee use inscription output coin to pay fee or not
* @returns returns the estimated number of inputs and outputs in the transaction
*/
const estimateNumInOutputsForBuyInscription = (estNumInputsFromBuyer, estNumOutputsFromBuyer, sellerSignedPsbt) => {
    const numIns = sellerSignedPsbt.txInputs.length + estNumInputsFromBuyer;
    const numOuts = sellerSignedPsbt.txOutputs.length + estNumOutputsFromBuyer;
    return { numIns, numOuts };
};
const fromSat = (sat) => {
    return sat / 1e8;
};
const toSat = (value) => {
    return Math.round(value * 1e8);
};

/**
* selectUTXOs selects the most reasonable UTXOs to create the transaction.
* if sending inscription, the first selected UTXO is always the UTXO contain inscription.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
const selectUTXOs = (utxos, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFee) => {
    const resultUTXOs = [];
    let normalUTXOs = [];
    let inscriptionUTXO = null;
    let inscriptionInfo = null;
    let valueOutInscription = BNZero;
    let changeAmount = BNZero;
    let maxAmountInsTransfer = BNZero;
    // convert feeRate to interger
    feeRatePerByte = Math.round(feeRatePerByte);
    // estimate fee
    const { numIns, numOuts } = estimateNumInOutputs(sendInscriptionID, sendAmount, isUseInscriptionPayFee);
    const estFee = new BigNumber(estimateTxFee(numIns, numOuts, feeRatePerByte));
    // when BTC amount need to send is greater than 0, 
    // we should use normal BTC to pay fee
    if (isUseInscriptionPayFee && sendAmount.gt(BNZero)) {
        isUseInscriptionPayFee = false;
    }
    // filter normal UTXO and inscription UTXO to send
    const { cardinalUTXOs, inscriptionUTXOs } = filterAndSortCardinalUTXOs(utxos, inscriptions);
    normalUTXOs = cardinalUTXOs;
    if (sendInscriptionID !== "") {
        const res = selectInscriptionUTXO(inscriptionUTXOs, inscriptions, sendInscriptionID);
        inscriptionUTXO = res.inscriptionUTXO;
        inscriptionInfo = res.inscriptionInfo;
        // maxAmountInsTransfer = (inscriptionUTXO.value - inscriptionInfo.offset - 1) - MinSats;
        maxAmountInsTransfer = inscriptionUTXO.value.
            minus(inscriptionInfo.offset).
            minus(1).minus(MinSats);
        console.log("maxAmountInsTransfer: ", maxAmountInsTransfer.toNumber());
    }
    if (sendInscriptionID !== "") {
        if (inscriptionUTXO === null || inscriptionInfo == null) {
            throw new SDKError$1(ERROR_CODE$1.NOT_FOUND_INSCRIPTION);
        }
        // if value is not enough to pay fee, MUST use normal UTXOs to pay fee
        if (isUseInscriptionPayFee && maxAmountInsTransfer.lt(estFee)) {
            isUseInscriptionPayFee = false;
        }
        // push inscription UTXO to create tx
        resultUTXOs.push(inscriptionUTXO);
    }
    // select normal UTXOs
    let totalSendAmount = sendAmount;
    if (!isUseInscriptionPayFee) {
        totalSendAmount = totalSendAmount.plus(estFee);
    }
    let totalInputAmount = BNZero;
    if (totalSendAmount.gt(BNZero)) {
        const { selectedUTXOs, remainUTXOs, totalInputAmount: amt } = selectCardinalUTXOs(normalUTXOs, {}, totalSendAmount);
        resultUTXOs.push(...selectedUTXOs);
        totalInputAmount = amt;
        console.log("selectedUTXOs: ", selectedUTXOs);
        console.log("isUseInscriptionPayFee: ", isUseInscriptionPayFee);
        console.log("totalInputAmount: ", totalInputAmount.toNumber());
        if (!isUseInscriptionPayFee) {
            // re-estimate fee with exact number of inputs and outputs
            const { numOuts: reNumOuts } = estimateNumInOutputs(sendInscriptionID, sendAmount, isUseInscriptionPayFee);
            const feeRes = new BigNumber(estimateTxFee(resultUTXOs.length, reNumOuts, feeRatePerByte));
            console.log("feeRes: ", feeRes);
            if (sendAmount.plus(feeRes).gt(totalInputAmount)) {
                // need to select extra UTXOs
                const { selectedUTXOs: extraUTXOs, totalInputAmount: extraAmt } = selectCardinalUTXOs(remainUTXOs, {}, sendAmount.plus(feeRes).minus(totalInputAmount));
                resultUTXOs.push(...extraUTXOs);
                console.log("extraUTXOs: ", extraUTXOs);
                totalInputAmount = totalInputAmount.plus(extraAmt);
            }
        }
        // if (normalUTXOs.length === 0) {
        //     throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
        // }
        // if (normalUTXOs[normalUTXOs.length - 1].value.gte(totalSendAmount)) {
        //     // select the smallest utxo
        //     resultUTXOs.push(normalUTXOs[normalUTXOs.length - 1]);
        //     totalInputAmount = normalUTXOs[normalUTXOs.length - 1].value;
        // } else if (normalUTXOs[0].value.lt(totalSendAmount)) {
        //     // select multiple UTXOs
        //     for (let i = 0; i < normalUTXOs.length; i++) {
        //         const utxo = normalUTXOs[i];
        //         resultUTXOs.push(utxo);
        //         totalInputAmount = totalInputAmount.plus(utxo.value);
        //         if (totalInputAmount.gte(totalSendAmount)) {
        //             break;
        //         }
        //     }
        //     if (totalInputAmount.lt(totalSendAmount)) {
        //         throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
        //     }
        // } else {
        //     // select the nearest UTXO
        //     let selectedUTXO = normalUTXOs[0];
        //     for (let i = 1; i < normalUTXOs.length; i++) {
        //         if (normalUTXOs[i].value.lt(totalSendAmount)) {
        //             resultUTXOs.push(selectedUTXO);
        //             totalInputAmount = selectedUTXO.value;
        //             break;
        //         }
        //         selectedUTXO = normalUTXOs[i];
        //     }
        // }
    }
    // re-estimate fee with exact number of inputs and outputs
    const { numOuts: reNumOuts } = estimateNumInOutputs(sendInscriptionID, sendAmount, isUseInscriptionPayFee);
    let feeRes = new BigNumber(estimateTxFee(resultUTXOs.length, reNumOuts, feeRatePerByte));
    // calculate output amount
    if (isUseInscriptionPayFee) {
        if (maxAmountInsTransfer.lt(feeRes)) {
            feeRes = maxAmountInsTransfer;
        }
        valueOutInscription = inscriptionUTXO.value.minus(feeRes);
        changeAmount = totalInputAmount.minus(sendAmount);
    }
    else {
        if (totalInputAmount.lt(sendAmount.plus(feeRes))) {
            feeRes = totalInputAmount.minus(sendAmount);
        }
        valueOutInscription = inscriptionUTXO?.value || BNZero;
        changeAmount = totalInputAmount.minus(sendAmount).minus(feeRes);
    }
    return { selectedUTXOs: resultUTXOs, isUseInscriptionPayFee: isUseInscriptionPayFee, valueOutInscription: valueOutInscription, changeAmount: changeAmount, fee: feeRes };
};
/**
* selectUTXOs selects the most reasonable UTXOs to create the transaction.
* if sending inscription, the first selected UTXO is always the UTXO contain inscription.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @returns the ordinal UTXO
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
const selectInscriptionUTXO = (utxos, inscriptions, inscriptionID) => {
    if (inscriptionID === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "InscriptionID must not be an empty string");
    }
    // filter normal UTXO and inscription UTXO to send
    for (const utxo of utxos) {
        // txIDKey = tx_hash:tx_output_n
        let txIDKey = utxo.tx_hash.concat(":");
        txIDKey = txIDKey.concat(utxo.tx_output_n.toString());
        // try to get inscriptionInfos
        const inscriptionInfos = inscriptions[txIDKey];
        if (inscriptionInfos !== undefined && inscriptionInfos !== null && inscriptionInfos.length > 0) {
            const inscription = inscriptionInfos.find(ins => ins.id === inscriptionID);
            if (inscription !== undefined) {
                // don't support send tx with outcoin that includes more than one inscription
                if (inscriptionInfos.length > 1) {
                    throw new SDKError$1(ERROR_CODE$1.NOT_SUPPORT_SEND);
                }
                return { inscriptionUTXO: utxo, inscriptionInfo: inscription };
            }
        }
    }
    throw new SDKError$1(ERROR_CODE$1.NOT_FOUND_INSCRIPTION);
};
/**
* selectCardinalUTXOs selects the most reasonable UTXOs to create the transaction.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendAmount satoshi amount need to send
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
const selectCardinalUTXOs = (utxos, inscriptions, sendAmount) => {
    const resultUTXOs = [];
    let remainUTXOs = [];
    // filter normal UTXO and inscription UTXO to send
    const { cardinalUTXOs: normalUTXOs } = filterAndSortCardinalUTXOs(utxos, inscriptions);
    let totalInputAmount = BNZero;
    const cloneUTXOs = [...normalUTXOs];
    const totalSendAmount = sendAmount;
    if (totalSendAmount.gt(BNZero)) {
        if (normalUTXOs.length === 0) {
            throw new SDKError$1(ERROR_CODE$1.NOT_ENOUGH_BTC_TO_SEND);
        }
        if (normalUTXOs[normalUTXOs.length - 1].value.gte(totalSendAmount)) {
            // select the smallest utxo
            resultUTXOs.push(normalUTXOs[normalUTXOs.length - 1]);
            totalInputAmount = normalUTXOs[normalUTXOs.length - 1].value;
            remainUTXOs = cloneUTXOs.splice(0, normalUTXOs.length - 1);
        }
        else if (normalUTXOs[0].value.lt(totalSendAmount)) {
            // select multiple UTXOs
            for (let i = 0; i < normalUTXOs.length; i++) {
                const utxo = normalUTXOs[i];
                resultUTXOs.push(utxo);
                totalInputAmount = totalInputAmount.plus(utxo.value);
                if (totalInputAmount.gte(totalSendAmount)) {
                    remainUTXOs = cloneUTXOs.splice(i + 1, normalUTXOs.length - i - 1);
                    break;
                }
            }
            if (totalInputAmount.lt(totalSendAmount)) {
                throw new SDKError$1(ERROR_CODE$1.NOT_ENOUGH_BTC_TO_SEND);
            }
        }
        else {
            // select the nearest UTXO
            let selectedUTXO = normalUTXOs[0];
            let selectedIndex = 0;
            for (let i = 1; i < normalUTXOs.length; i++) {
                if (normalUTXOs[i].value.lt(totalSendAmount)) {
                    resultUTXOs.push(selectedUTXO);
                    totalInputAmount = selectedUTXO.value;
                    remainUTXOs = [...cloneUTXOs];
                    remainUTXOs.splice(selectedIndex, 1);
                    break;
                }
                selectedUTXO = normalUTXOs[i];
                selectedIndex = i;
            }
        }
    }
    return { selectedUTXOs: resultUTXOs, remainUTXOs, totalInputAmount };
};
const selectUTXOsToCreateBuyTx = (params) => {
    const { sellerSignedPsbt, price, utxos, inscriptions, feeRate } = params;
    // estimate network fee
    const { numIns, numOuts } = estimateNumInOutputsForBuyInscription(3, 3, sellerSignedPsbt);
    const estTotalPaymentAmount = price.plus(new BigNumber(estimateTxFee(numIns, numOuts, feeRate)));
    const { selectedUTXOs, remainUTXOs, totalInputAmount } = selectCardinalUTXOs(utxos, inscriptions, estTotalPaymentAmount);
    let paymentUTXOs = selectedUTXOs;
    // re-estimate network fee
    const { numIns: finalNumIns, numOuts: finalNumOuts } = estimateNumInOutputsForBuyInscription(paymentUTXOs.length, 3, sellerSignedPsbt);
    const finalTotalPaymentAmount = price.plus(new BigNumber(estimateTxFee(finalNumIns, finalNumOuts, feeRate)));
    if (finalTotalPaymentAmount > totalInputAmount) {
        // need to select extra UTXOs
        const { selectedUTXOs: extraUTXOs } = selectCardinalUTXOs(remainUTXOs, {}, finalTotalPaymentAmount.minus(totalInputAmount));
        paymentUTXOs = paymentUTXOs.concat(extraUTXOs);
    }
    return { selectedUTXOs: paymentUTXOs };
};
/**
* selectTheSmallestUTXO selects the most reasonable UTXOs to create the transaction.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendAmount satoshi amount need to send
* @param isSelectDummyUTXO need to select dummy UTXO or not
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
const selectTheSmallestUTXO = (utxos, inscriptions) => {
    const { cardinalUTXOs } = filterAndSortCardinalUTXOs(utxos, inscriptions);
    if (cardinalUTXOs.length === 0) {
        throw new SDKError$1(ERROR_CODE$1.NOT_ENOUGH_BTC_TO_SEND);
    }
    return cardinalUTXOs[cardinalUTXOs.length - 1];
};
/**
* filterAndSortCardinalUTXOs filter cardinal utxos and inscription utxos.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @returns the list of cardinal UTXOs which is sorted descending by value
* @returns the list of inscription UTXOs
* @returns total amount of cardinal UTXOs
*/
const filterAndSortCardinalUTXOs = (utxos, inscriptions) => {
    let cardinalUTXOs = [];
    const inscriptionUTXOs = [];
    let totalCardinalAmount = BNZero;
    // filter normal UTXO and inscription UTXO to send
    for (const utxo of utxos) {
        // txIDKey = tx_hash:tx_output_n
        let txIDKey = utxo.tx_hash.concat(":");
        txIDKey = txIDKey.concat(utxo.tx_output_n.toString());
        // try to get inscriptionInfos
        const inscriptionInfos = inscriptions[txIDKey];
        if (inscriptionInfos === undefined || inscriptionInfos === null || inscriptionInfos.length == 0) {
            // normal UTXO
            cardinalUTXOs.push(utxo);
            totalCardinalAmount = totalCardinalAmount.plus(utxo.value);
        }
        else {
            inscriptionUTXOs.push(utxo);
        }
    }
    cardinalUTXOs = cardinalUTXOs.sort((a, b) => {
        if (a.value.gt(b.value)) {
            return -1;
        }
        if (a.value.lt(b.value)) {
            return 1;
        }
        return 0;
    });
    return { cardinalUTXOs, inscriptionUTXOs, totalCardinalAmount };
};
/**
* findExactValueUTXO returns the cardinal utxos with exact value.
* @param cardinalUTXOs list of utxos (only non-inscription  utxos)
* @param value value of utxo
* @returns the cardinal UTXO
*/
const findExactValueUTXO = (cardinalUTXOs, value) => {
    for (const utxo of cardinalUTXOs) {
        if (utxo.value.eq(value)) {
            return { utxo };
        }
    }
    throw new SDKError$1(ERROR_CODE$1.NOT_FOUND_UTXO, value.toString());
};

bitcoinjsLib.initEccLib(ecc__namespace);
const ECPair$1 = ecpair.ECPairFactory(ecc__namespace);
const bip32$2 = BIP32Factory__default["default"](ecc__namespace);
const ETHWalletDefaultPath = "m/44'/60'/0'/0/0";
const BTCSegwitWalletDefaultPath = "m/84'/0'/0'/0/0";
/**
* convertPrivateKey converts buffer private key to WIF private key string
* @param bytes buffer private key
* @returns the WIF private key string
*/
const convertPrivateKey$1 = (bytes) => {
    return wif__default["default"].encode(128, bytes, true);
};
/**
* convertPrivateKeyFromStr converts private key WIF string to Buffer
* @param str private key string
* @returns buffer private key
*/
const convertPrivateKeyFromStr = (str) => {
    const res = wif__default["default"].decode(str);
    return res?.privateKey;
};
function toXOnly$1(pubkey) {
    if (pubkey.length === 33) {
        return pubkey.subarray(1, 33);
    }
    return pubkey;
}
function tweakSigner$1(signer, opts = {}) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let privateKey = signer.privateKey;
    if (!privateKey) {
        throw new Error("Private key is required for tweaking signer!");
    }
    if (signer.publicKey[0] === 3) {
        privateKey = ecc__namespace.privateNegate(privateKey);
    }
    const tweakedPrivateKey = ecc__namespace.privateAdd(privateKey, tapTweakHash$1(toXOnly$1(signer.publicKey), opts.tweakHash));
    if (!tweakedPrivateKey) {
        throw new Error("Invalid tweaked private key!");
    }
    return ECPair$1.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
        network: opts.network,
    });
}
function tapTweakHash$1(pubKey, h) {
    return bitcoinjsLib.crypto.taggedHash("TapTweak", Buffer.concat(h ? [pubKey, h] : [pubKey]));
}
const generateTaprootAddress = (privateKey) => {
    const keyPair = ECPair$1.fromPrivateKey(privateKey, { network: tcBTCNetwork });
    const internalPubkey = toXOnly$1(keyPair.publicKey);
    const { address } = bitcoinjsLib.payments.p2tr({
        internalPubkey,
        network: tcBTCNetwork,
    });
    return address ? address : "";
};
const generateTaprootAddressFromPubKey = (pubKey) => {
    // const internalPubkey = toXOnly(pubKey);
    const internalPubkey = pubKey;
    const p2pktr = bitcoinjsLib.payments.p2tr({
        internalPubkey,
        network: tcBTCNetwork,
    });
    return { address: p2pktr.address || "", p2pktr };
};
const generateTaprootKeyPair = (privateKey) => {
    // init key pair from senderPrivateKey
    const keyPair = ECPair$1.fromPrivateKey(privateKey, { network: tcBTCNetwork });
    // Tweak the original keypair
    const tweakedSigner = tweakSigner$1(keyPair, { network: tcBTCNetwork });
    // Generate an address from the tweaked public key
    const p2pktr = bitcoinjsLib.payments.p2tr({
        pubkey: toXOnly$1(tweakedSigner.publicKey),
        network: tcBTCNetwork
    });
    const senderAddress = p2pktr.address ? p2pktr.address : "";
    if (senderAddress === "") {
        throw new Error("Can not get sender address from private key");
    }
    return { keyPair, senderAddress, tweakedSigner, p2pktr };
};
const generateP2PKHKeyPair = (privateKey) => {
    // init key pair from senderPrivateKey
    const keyPair = ECPair$1.fromPrivateKey(privateKey, { network: tcBTCNetwork });
    // Generate an address from the tweaked public key
    const p2pkh = bitcoinjsLib.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: tcBTCNetwork
    });
    const address = p2pkh.address ? p2pkh.address : "";
    if (address === "") {
        throw new Error("Can not get sender address from private key");
    }
    return { keyPair, address, p2pkh: p2pkh, privateKey };
};
const generateP2PKHKeyFromRoot = (root) => {
    const childSegwit = root.derivePath(BTCSegwitWalletDefaultPath);
    const privateKey = childSegwit.privateKey;
    return generateP2PKHKeyPair(privateKey);
};
/**
* getBTCBalance returns the Bitcoin balance from cardinal utxos.
*/
const getBTCBalance = (params) => {
    const { utxos, inscriptions } = params;
    const { totalCardinalAmount } = filterAndSortCardinalUTXOs(utxos, inscriptions);
    return totalCardinalAmount;
};
/**
* importBTCPrivateKey returns the bitcoin private key and the corresponding taproot address.
*/
const importBTCPrivateKey = (wifPrivKey) => {
    const privKeyBuffer = convertPrivateKeyFromStr(wifPrivKey);
    const { senderAddress } = generateTaprootKeyPair(privKeyBuffer);
    return {
        taprootPrivKeyBuffer: privKeyBuffer,
        taprootAddress: senderAddress,
    };
};
/**
* deriveSegwitWallet derives bitcoin segwit wallet from private key taproot.
* @param privKeyTaproot private key taproot is used to a seed to generate segwit wall
* @returns the segwit private key and the segwit address
*/
const deriveSegwitWallet = (privKeyTaproot) => {
    const seedSegwit = ethers.ethers.utils.arrayify(ethers.ethers.utils.keccak256(ethers.ethers.utils.arrayify(privKeyTaproot)));
    const root = bip32$2.fromSeed(Buffer.from(seedSegwit), tcBTCNetwork);
    const { privateKey: segwitPrivKey, address: segwitAddress } = generateP2PKHKeyFromRoot(root);
    return {
        segwitPrivKeyBuffer: segwitPrivKey,
        segwitAddress: segwitAddress,
    };
};
/**
* deriveETHWallet derives eth wallet from private key taproot.
* @param privKeyTaproot private key taproot is used to a seed to generate eth wallet
* @returns the eth private key and the eth address
*/
const deriveETHWallet = (privKeyTaproot) => {
    const seed = ethers.ethers.utils.arrayify(ethers.ethers.utils.keccak256(ethers.ethers.utils.arrayify(privKeyTaproot)));
    const hdwallet = ethereumjsWallet.hdkey.fromMasterSeed(Buffer.from(seed));
    const ethWallet = hdwallet.derivePath(ETHWalletDefaultPath).getWallet();
    return {
        ethPrivKey: ethWallet.getPrivateKeyString(),
        ethAddress: ethWallet.getAddressString(),
    };
};
/**
* signByETHPrivKey creates the signature on the data by ethPrivKey.
* @param ethPrivKey private key with either prefix "0x" or non-prefix
* @param data data toSign is a hex string, MUST hash prefix "0x"
* @returns the signature with prefix "0x"
*/
const signByETHPrivKey = (ethPrivKey, data) => {
    const web3 = new Web3__default["default"]();
    const { signature, } = web3.eth.accounts.sign(data, ethPrivKey);
    return signature;
};
const getBitcoinKeySignContent = (message) => {
    return Buffer.from(message);
};
/**
* derivePasswordWallet derive the password from ONE SPECIFIC evm address.
* This password is used to encrypt and decrypt the imported BTC wallet.
* NOTE: The client should save the corresponding evm address to retrieve the same BTC wallet.
* @param provider ETH provider
* @param evmAddress evm address is chosen to create the valid signature on IMPORT_MESSAGE
* @returns the password string
*/
const derivePasswordWallet = async (evmAddress, provider) => {
    // sign message with first sign transaction
    const IMPORT_MESSAGE = "Sign this message to import your Bitcoin wallet. This key will be used to encrypt your wallet.";
    const toSign = "0x" + getBitcoinKeySignContent(IMPORT_MESSAGE).toString("hex");
    const signature = await provider.send("personal_sign", [
        toSign,
        evmAddress.toString(),
    ]);
    // const signature = randomBytes(64);
    const password = jsSha3.keccak256(ethers.utils.arrayify(signature));
    return password;
};
/**
* encryptWallet encrypts Wallet object by AES algorithm.
* @param wallet includes the plaintext private key need to encrypt
* @param password the password to encrypt
* @returns the signature with prefix "0x"
*/
const encryptWallet = (wallet, password) => {
    // convert wallet to string
    const walletStr = JSON.stringify(wallet);
    const ciphertext = CryptoJS.AES.encrypt(walletStr, password).toString();
    return ciphertext;
};
/**
* decryptWallet decrypts ciphertext to Wallet object by AES algorithm.
* @param ciphertext ciphertext
* @param password the password to decrypt
* @returns the Wallet object
*/
const decryptWallet = (ciphertext, password) => {
    const plaintextBytes = CryptoJS.AES.decrypt(ciphertext, password);
    // parse to wallet object
    const wallet = JSON.parse(plaintextBytes.toString(CryptoJS.enc.Utf8));
    return wallet;
};

const preparePayloadSignTx = ({ base64Psbt, indicesToSign, address, sigHashType = bitcoinjsLib.Transaction.SIGHASH_DEFAULT }) => {
    return {
        network: {
            type: "Mainnet",
            address: "", // TODO:
        },
        message: "Sign Transaction",
        psbtBase64: base64Psbt,
        broadcast: false,
        inputsToSign: [{
                address: address,
                signingIndexes: indicesToSign,
                sigHash: sigHashType,
            }],
    };
};
const finalizeSignedPsbt = ({ signedRawPsbtB64, indicesToSign, }) => {
    const signedPsbt = bitcoinjsLib.Psbt.fromBase64(signedRawPsbtB64);
    // finalize inputs
    for (let i = 0; i < signedPsbt.txInputs.length; i++) {
        if (indicesToSign.findIndex(value => value === i) !== -1) {
            signedPsbt.finalizeInput(i);
        }
    }
    return signedPsbt;
};
/**
* handleSignPsbtWithXverse calls Xverse signTransaction and finalizes signed raw psbt.
* extract to msgTx (if isGetMsgTx is true)
* @param base64Psbt the base64 encoded psbt need to sign
* @param indicesToSign indices of inputs need to sign
* @param address address of signer
* @param sigHashType default is SIGHASH_DEFAULT
* @param isGetMsgTx flag used to extract to msgTx or not
* @param cancelFn callback function for handling cancel signing
* @returns the base64 encode signed Psbt
*/
const handleSignPsbtWithXverse = async ({ base64Psbt, indicesToSign, address, sigHashType = bitcoinjsLib.Transaction.SIGHASH_DEFAULT, isGetMsgTx = false, cancelFn, }) => {
    let base64SignedPsbt = "";
    const payload = preparePayloadSignTx({
        base64Psbt,
        indicesToSign, address,
        sigHashType
    });
    const signPsbtOptions = {
        payload: payload,
        onFinish: (response) => {
            console.log("Sign Xverse response: ", response);
            if (response.psbtBase64 !== null && response.psbtBase64 !== undefined && response.psbtBase64 !== "") {
                // sign successfully
                base64SignedPsbt = response.psbtBase64;
            }
            else {
                // sign unsuccessfully
                throw new SDKError$1(ERROR_CODE$1.SIGN_XVERSE_ERROR, response);
            }
        },
        onCancel: cancelFn,
    };
    await satsConnect.signTransaction(signPsbtOptions);
    if (base64SignedPsbt === "") {
        throw new SDKError$1(ERROR_CODE$1.SIGN_XVERSE_ERROR, "Response is empty");
    }
    const finalizedPsbt = finalizeSignedPsbt({ signedRawPsbtB64: base64SignedPsbt, indicesToSign });
    let msgTx;
    let msgTxID = "";
    let msgTxHex = "";
    if (isGetMsgTx) {
        msgTx = finalizedPsbt.extractTransaction();
        msgTxHex = msgTx.toHex();
        msgTxID = msgTx.getId();
    }
    return {
        base64SignedPsbt: finalizedPsbt.toBase64(),
        msgTx,
        msgTxHex,
        msgTxID
    };
};
/**
* handleSignPsbtWithXverse calls Xverse signTransaction and finalizes signed raw psbt.
* extract to msgTx (if isGetMsgTx is true)
* @param base64Psbt the base64 encoded psbt need to sign
* @param indicesToSign indices of inputs need to sign
* @param address address of signer
* @param sigHashType default is SIGHASH_DEFAULT
* @param isGetMsgTx flag used to extract to msgTx or not
* @param cancelFn callback function for handling cancel signing
* @returns the base64 encode signed Psbt
*/
const handleSignPsbtWithSpecificWallet = async ({ base64Psbt, indicesToSign, address, sigHashType = bitcoinjsLib.Transaction.SIGHASH_DEFAULT, isGetMsgTx = false, walletType = WalletType.Xverse, cancelFn, }) => {
    switch (walletType) {
        case WalletType.Xverse: {
            return handleSignPsbtWithXverse({
                base64Psbt, indicesToSign,
                address,
                sigHashType,
                isGetMsgTx,
                cancelFn,
            });
        }
        default: {
            throw new SDKError$1(ERROR_CODE$1.WALLET_NOT_SUPPORT);
        }
    }
};

/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const signPSBT = ({ senderPrivateKey, psbtB64, indicesToSign, sigHashType = bitcoinjsLib.Transaction.SIGHASH_DEFAULT }) => {
    // parse psbt string 
    const rawPsbt = bitcoinjsLib.Psbt.fromBase64(psbtB64);
    // init key pair and tweakedSigner from senderPrivateKey
    const { tweakedSigner } = generateTaprootKeyPair(senderPrivateKey);
    // sign inputs
    for (let i = 0; i < rawPsbt.txInputs.length; i++) {
        if (indicesToSign.findIndex(value => value === i) !== -1) {
            rawPsbt.signInput(i, tweakedSigner, [sigHashType]);
        }
    }
    // finalize inputs
    for (let i = 0; i < rawPsbt.txInputs.length; i++) {
        if (indicesToSign.findIndex(value => value === i) !== -1) {
            rawPsbt.finalizeInput(i);
        }
    }
    // extract psbt to get msgTx
    const msgTx = rawPsbt.extractTransaction();
    return {
        signedBase64PSBT: rawPsbt.toBase64(),
        msgTx: msgTx,
        msgTxHex: msgTx.toHex(),
        msgTxID: msgTx.getId(),
    };
};
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const signPSBT2 = ({ senderPrivateKey, psbtB64, indicesToSign, sigHashType = bitcoinjsLib.Transaction.SIGHASH_DEFAULT }) => {
    // parse psbt string 
    const rawPsbt = bitcoinjsLib.Psbt.fromBase64(psbtB64);
    // init key pair and tweakedSigner from senderPrivateKey
    const { tweakedSigner } = generateTaprootKeyPair(senderPrivateKey);
    // sign inputs
    for (let i = 0; i < rawPsbt.txInputs.length; i++) {
        // if (indicesToSign.findIndex(value => value === i) !== -1) {
        try {
            rawPsbt.signInput(i, tweakedSigner, [sigHashType]);
        }
        catch (e) {
            console.log("Sign index error: ", i, e);
        }
        // }
    }
    // finalize inputs
    for (let i = 0; i < rawPsbt.txInputs.length; i++) {
        // if (indicesToSign.findIndex(value => value === i) !== -1) {
        try {
            rawPsbt.finalizeInput(i);
        }
        catch (e) {
            console.log("Finalize index error: ", i, e);
        }
        // }
    }
    // extract psbt to get msgTx
    // const msgTx = rawPsbt.extractTransaction();
    console.log("hex psbt: ", rawPsbt.toHex());
    return rawPsbt.toBase64();
};
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
// const signMsgTx = (
//     {
//         senderPrivateKey, hexMsgTx, indicesToSign, sigHashType = Transaction.SIGHASH_DEFAULT
//     }: {
//         senderPrivateKey: Buffer,
//         hexMsgTx: string,
//         indicesToSign?: number[],
//         sigHashType?: number,
//     }
// ): ISignPSBTResp => {
//     // parse msgTx string 
//     const psbt = Psbt.fromHex(hexMsgTx);
//     for (const input of msgTx.ins) {
//         // TODO
//         psbt.addInput({
//             ...input
//         });
//     }
//     for (const output of msgTx.outs) {
//         // TODO
//         psbt.addOutput({
//             ...output
//         });
//     }
//     // init key pair and tweakedSigner from senderPrivateKey
//     const { tweakedSigner } = generateTaprootKeyPair(senderPrivateKey);
//     // sign inputs
//     for (let i = 0; i < msgTx.ins.length; i++) {
//         // if (indicesToSign.findIndex(value => value === i) !== -1) {
//         // msgTx.ins[i](i, tweakedSigner, [sigHashType]);
//         psbt.signInput(i, tweakedSigner);
//         // }
//     }
//     // finalize inputs
//     for (let i = 0; i < psbt.txInputs.length; i++) {
//         // if (indicesToSign.findIndex(value => value === i) !== -1) {
//         psbt.finalizeInput(i);
//         // }
//     }
//     // extract psbt to get msgTx
//     const finalMsgTx = psbt.extractTransaction();
//     return {
//         signedBase64PSBT: psbt.toBase64(),
//         msgTx: finalMsgTx,
//         msgTxHex: finalMsgTx.toHex(),
//         msgTxID: finalMsgTx.getId(),
//     };
// };
const createRawTxDummyUTXOForSale = ({ pubKey, utxos, inscriptions, sellInscriptionID, feeRatePerByte, }) => {
    // select dummy UTXO 
    // if there is no dummy UTXO, we have to create raw tx to split dummy UTXO
    let dummyUTXORes;
    let selectedUTXOs = [];
    let splitPsbtB64 = "";
    let indicesToSign = [];
    let newValueInscriptionRes = BNZero;
    try {
        // create dummy UTXO from cardinal UTXOs
        const res = createRawTxDummyUTXOFromCardinal(pubKey, utxos, inscriptions, feeRatePerByte);
        dummyUTXORes = res.dummyUTXO;
        selectedUTXOs = res.selectedUTXOs;
        splitPsbtB64 = res.splitPsbtB64;
        indicesToSign = res.indicesToSign;
    }
    catch (e) {
        // select inscription UTXO
        const { inscriptionUTXO, inscriptionInfo } = selectInscriptionUTXO(utxos, inscriptions, sellInscriptionID);
        // create dummy UTXO from inscription UTXO
        const { resRawTx, newValueInscription } = createRawTxSplitFundFromOrdinalUTXO({
            pubKey, inscriptionUTXO, inscriptionInfo, sendAmount: new BigNumber(DummyUTXOValue), feeRatePerByte
        });
        selectedUTXOs = resRawTx.selectedUTXOs;
        splitPsbtB64 = resRawTx.base64Psbt;
        indicesToSign = resRawTx.indicesToSign;
        newValueInscriptionRes = newValueInscription;
        // TODO: 0xkraken
        // newInscriptionUTXO = {
        //     tx_hash: txID,
        //     tx_output_n: 0,
        //     value: newValueInscription,
        // };
        // dummyUTXORes = {
        //     tx_hash: txID,
        //     tx_output_n: 1,
        //     value: new BigNumber(DummyUTXOValue),
        // };
    }
    return {
        dummyUTXO: dummyUTXORes,
        splitPsbtB64,
        indicesToSign,
        selectedUTXOs,
        newValueInscription: newValueInscriptionRes
    };
};
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createTx = (senderPrivateKey, utxos, inscriptions, sendInscriptionID = "", receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam = true) => {
    // init key pair and tweakedSigner from senderPrivateKey
    const { keyPair } = generateTaprootKeyPair(senderPrivateKey);
    const { base64Psbt, fee, changeAmount, selectedUTXOs, indicesToSign } = createRawTx({
        pubKey: toXOnly$1(keyPair.publicKey),
        utxos,
        inscriptions,
        sendInscriptionID,
        receiverInsAddress,
        sendAmount,
        feeRatePerByte,
        isUseInscriptionPayFeeParam,
    });
    const { signedBase64PSBT, msgTx, msgTxID, msgTxHex } = signPSBT({
        senderPrivateKey,
        psbtB64: base64Psbt,
        indicesToSign,
        sigHashType: bitcoinjsLib.Transaction.SIGHASH_DEFAULT
    });
    return { txID: msgTxID, txHex: msgTxHex, fee, selectedUTXOs, changeAmount, tx: msgTx };
};
/**
* createRawTx creates the raw Bitcoin transaction (including sending inscriptions), but don't sign tx.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param pubKey buffer public key of the sender (It is the internal pubkey for Taproot address)
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createRawTx = ({ pubKey, utxos, inscriptions, sendInscriptionID = "", receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam = true, // default is true
 }) => {
    // validation
    if (sendAmount.gt(BNZero) && sendAmount.lt(MinSats)) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats) + " BTC.");
    }
    // select UTXOs
    const { selectedUTXOs, valueOutInscription, changeAmount, fee } = selectUTXOs(utxos, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);
    let feeRes = fee;
    // init key pair and tweakedSigner from senderPrivateKey
    // const { keyPair, senderAddress, tweakedSigner, p2pktr } = generateTaprootKeyPair(senderPrivateKey);
    const { address: senderAddress, p2pktr } = generateTaprootAddressFromPubKey(pubKey);
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    // add inputs
    for (const input of selectedUTXOs) {
        psbt.addInput({
            hash: input.tx_hash,
            index: input.tx_output_n,
            witnessUtxo: { value: input.value.toNumber(), script: p2pktr.output },
            tapInternalKey: pubKey,
        });
    }
    // add outputs
    if (sendInscriptionID !== "") {
        // add output inscription
        psbt.addOutput({
            address: receiverInsAddress,
            value: valueOutInscription.toNumber(),
        });
    }
    // add output send BTC
    if (sendAmount.gt(BNZero)) {
        psbt.addOutput({
            address: receiverInsAddress,
            value: sendAmount.toNumber(),
        });
    }
    // add change output
    if (changeAmount.gt(BNZero)) {
        if (changeAmount.gte(MinSats)) {
            psbt.addOutput({
                address: senderAddress,
                value: changeAmount.toNumber(),
            });
        }
        else {
            feeRes = feeRes.plus(changeAmount);
        }
    }
    const indicesToSign = [];
    for (let i = 0; i < psbt.txInputs.length; i++) {
        indicesToSign.push(i);
    }
    return { base64Psbt: psbt.toBase64(), fee: feeRes, changeAmount, selectedUTXOs, indicesToSign };
};
/**
* createTxFromAnyWallet creates the raw Bitcoin transaction (including sending inscriptions), but don't sign tx.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param pubKey buffer public key of the sender (It is the internal pubkey for Taproot address)
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createTxFromAnyWallet = async ({ pubKey, utxos, inscriptions, sendInscriptionID = "", receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam = true, // default is true,
walletType = bitcoinjsLib.Transaction.SIGHASH_DEFAULT, cancelFn, }) => {
    const { address } = generateTaprootAddressFromPubKey(pubKey);
    const { base64Psbt, indicesToSign, selectedUTXOs, fee, changeAmount } = createRawTx({
        pubKey,
        utxos,
        inscriptions,
        sendInscriptionID,
        receiverInsAddress,
        sendAmount,
        feeRatePerByte,
        isUseInscriptionPayFeeParam,
    });
    // sign transaction 
    const { base64SignedPsbt, msgTx, msgTxID, msgTxHex } = await handleSignPsbtWithSpecificWallet({
        base64Psbt: base64Psbt,
        indicesToSign: indicesToSign,
        address: address,
        isGetMsgTx: true,
        walletType,
        cancelFn
    });
    return {
        tx: msgTx,
        txID: msgTxID,
        txHex: msgTxHex,
        fee,
        selectedUTXOs,
        changeAmount,
    };
};
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createTxSendBTC = ({ senderPrivateKey, utxos, inscriptions, paymentInfos, feeRatePerByte, }) => {
    // validation
    let totalPaymentAmount = BNZero;
    for (const info of paymentInfos) {
        if (info.amount.gt(BNZero) && info.amount.lt(MinSats)) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats) + " BTC.");
        }
        totalPaymentAmount = totalPaymentAmount.plus(info.amount);
    }
    // select UTXOs
    const { selectedUTXOs, changeAmount, fee } = selectUTXOs(utxos, inscriptions, "", totalPaymentAmount, feeRatePerByte, false);
    let feeRes = fee;
    // init key pair and tweakedSigner from senderPrivateKey
    const { keyPair, senderAddress, tweakedSigner, p2pktr } = generateTaprootKeyPair(senderPrivateKey);
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    // add inputs
    for (const input of selectedUTXOs) {
        psbt.addInput({
            hash: input.tx_hash,
            index: input.tx_output_n,
            witnessUtxo: { value: input.value.toNumber(), script: p2pktr.output },
            tapInternalKey: toXOnly$1(keyPair.publicKey),
        });
    }
    // add outputs send BTC
    for (const info of paymentInfos) {
        psbt.addOutput({
            address: info.address,
            value: info.amount.toNumber(),
        });
    }
    // add change output
    if (changeAmount.gt(BNZero)) {
        if (changeAmount.gte(MinSats)) {
            psbt.addOutput({
                address: senderAddress,
                value: changeAmount.toNumber(),
            });
        }
        else {
            feeRes = feeRes.plus(changeAmount);
        }
    }
    // sign tx
    for (let i = 0; i < selectedUTXOs.length; i++) {
        psbt.signInput(i, tweakedSigner);
    }
    psbt.finalizeAllInputs();
    // get tx hex
    const tx = psbt.extractTransaction();
    console.log("Transaction : ", tx);
    const txHex = tx.toHex();
    return { txID: tx.getId(), txHex, fee: feeRes, selectedUTXOs, changeAmount, tx };
};
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createRawTxSendBTC = ({ pubKey, utxos, inscriptions, paymentInfos, feeRatePerByte, }) => {
    // validation
    let totalPaymentAmount = BNZero;
    for (const info of paymentInfos) {
        if (info.amount.gt(BNZero) && info.amount.lt(MinSats)) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats) + " BTC.");
        }
        totalPaymentAmount = totalPaymentAmount.plus(info.amount);
    }
    // select UTXOs
    const { selectedUTXOs, changeAmount, fee } = selectUTXOs(utxos, inscriptions, "", totalPaymentAmount, feeRatePerByte, false);
    let feeRes = fee;
    let changeAmountRes = changeAmount;
    // init key pair and tweakedSigner from senderPrivateKey
    const { address: senderAddress, p2pktr } = generateTaprootAddressFromPubKey(pubKey);
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    // add inputs
    for (const input of selectedUTXOs) {
        psbt.addInput({
            hash: input.tx_hash,
            index: input.tx_output_n,
            witnessUtxo: { value: input.value.toNumber(), script: p2pktr.output },
            tapInternalKey: pubKey,
        });
    }
    // add outputs send BTC
    for (const info of paymentInfos) {
        psbt.addOutput({
            address: info.address,
            value: info.amount.toNumber(),
        });
    }
    // add change output
    if (changeAmountRes.gt(BNZero)) {
        if (changeAmountRes.gte(MinSats)) {
            psbt.addOutput({
                address: senderAddress,
                value: changeAmountRes.toNumber(),
            });
        }
        else {
            feeRes = feeRes.plus(changeAmountRes);
            changeAmountRes = BNZero;
        }
    }
    const indicesToSign = [];
    for (let i = 0; i < psbt.txInputs.length; i++) {
        indicesToSign.push(i);
    }
    return { base64Psbt: psbt.toBase64(), fee: feeRes, changeAmount: changeAmountRes, selectedUTXOs, indicesToSign };
};
/**
* createTxWithSpecificUTXOs creates the Bitcoin transaction with specific UTXOs (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* This function is used for testing.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount amount need to send (in sat)
* @param valueOutInscription inscription output's value (in sat)
* @param changeAmount cardinal change amount (in sat)
* @param fee transaction fee (in sat)
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createTxWithSpecificUTXOs = (senderPrivateKey, utxos, sendInscriptionID = "", receiverInsAddress, sendAmount, valueOutInscription, changeAmount, fee) => {
    const selectedUTXOs = utxos;
    // init key pair from senderPrivateKey
    const keypair = ECPair$1.fromPrivateKey(senderPrivateKey, { network: tcBTCNetwork });
    // Tweak the original keypair
    const tweakedSigner = tweakSigner$1(keypair, { network: tcBTCNetwork });
    // Generate an address from the tweaked public key
    const p2pktr = bitcoinjsLib.payments.p2tr({
        pubkey: toXOnly$1(tweakedSigner.publicKey),
        network: tcBTCNetwork,
    });
    const senderAddress = p2pktr.address ? p2pktr.address : "";
    if (senderAddress === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Can not get the sender address from the private key");
    }
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    // add inputs
    for (const input of selectedUTXOs) {
        psbt.addInput({
            hash: input.tx_hash,
            index: input.tx_output_n,
            witnessUtxo: { value: input.value.toNumber(), script: p2pktr.output },
            tapInternalKey: toXOnly$1(keypair.publicKey),
        });
    }
    // add outputs
    if (sendInscriptionID !== "") {
        // add output inscription
        psbt.addOutput({
            address: receiverInsAddress,
            value: valueOutInscription.toNumber(),
        });
    }
    // add output send BTC
    if (sendAmount.gt(BNZero)) {
        psbt.addOutput({
            address: receiverInsAddress,
            value: sendAmount.toNumber(),
        });
    }
    // add change output
    if (changeAmount.gt(BNZero)) {
        psbt.addOutput({
            address: senderAddress,
            value: changeAmount.toNumber(),
        });
    }
    // sign tx
    for (let i = 0; i < selectedUTXOs.length; i++) {
        psbt.signInput(i, tweakedSigner);
    }
    psbt.finalizeAllInputs();
    // get tx hex
    const tx = psbt.extractTransaction();
    console.log("Transaction : ", tx);
    const txHex = tx.toHex();
    return { txID: tx.getId(), txHex, fee };
};
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createTxSplitFundFromOrdinalUTXO = (senderPrivateKey, inscriptionUTXO, inscriptionInfo, sendAmount, feeRatePerByte) => {
    const { keyPair } = generateTaprootKeyPair(senderPrivateKey);
    const { resRawTx, newValueInscription } = createRawTxSplitFundFromOrdinalUTXO({
        pubKey: toXOnly$1(keyPair.publicKey),
        inscriptionUTXO, inscriptionInfo,
        sendAmount,
        feeRatePerByte,
    });
    // sign tx
    const { signedBase64PSBT, msgTx, msgTxID, msgTxHex } = signPSBT({
        senderPrivateKey,
        psbtB64: resRawTx.base64Psbt,
        indicesToSign: resRawTx.indicesToSign,
        sigHashType: bitcoinjsLib.Transaction.SIGHASH_DEFAULT,
    });
    return { txID: msgTxID, txHex: msgTxHex, fee: resRawTx.fee, selectedUTXOs: resRawTx.selectedUTXOs, newValueInscription };
};
/**
* createRawTxSplitFundFromOrdinalUTXO creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createRawTxSplitFundFromOrdinalUTXO = ({ pubKey, inscriptionUTXO, inscriptionInfo, sendAmount, feeRatePerByte, }) => {
    // validation
    if (sendAmount.gt(BNZero) && sendAmount.lt(MinSats)) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats) + " BTC.");
    }
    const { address: senderAddress, p2pktr } = generateTaprootAddressFromPubKey(pubKey);
    const maxAmountInsSpend = inscriptionUTXO.value.minus(inscriptionInfo.offset).minus(1).minus(MinSats);
    const fee = new BigNumber(estimateTxFee(1, 2, feeRatePerByte));
    const totalAmountSpend = sendAmount.plus(fee);
    if (totalAmountSpend.gt(maxAmountInsSpend)) {
        throw new SDKError$1(ERROR_CODE$1.NOT_ENOUGH_BTC_TO_PAY_FEE);
    }
    const newValueInscription = inscriptionUTXO.value.minus(totalAmountSpend);
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    // add inputs
    psbt.addInput({
        hash: inscriptionUTXO.tx_hash,
        index: inscriptionUTXO.tx_output_n,
        witnessUtxo: { value: inscriptionUTXO.value.toNumber(), script: p2pktr.output },
        tapInternalKey: pubKey,
    });
    // add outputs
    // add output inscription: must be at index 0
    psbt.addOutput({
        address: senderAddress,
        value: newValueInscription.toNumber(),
    });
    // add output send BTC
    psbt.addOutput({
        address: senderAddress,
        value: sendAmount.toNumber(),
    });
    const indicesToSign = [];
    for (let i = 0; i < psbt.txInputs.length; i++) {
        indicesToSign.push(i);
    }
    return {
        resRawTx: { base64Psbt: psbt.toBase64(), fee, changeAmount: BNZero, selectedUTXOs: [inscriptionUTXO], indicesToSign },
        newValueInscription: newValueInscription
    };
};
const selectDummyUTXO = (utxos, inscriptions) => {
    const smallestUTXO = selectTheSmallestUTXO(utxos, inscriptions);
    if (smallestUTXO.value.lte(DummyUTXOValue)) {
        return smallestUTXO;
    }
    throw new SDKError$1(ERROR_CODE$1.NOT_FOUND_DUMMY_UTXO);
};
const createDummyUTXOFromCardinal = (senderPrivateKey, utxos, inscriptions, feeRatePerByte) => {
    // create dummy UTXO from cardinal UTXOs
    let dummyUTXO;
    let newUTXO = null;
    const smallestUTXO = selectTheSmallestUTXO(utxos, inscriptions);
    if (smallestUTXO.value.lte(DummyUTXOValue)) {
        dummyUTXO = smallestUTXO;
        return { dummyUTXO: dummyUTXO, splitTxID: "", selectedUTXOs: [], newUTXO: newUTXO, fee: BNZero, txHex: "" };
    }
    else {
        const { senderAddress } = generateTaprootKeyPair(senderPrivateKey);
        const { txID, txHex, fee, selectedUTXOs, changeAmount } = createTx(senderPrivateKey, utxos, inscriptions, "", senderAddress, new BigNumber(DummyUTXOValue), feeRatePerByte, false);
        // init dummy UTXO rely on the result of the split tx
        dummyUTXO = {
            tx_hash: txID,
            tx_output_n: 0,
            value: new BigNumber(DummyUTXOValue),
        };
        if (changeAmount.gt(BNZero)) {
            newUTXO = {
                tx_hash: txID,
                tx_output_n: 1,
                value: changeAmount,
            };
        }
        return { dummyUTXO: dummyUTXO, splitTxID: txID, selectedUTXOs, newUTXO: newUTXO, fee, txHex };
    }
};
const createRawTxDummyUTXOFromCardinal = (pubKey, utxos, inscriptions, feeRatePerByte) => {
    // create dummy UTXO from cardinal UTXOs
    let dummyUTXO;
    const smallestUTXO = selectTheSmallestUTXO(utxos, inscriptions);
    if (smallestUTXO.value.lte(DummyUTXOValue)) {
        dummyUTXO = smallestUTXO;
        return { dummyUTXO: dummyUTXO, splitPsbtB64: "", indicesToSign: [], changeAmount: BNZero, selectedUTXOs: [], fee: BNZero };
    }
    else {
        const { address: senderAddress } = generateTaprootAddressFromPubKey(pubKey);
        const { base64Psbt, fee, changeAmount, selectedUTXOs, indicesToSign } = createRawTx({
            pubKey: pubKey,
            utxos: utxos,
            inscriptions: inscriptions,
            sendInscriptionID: "",
            receiverInsAddress: senderAddress,
            sendAmount: new BigNumber(DummyUTXOValue),
            feeRatePerByte,
            isUseInscriptionPayFeeParam: false,
        });
        // TODO: 0x2525
        // init dummy UTXO rely on the result of the split tx
        // dummyUTXO = {
        //     tx_hash: txID,
        //     tx_output_n: 0,
        //     value: new BigNumber(DummyUTXOValue),
        // };
        // if (changeAmount.gt(BNZero)) {
        //     newUTXO = {
        //         tx_hash: txID,
        //         tx_output_n: 1,
        //         value: changeAmount,
        //     };
        // }
        return { dummyUTXO: dummyUTXO, splitPsbtB64: base64Psbt, indicesToSign, selectedUTXOs, fee, changeAmount };
    }
};
const prepareUTXOsToBuyMultiInscriptions = ({ privateKey, address, utxos, inscriptions, feeRatePerByte, buyReqFullInfos, }) => {
    let splitTxID = "";
    let splitTxHex = "";
    let newUTXO;
    let dummyUTXO;
    let selectedUTXOs = [];
    let fee = BNZero;
    // filter to get cardinal utxos
    const { cardinalUTXOs, totalCardinalAmount } = filterAndSortCardinalUTXOs(utxos, inscriptions);
    // select dummy utxo
    let needCreateDummyUTXO = false;
    try {
        dummyUTXO = selectDummyUTXO(cardinalUTXOs, {});
    }
    catch (e) {
        console.log("Can not find dummy UTXO, need to create it.");
        needCreateDummyUTXO = true;
    }
    const needPaymentUTXOs = [];
    for (let i = 0; i < buyReqFullInfos.length; i++) {
        const info = buyReqFullInfos[i];
        try {
            const { utxo } = findExactValueUTXO(cardinalUTXOs, info.price);
            buyReqFullInfos[i].paymentUTXO = utxo;
        }
        catch (e) {
            needPaymentUTXOs.push({ buyInfoIndex: i, amount: info.price });
        }
    }
    console.log("buyReqFullInfos: ", buyReqFullInfos);
    // create split tx to create enough payment uxtos (if needed)
    if (needPaymentUTXOs.length > 0 || needCreateDummyUTXO) {
        const paymentInfos = [];
        for (const info of needPaymentUTXOs) {
            paymentInfos.push({ address: address, amount: info.amount });
        }
        if (needCreateDummyUTXO) {
            paymentInfos.push({ address: address, amount: new BigNumber(DummyUTXOValue) });
        }
        const res = createTxSendBTC({ senderPrivateKey: privateKey, utxos: cardinalUTXOs, inscriptions: {}, paymentInfos, feeRatePerByte });
        splitTxID = res.txID;
        splitTxHex = res.txHex;
        selectedUTXOs = res.selectedUTXOs;
        fee = res.fee;
        for (let i = 0; i < needPaymentUTXOs.length; i++) {
            const info = needPaymentUTXOs[i];
            const buyInfoIndex = info.buyInfoIndex;
            if (buyReqFullInfos[buyInfoIndex].paymentUTXO != null) {
                throw new SDKError$1(ERROR_CODE$1.INVALID_CODE);
            }
            const newUTXO = {
                tx_hash: splitTxID,
                tx_output_n: i,
                value: info.amount,
            };
            buyReqFullInfos[buyInfoIndex].paymentUTXO = newUTXO;
        }
        if (needCreateDummyUTXO) {
            dummyUTXO = {
                tx_hash: splitTxID,
                tx_output_n: needPaymentUTXOs.length,
                value: new BigNumber(DummyUTXOValue),
            };
        }
        if (res.changeAmount.gt(BNZero)) {
            const indexChangeUTXO = needCreateDummyUTXO ? needPaymentUTXOs.length + 1 : needPaymentUTXOs.length;
            newUTXO = {
                tx_hash: splitTxID,
                tx_output_n: indexChangeUTXO,
                value: res.changeAmount,
            };
        }
    }
    return { buyReqFullInfos, dummyUTXO, splitTxID, selectedUTXOs, newUTXO, fee, splitTxHex };
};
const createRawTxToPrepareUTXOsToBuyMultiInscs = ({ pubKey, address, utxos, inscriptions, feeRatePerByte, buyReqFullInfos, }) => {
    let splitPsbtB64 = "";
    let dummyUTXO;
    let selectedUTXOs = [];
    let fee = BNZero;
    let changeAmount = BNZero;
    let indicesToSign = [];
    // filter to get cardinal utxos
    const { cardinalUTXOs } = filterAndSortCardinalUTXOs(utxos, inscriptions);
    // select dummy utxo
    let needCreateDummyUTXO = false;
    try {
        dummyUTXO = selectDummyUTXO(cardinalUTXOs, {});
    }
    catch (e) {
        console.log("Can not find dummy UTXO, need to create it.");
        needCreateDummyUTXO = true;
    }
    // find payment utxos for each buy info
    const needPaymentUTXOs = [];
    for (let i = 0; i < buyReqFullInfos.length; i++) {
        const info = buyReqFullInfos[i];
        try {
            const { utxo } = findExactValueUTXO(cardinalUTXOs, info.price);
            buyReqFullInfos[i].paymentUTXO = utxo;
        }
        catch (e) {
            needPaymentUTXOs.push({ buyInfoIndex: i, amount: info.price });
        }
    }
    console.log("buyReqFullInfos: ", buyReqFullInfos);
    // create split tx to create enough payment uxtos (if needed)
    if (needPaymentUTXOs.length > 0 || needCreateDummyUTXO) {
        const paymentInfos = [];
        for (const info of needPaymentUTXOs) {
            paymentInfos.push({ address: address, amount: info.amount });
        }
        if (needCreateDummyUTXO) {
            paymentInfos.push({ address: address, amount: new BigNumber(DummyUTXOValue) });
        }
        const res = createRawTxSendBTC({ pubKey: pubKey, utxos: cardinalUTXOs, inscriptions: {}, paymentInfos, feeRatePerByte });
        selectedUTXOs = res.selectedUTXOs;
        fee = res.fee;
        splitPsbtB64 = res.base64Psbt;
        changeAmount = res.changeAmount;
        indicesToSign = res.indicesToSign;
    }
    return { buyReqFullInfos, dummyUTXO, needPaymentUTXOs, splitPsbtB64, selectedUTXOs, fee, changeAmount: changeAmount, needCreateDummyUTXO, indicesToSign };
};
const broadcastTx = async (txHex) => {
    const blockstream = new axios__default["default"].Axios({
        baseURL: BlockStreamURL
    });
    const response = await blockstream.post("/tx", txHex);
    const { status, data } = response;
    if (status !== 200) {
        throw new SDKError$1(ERROR_CODE$1.ERR_BROADCAST_TX, data);
    }
    return response.data;
};

const SigHashTypeForSale = bitcoinjsLib.Transaction.SIGHASH_SINGLE | bitcoinjsLib.Transaction.SIGHASH_ANYONECANPAY;
/**
* createPSBTToSell creates the partially signed bitcoin transaction to sale the inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerPrivateKey buffer private key of the seller
* @param sellerAddress payment address of the seller to recieve BTC from buyer
* @param ordinalInput ordinal input coin to sell
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @returns the encoded base64 partially signed transaction
*/
const createPSBTToSell = (params) => {
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    const { inscriptionUTXO: ordinalInput, amountPayToSeller, receiverBTCAddress, sellerPrivateKey, dummyUTXO, creatorAddress, feePayToCreator } = params;
    const { keyPair, tweakedSigner, p2pktr } = generateTaprootKeyPair(sellerPrivateKey);
    // add ordinal input into the first input coins with 
    // sighashType: Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY
    psbt.addInput({
        hash: ordinalInput.tx_hash,
        index: ordinalInput.tx_output_n,
        witnessUtxo: { value: ordinalInput.value.toNumber(), script: p2pktr.output },
        tapInternalKey: toXOnly$1(keyPair.publicKey),
        sighashType: bitcoinjsLib.Transaction.SIGHASH_SINGLE | bitcoinjsLib.Transaction.SIGHASH_ANYONECANPAY,
    });
    if (dummyUTXO !== undefined && dummyUTXO !== null && dummyUTXO.value.gt(BNZero)) {
        psbt.addOutput({
            address: receiverBTCAddress,
            value: amountPayToSeller.plus(dummyUTXO.value).toNumber(),
        });
    }
    else {
        psbt.addOutput({
            address: receiverBTCAddress,
            value: amountPayToSeller.toNumber(),
        });
    }
    // the second input and output
    // add dummy UTXO and output for paying to creator
    if (feePayToCreator.gt(BNZero) && creatorAddress !== "") {
        psbt.addInput({
            hash: dummyUTXO.tx_hash,
            index: dummyUTXO.tx_output_n,
            witnessUtxo: { value: dummyUTXO.value.toNumber(), script: p2pktr.output },
            tapInternalKey: toXOnly$1(keyPair.publicKey),
            sighashType: bitcoinjsLib.Transaction.SIGHASH_SINGLE | bitcoinjsLib.Transaction.SIGHASH_ANYONECANPAY,
        });
        psbt.addOutput({
            address: creatorAddress,
            value: feePayToCreator.toNumber()
        });
    }
    // sign tx
    for (let i = 0; i < psbt.txInputs.length; i++) {
        psbt.signInput(i, tweakedSigner, [bitcoinjsLib.Transaction.SIGHASH_SINGLE | bitcoinjsLib.Transaction.SIGHASH_ANYONECANPAY]);
        let isValid = true;
        try {
            isValid = psbt.validateSignaturesOfInput(i, ecc.verifySchnorr, tweakedSigner.publicKey);
        }
        catch (e) {
            isValid = false;
        }
        if (!isValid) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_SIG);
        }
    }
    psbt.finalizeAllInputs();
    return psbt.toBase64();
};
/**
* createPSBTToSell creates the partially signed bitcoin transaction to sale the inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerPrivateKey buffer private key of the seller
* @param sellerAddress payment address of the seller to recieve BTC from buyer
* @param ordinalInput ordinal input coin to sell
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @returns the encoded base64 partially signed transaction
*/
const createRawPSBTToSell = (params) => {
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    const { inscriptionUTXO: ordinalInput, amountPayToSeller, receiverBTCAddress, internalPubKey, dummyUTXO, creatorAddress, feePayToCreator } = params;
    const { address, p2pktr } = generateTaprootAddressFromPubKey(internalPubKey);
    // add ordinal input into the first input coins with 
    // sighashType: Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY
    psbt.addInput({
        hash: ordinalInput.tx_hash,
        index: ordinalInput.tx_output_n,
        witnessUtxo: { value: ordinalInput.value.toNumber(), script: p2pktr.output },
        tapInternalKey: internalPubKey,
        sighashType: bitcoinjsLib.Transaction.SIGHASH_SINGLE | bitcoinjsLib.Transaction.SIGHASH_ANYONECANPAY,
    });
    const selectedUTXOs = [ordinalInput];
    if (dummyUTXO !== undefined && dummyUTXO !== null && dummyUTXO.value.gt(BNZero)) {
        psbt.addOutput({
            address: receiverBTCAddress,
            value: amountPayToSeller.plus(dummyUTXO.value).toNumber(),
        });
    }
    else {
        psbt.addOutput({
            address: receiverBTCAddress,
            value: amountPayToSeller.toNumber(),
        });
    }
    // the second input and output
    // add dummy UTXO and output for paying to creator
    if (feePayToCreator.gt(BNZero) && creatorAddress !== "") {
        psbt.addInput({
            hash: dummyUTXO.tx_hash,
            index: dummyUTXO.tx_output_n,
            witnessUtxo: { value: dummyUTXO.value.toNumber(), script: p2pktr.output },
            tapInternalKey: internalPubKey,
            sighashType: bitcoinjsLib.Transaction.SIGHASH_SINGLE | bitcoinjsLib.Transaction.SIGHASH_ANYONECANPAY | bitcoinjsLib.Transaction.SIGHASH_DEFAULT,
        });
        selectedUTXOs.push(dummyUTXO);
        psbt.addOutput({
            address: creatorAddress,
            value: feePayToCreator.toNumber()
        });
    }
    const indicesToSign = [];
    for (let i = 0; i < psbt.txInputs.length; i++) {
        indicesToSign.push(i);
    }
    return { base64Psbt: psbt.toBase64(), selectedUTXOs, indicesToSign, fee: BNZero, changeAmount: BNZero };
};
/**
* createPSBTToBuy creates the partially signed bitcoin transaction to buy the inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbt PSBT from seller
* @param buyerPrivateKey buffer private key of the buyer
* @param buyerAddress payment address of the buy to receive inscription
* @param valueInscription value in inscription
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @param paymentUtxos cardinal input coins to payment
* @param dummyUtxo cardinal dummy input coin
* @returns the encoded base64 partially signed transaction
*/
const createPSBTToBuy = (params) => {
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    const { sellerSignedPsbt, buyerPrivateKey, price, receiverInscriptionAddress, valueInscription, paymentUtxos, dummyUtxo, feeRate } = params;
    let totalValue = BNZero;
    const { keyPair, tweakedSigner, p2pktr, senderAddress: buyerAddress } = generateTaprootKeyPair(buyerPrivateKey);
    // Add dummy utxo to the first input coin
    psbt.addInput({
        hash: dummyUtxo.tx_hash,
        index: dummyUtxo.tx_output_n,
        witnessUtxo: { value: dummyUtxo.value.toNumber(), script: p2pktr.output },
        tapInternalKey: toXOnly$1(keyPair.publicKey),
    });
    // Add inscription output
    // the frist output coin has value equal to the sum of dummy value and value inscription
    // this makes sure the first output coin is inscription outcoin 
    psbt.addOutput({
        address: receiverInscriptionAddress,
        value: dummyUtxo.value.plus(valueInscription).toNumber(),
    });
    if (sellerSignedPsbt.txInputs.length !== sellerSignedPsbt.txOutputs.length) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Length of inputs and outputs in seller psbt must not be different.");
    }
    for (let i = 0; i < sellerSignedPsbt.txInputs.length; i++) {
        // Add seller signed input
        psbt.addInput({
            ...sellerSignedPsbt.txInputs[i],
            ...sellerSignedPsbt.data.inputs[i]
        });
        // Add seller output
        psbt.addOutput({
            ...sellerSignedPsbt.txOutputs[i],
        });
    }
    // Add payment utxo inputs
    for (const utxo of paymentUtxos) {
        psbt.addInput({
            hash: utxo.tx_hash,
            index: utxo.tx_output_n,
            witnessUtxo: { value: utxo.value.toNumber(), script: p2pktr.output },
            tapInternalKey: toXOnly$1(keyPair.publicKey),
        });
        totalValue = totalValue.plus(utxo.value);
    }
    let fee = new BigNumber(estimateTxFee(psbt.txInputs.length, psbt.txOutputs.length, feeRate));
    if (fee.plus(price).gt(totalValue)) {
        fee = totalValue.minus(price); // maximum fee can paid
        if (fee.lt(BNZero)) {
            throw new SDKError$1(ERROR_CODE$1.NOT_ENOUGH_BTC_TO_PAY_FEE);
        }
    }
    let changeValue = totalValue.minus(price).minus(fee);
    if (changeValue.gte(DummyUTXOValue)) {
        // Create a new dummy utxo output for the next purchase
        psbt.addOutput({
            address: buyerAddress,
            value: DummyUTXOValue,
        });
        changeValue = changeValue.minus(DummyUTXOValue);
        const extraFee = new BigNumber(OutputSize * feeRate);
        if (changeValue.gte(extraFee)) {
            changeValue = changeValue.minus(extraFee);
            fee = fee.plus(extraFee);
        }
    }
    if (changeValue.lt(BNZero)) {
        throw new SDKError$1(ERROR_CODE$1.NOT_ENOUGH_BTC_TO_SEND);
    }
    // Change utxo
    if (changeValue.gt(BNZero)) {
        if (changeValue.gte(MinSats)) {
            psbt.addOutput({
                address: buyerAddress,
                value: changeValue.toNumber(),
            });
        }
        else {
            fee = fee.plus(changeValue);
        }
    }
    // sign tx
    for (let i = 0; i < psbt.txInputs.length; i++) {
        if (i === 0 || i > sellerSignedPsbt.txInputs.length) {
            psbt.signInput(i, tweakedSigner);
        }
    }
    for (let i = 0; i < psbt.txInputs.length; i++) {
        if (i === 0 || i > sellerSignedPsbt.txInputs.length) {
            psbt.finalizeInput(i);
            try {
                const isValid = psbt.validateSignaturesOfInput(i, ecc.verifySchnorr, tweakedSigner.publicKey);
                if (!isValid) {
                    console.log("Tx signature is invalid " + i);
                }
            }
            catch (e) {
                console.log("Tx signature is invalid " + i);
            }
        }
    }
    // get tx hex
    const tx = psbt.extractTransaction();
    console.log("Transaction : ", tx);
    const txHex = tx.toHex();
    return { txID: tx.getId(), txHex, fee, selectedUTXOs: [...paymentUtxos, dummyUtxo], changeAmount: changeValue, tx };
};
/**
* createRawPSBTToBuy creates the raw partially signed bitcoin transaction to buy the inscription (not signed yet).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbt PSBT from seller
* @param internalPubKey buffer public key of the buyer
* @param receiverInscriptionAddress payment address of the buyer to receive inscription
* @param valueInscription value in inscription
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @param paymentUtxos cardinal input coins to payment
* @param dummyUtxo cardinal dummy input coin
* @returns the encoded base64 psbt
*/
const createRawPSBTToBuy = ({ sellerSignedPsbt, internalPubKey, receiverInscriptionAddress, valueInscription, price, paymentUtxos, dummyUtxo, feeRate, }) => {
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    let totalValue = BNZero;
    const { p2pktr, address: buyerAddress } = generateTaprootAddressFromPubKey(internalPubKey);
    // Add dummy utxo to the first input coin
    psbt.addInput({
        hash: dummyUtxo.tx_hash,
        index: dummyUtxo.tx_output_n,
        witnessUtxo: { value: dummyUtxo.value.toNumber(), script: p2pktr.output },
        tapInternalKey: internalPubKey,
    });
    // Add inscription output
    // the frist output coin has value equal to the sum of dummy value and value inscription
    // this makes sure the first output coin is inscription outcoin 
    psbt.addOutput({
        address: receiverInscriptionAddress,
        value: dummyUtxo.value.plus(valueInscription).toNumber(),
    });
    if (sellerSignedPsbt.txInputs.length !== sellerSignedPsbt.txOutputs.length) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Length of inputs and outputs in seller psbt must not be different.");
    }
    for (let i = 0; i < sellerSignedPsbt.txInputs.length; i++) {
        // Add seller signed input
        psbt.addInput({
            ...sellerSignedPsbt.txInputs[i],
            ...sellerSignedPsbt.data.inputs[i]
        });
        // Add seller output
        psbt.addOutput({
            ...sellerSignedPsbt.txOutputs[i],
        });
    }
    // Add payment utxo inputs
    for (const utxo of paymentUtxos) {
        psbt.addInput({
            hash: utxo.tx_hash,
            index: utxo.tx_output_n,
            witnessUtxo: { value: utxo.value.toNumber(), script: p2pktr.output },
            tapInternalKey: internalPubKey,
        });
        totalValue = totalValue.plus(utxo.value);
    }
    let fee = new BigNumber(estimateTxFee(psbt.txInputs.length, psbt.txOutputs.length, feeRate));
    if (fee.plus(price).gt(totalValue)) {
        fee = totalValue.minus(price); // maximum fee can paid
        if (fee.lt(BNZero)) {
            throw new SDKError$1(ERROR_CODE$1.NOT_ENOUGH_BTC_TO_PAY_FEE);
        }
    }
    let changeValue = totalValue.minus(price).minus(fee);
    if (changeValue.gte(DummyUTXOValue)) {
        // Create a new dummy utxo output for the next purchase
        psbt.addOutput({
            address: buyerAddress,
            value: DummyUTXOValue,
        });
        changeValue = changeValue.minus(DummyUTXOValue);
        const extraFee = new BigNumber(OutputSize * feeRate);
        if (changeValue.gte(extraFee)) {
            changeValue = changeValue.minus(extraFee);
            fee = fee.plus(extraFee);
        }
    }
    if (changeValue.lt(BNZero)) {
        throw new SDKError$1(ERROR_CODE$1.NOT_ENOUGH_BTC_TO_SEND);
    }
    // Change utxo
    if (changeValue.gt(BNZero)) {
        if (changeValue.gte(MinSats)) {
            psbt.addOutput({
                address: buyerAddress,
                value: changeValue.toNumber(),
            });
        }
        else {
            fee = fee.plus(changeValue);
            changeValue = BNZero;
        }
    }
    const indicesToSign = [];
    for (let i = 0; i < psbt.txInputs.length; i++) {
        if (i === 0 || i > sellerSignedPsbt.txInputs.length) {
            indicesToSign.push(i);
        }
    }
    return { base64Psbt: psbt.toBase64(), selectedUTXOs: [...paymentUtxos, dummyUtxo], indicesToSign, fee: fee, changeAmount: changeValue };
};
/**
* createPSBTToBuy creates the partially signed bitcoin transaction to buy the inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbt PSBT from seller
* @param buyerPrivateKey buffer private key of the buyer
* @param buyerAddress payment address of the buy to receive inscription
* @param valueInscription value in inscription
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @param paymentUtxos cardinal input coins to payment
* @param dummyUtxo cardinal dummy input coin
* @returns the encoded base64 partially signed transaction
*/
const createPSBTToBuyMultiInscriptions = ({ buyReqFullInfos, buyerPrivateKey, feeUTXOs, fee, dummyUTXO, feeRatePerByte, }) => {
    // validation
    if (buyReqFullInfos.length === 0) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "buyReqFullInfos is empty");
    }
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    const indexInputNeedToSign = [];
    const selectedUTXOs = [];
    const { keyPair, tweakedSigner, p2pktr, senderAddress: buyerAddress } = generateTaprootKeyPair(buyerPrivateKey);
    // Add dummy utxo to the first input coin
    psbt.addInput({
        hash: dummyUTXO.tx_hash,
        index: dummyUTXO.tx_output_n,
        witnessUtxo: { value: dummyUTXO.value.toNumber(), script: p2pktr.output },
        tapInternalKey: toXOnly$1(keyPair.publicKey),
    });
    indexInputNeedToSign.push(0);
    selectedUTXOs.push(dummyUTXO);
    // Add the first inscription output
    // the frist output coin has value equal to the sum of dummy value and value inscription
    // this makes sure the first output coin is inscription outcoin 
    const theFirstBuyReq = buyReqFullInfos[0];
    psbt.addOutput({
        address: theFirstBuyReq.receiverInscriptionAddress,
        value: dummyUTXO.value.plus(theFirstBuyReq.valueInscription).toNumber(),
    });
    for (let i = 0; i < buyReqFullInfos.length; i++) {
        const info = buyReqFullInfos[i];
        const sellerSignedPsbt = info.sellerSignedPsbt;
        const paymentUTXO = info.paymentUTXO;
        if (sellerSignedPsbt.txInputs.length !== sellerSignedPsbt.txOutputs.length) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Length of inputs and outputs in seller psbt must not be different.");
        }
        for (let i = 0; i < sellerSignedPsbt.txInputs.length; i++) {
            // Add seller signed input
            psbt.addInput({
                ...sellerSignedPsbt.txInputs[i],
                ...sellerSignedPsbt.data.inputs[i]
            });
            // Add seller output
            psbt.addOutput({
                ...sellerSignedPsbt.txOutputs[i],
            });
        }
        // add payment utxo input
        psbt.addInput({
            hash: paymentUTXO.tx_hash,
            index: paymentUTXO.tx_output_n,
            witnessUtxo: { value: paymentUTXO.value.toNumber(), script: p2pktr.output },
            tapInternalKey: toXOnly$1(keyPair.publicKey),
        });
        indexInputNeedToSign.push(psbt.txInputs.length - 1);
        selectedUTXOs.push(paymentUTXO);
        // add receiver next inscription output
        if (i < buyReqFullInfos.length - 1) {
            const theNextBuyReq = buyReqFullInfos[i + 1];
            psbt.addOutput({
                address: theNextBuyReq.receiverInscriptionAddress,
                value: theNextBuyReq.valueInscription.toNumber(),
            });
        }
    }
    // add utxo for pay fee
    let totalAmountFeeUTXOs = BNZero;
    for (const utxo of feeUTXOs) {
        psbt.addInput({
            hash: utxo.tx_hash,
            index: utxo.tx_output_n,
            witnessUtxo: { value: utxo.value.toNumber(), script: p2pktr.output },
            tapInternalKey: toXOnly$1(keyPair.publicKey),
        });
        indexInputNeedToSign.push(psbt.txInputs.length - 1);
        totalAmountFeeUTXOs = totalAmountFeeUTXOs.plus(utxo.value);
    }
    selectedUTXOs.push(...feeUTXOs);
    // let fee = new BigNumber(estimateTxFee(psbt.txInputs.length, psbt.txOutputs.length, feeRate));
    if (fee.gt(totalAmountFeeUTXOs)) {
        fee = totalAmountFeeUTXOs; // maximum fee can paid
    }
    let changeValue = totalAmountFeeUTXOs.minus(fee);
    if (changeValue.gte(DummyUTXOValue)) {
        // Create a new dummy utxo output for the next purchase
        psbt.addOutput({
            address: buyerAddress,
            value: DummyUTXOValue,
        });
        changeValue = changeValue.minus(DummyUTXOValue);
        const extraFee = new BigNumber(OutputSize * feeRatePerByte);
        if (changeValue.gte(extraFee)) {
            changeValue = changeValue.minus(extraFee);
            fee = fee.plus(extraFee);
        }
    }
    if (changeValue.lt(BNZero)) {
        throw new SDKError$1(ERROR_CODE$1.NOT_ENOUGH_BTC_TO_SEND);
    }
    // Change utxo
    if (changeValue.gt(BNZero)) {
        if (changeValue.gte(MinSats)) {
            psbt.addOutput({
                address: buyerAddress,
                value: changeValue.toNumber(),
            });
        }
        else {
            fee = fee.plus(changeValue);
            changeValue = BNZero;
        }
    }
    console.log("indexInputNeedToSign: ", indexInputNeedToSign);
    // sign tx
    for (let i = 0; i < psbt.txInputs.length; i++) {
        if (indexInputNeedToSign.findIndex(value => value === i) !== -1) {
            psbt.signInput(i, tweakedSigner);
        }
    }
    for (let i = 0; i < psbt.txInputs.length; i++) {
        if (indexInputNeedToSign.findIndex(value => value === i) !== -1) {
            psbt.finalizeInput(i);
            try {
                const isValid = psbt.validateSignaturesOfInput(i, ecc.verifySchnorr, tweakedSigner.publicKey);
                if (!isValid) {
                    console.log("Tx signature is invalid " + i);
                }
            }
            catch (e) {
                console.log("Tx signature is invalid " + i);
            }
        }
    }
    // get tx hex
    const tx = psbt.extractTransaction();
    console.log("Transaction : ", tx);
    const txHex = tx.toHex();
    return { txID: tx.getId(), txHex, fee, selectedUTXOs, changeAmount: changeValue, tx, };
};
/**
* createRawPSBTToBuyMultiInscriptions creates the partially signed bitcoin transaction to buy multiple inscriptions.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbt PSBT from seller
* @param internalPubKey buffer public key of the buyer
* @param buyerAddress payment address of the buy to receive inscription
* @param valueInscription value in inscription
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @param paymentUtxos cardinal input coins to payment
* @param dummyUtxo cardinal dummy input coin
* @returns the encoded base64 partially signed transaction
*/
const createRawPSBTToBuyMultiInscriptions = ({ buyReqFullInfos, internalPubKey, feeUTXOs, fee, dummyUTXO, feeRatePerByte, }) => {
    // validation
    if (buyReqFullInfos.length === 0) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "buyReqFullInfos is empty");
    }
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    const indexInputNeedToSign = [];
    const selectedUTXOs = [];
    const { p2pktr, address: buyerAddress } = generateTaprootAddressFromPubKey(internalPubKey);
    // Add dummy utxo to the first input coin
    psbt.addInput({
        hash: dummyUTXO.tx_hash,
        index: dummyUTXO.tx_output_n,
        witnessUtxo: { value: dummyUTXO.value.toNumber(), script: p2pktr.output },
        tapInternalKey: internalPubKey,
    });
    indexInputNeedToSign.push(0);
    selectedUTXOs.push(dummyUTXO);
    // Add the first inscription output
    // the frist output coin has value equal to the sum of dummy value and value inscription
    // this makes sure the first output coin is inscription outcoin 
    const theFirstBuyReq = buyReqFullInfos[0];
    psbt.addOutput({
        address: theFirstBuyReq.receiverInscriptionAddress,
        value: dummyUTXO.value.plus(theFirstBuyReq.valueInscription).toNumber(),
    });
    for (let i = 0; i < buyReqFullInfos.length; i++) {
        const info = buyReqFullInfos[i];
        const sellerSignedPsbt = info.sellerSignedPsbt;
        const paymentUTXO = info.paymentUTXO;
        if (sellerSignedPsbt.txInputs.length !== sellerSignedPsbt.txOutputs.length) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Length of inputs and outputs in seller psbt must not be different.");
        }
        for (let i = 0; i < sellerSignedPsbt.txInputs.length; i++) {
            // Add seller signed input
            psbt.addInput({
                ...sellerSignedPsbt.txInputs[i],
                ...sellerSignedPsbt.data.inputs[i]
            });
            // Add seller output
            psbt.addOutput({
                ...sellerSignedPsbt.txOutputs[i],
            });
        }
        // add payment utxo input
        psbt.addInput({
            hash: paymentUTXO.tx_hash,
            index: paymentUTXO.tx_output_n,
            witnessUtxo: { value: paymentUTXO.value.toNumber(), script: p2pktr.output },
            tapInternalKey: internalPubKey,
        });
        indexInputNeedToSign.push(psbt.txInputs.length - 1);
        selectedUTXOs.push(paymentUTXO);
        // add receiver next inscription output
        if (i < buyReqFullInfos.length - 1) {
            const theNextBuyReq = buyReqFullInfos[i + 1];
            psbt.addOutput({
                address: theNextBuyReq.receiverInscriptionAddress,
                value: theNextBuyReq.valueInscription.toNumber(),
            });
        }
    }
    // add utxo for pay fee
    let totalAmountFeeUTXOs = BNZero;
    for (const utxo of feeUTXOs) {
        psbt.addInput({
            hash: utxo.tx_hash,
            index: utxo.tx_output_n,
            witnessUtxo: { value: utxo.value.toNumber(), script: p2pktr.output },
            tapInternalKey: internalPubKey,
        });
        indexInputNeedToSign.push(psbt.txInputs.length - 1);
        totalAmountFeeUTXOs = totalAmountFeeUTXOs.plus(utxo.value);
    }
    selectedUTXOs.push(...feeUTXOs);
    // let fee = new BigNumber(estimateTxFee(psbt.txInputs.length, psbt.txOutputs.length, feeRate));
    if (fee.gt(totalAmountFeeUTXOs)) {
        fee = totalAmountFeeUTXOs; // maximum fee can paid
    }
    let changeValue = totalAmountFeeUTXOs.minus(fee);
    if (changeValue.gte(DummyUTXOValue)) {
        // Create a new dummy utxo output for the next purchase
        psbt.addOutput({
            address: buyerAddress,
            value: DummyUTXOValue,
        });
        changeValue = changeValue.minus(DummyUTXOValue);
        const extraFee = new BigNumber(OutputSize * feeRatePerByte);
        if (changeValue.gte(extraFee)) {
            changeValue = changeValue.minus(extraFee);
            fee = fee.plus(extraFee);
        }
    }
    if (changeValue.lt(BNZero)) {
        throw new SDKError$1(ERROR_CODE$1.NOT_ENOUGH_BTC_TO_SEND);
    }
    // Change utxo
    if (changeValue.gt(BNZero)) {
        if (changeValue.gte(MinSats)) {
            psbt.addOutput({
                address: buyerAddress,
                value: changeValue.toNumber(),
            });
        }
        else {
            fee = fee.plus(changeValue);
            changeValue = BNZero;
        }
    }
    console.log("indexInputNeedToSign: ", indexInputNeedToSign);
    return { base64Psbt: psbt.toBase64(), selectedUTXOs, indicesToSign: indexInputNeedToSign, fee, changeAmount: changeValue };
};
/**
* reqListForSaleInscription creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerPrivateKey buffer private key of the seller
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param amountPayToSeller BTC amount to pay to seller
* @param feePayToCreator BTC fee to pay to creator
* @param creatorAddress address of creator
* amountPayToSeller + feePayToCreator = price that is showed on UI
* @returns the base64 encode Psbt
*/
const reqListForSaleInscription = async (params) => {
    const { sellerPrivateKey, utxos, inscriptions, sellInscriptionID, receiverBTCAddress, feeRatePerByte } = params;
    let { amountPayToSeller, feePayToCreator, creatorAddress, } = params;
    // validation
    if (feePayToCreator.gt(BNZero) && creatorAddress === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Creator address must not be empty.");
    }
    if (sellInscriptionID === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "SellInscriptionID must not be empty.");
    }
    if (receiverBTCAddress === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "receiverBTCAddress must not be empty.");
    }
    if (amountPayToSeller.eq(BNZero)) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "amountPayToSeller must be greater than zero.");
    }
    let needDummyUTXO = false;
    if (feePayToCreator.gt(BNZero)) {
        // creator is the selller
        if (creatorAddress !== receiverBTCAddress) {
            needDummyUTXO = true;
        }
        else {
            // create only one output, don't need to create 2 outputs
            amountPayToSeller = amountPayToSeller.plus(feePayToCreator);
            creatorAddress = "";
            feePayToCreator = BNZero;
        }
    }
    if (amountPayToSeller.lt(MinSats)) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "amountPayToSeller must not be less than " + fromSat(MinSats) + " BTC.");
    }
    if (feePayToCreator.gt(BNZero) && feePayToCreator.lt(MinSats)) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "feePayToCreator must not be less than " + fromSat(MinSats) + " BTC.");
    }
    // select inscription UTXO
    const { inscriptionUTXO, inscriptionInfo } = selectInscriptionUTXO(utxos, inscriptions, sellInscriptionID);
    let newInscriptionUTXO = inscriptionUTXO;
    // select dummy UTXO 
    // if there is no dummy UTXO, we have to create and broadcast the tx to split dummy UTXO first
    let dummyUTXORes;
    let selectedUTXOs = [];
    let splitTxID = "";
    let splitTxRaw = "";
    if (needDummyUTXO) {
        try {
            // create dummy UTXO from cardinal UTXOs
            const res = await createDummyUTXOFromCardinal(sellerPrivateKey, utxos, inscriptions, feeRatePerByte);
            dummyUTXORes = res.dummyUTXO;
            selectedUTXOs = res.selectedUTXOs;
            splitTxID = res.splitTxID;
            splitTxRaw = res.txHex;
        }
        catch (e) {
            // create dummy UTXO from inscription UTXO
            const { txID, txHex, newValueInscription } = createTxSplitFundFromOrdinalUTXO(sellerPrivateKey, inscriptionUTXO, inscriptionInfo, new BigNumber(DummyUTXOValue), feeRatePerByte);
            splitTxID = txID;
            splitTxRaw = txHex;
            newInscriptionUTXO = {
                tx_hash: txID,
                tx_output_n: 0,
                value: newValueInscription,
            };
            dummyUTXORes = {
                tx_hash: txID,
                tx_output_n: 1,
                value: new BigNumber(DummyUTXOValue),
            };
        }
    }
    console.log("sell splitTxID: ", splitTxID);
    console.log("sell dummyUTXORes: ", dummyUTXORes);
    console.log("sell newInscriptionUTXO: ", newInscriptionUTXO);
    const base64Psbt = createPSBTToSell({
        inscriptionUTXO: newInscriptionUTXO,
        amountPayToSeller: amountPayToSeller,
        receiverBTCAddress: receiverBTCAddress,
        sellerPrivateKey: sellerPrivateKey,
        dummyUTXO: dummyUTXORes,
        creatorAddress: creatorAddress,
        feePayToCreator: feePayToCreator,
    });
    const inscriptionUTXOs = [inscriptionUTXO];
    if (dummyUTXORes !== null) {
        inscriptionUTXOs.push(dummyUTXORes);
    }
    return { base64Psbt, selectedUTXOs: inscriptionUTXOs, splitTxID, splitUTXOs: selectedUTXOs, splitTxRaw: splitTxRaw };
};
/**
* reqListForSaleInscFromAnyWallet creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerPrivateKey buffer private key of the seller
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param amountPayToSeller BTC amount to pay to seller
* @param feePayToCreator BTC fee to pay to creator
* @param creatorAddress address of creator
* amountPayToSeller + feePayToCreator = price that is showed on UI
* @returns the base64 encode Psbt
*/
const reqListForSaleInscFromAnyWallet = async ({ pubKey, utxos, inscriptions, sellInscriptionID, receiverBTCAddress, amountPayToSeller, feePayToCreator, creatorAddress, feeRatePerByte, walletType = WalletType.Xverse, cancelFn, }) => {
    // validation
    if (feePayToCreator.gt(BNZero) && creatorAddress === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Creator address must not be empty.");
    }
    if (sellInscriptionID === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "SellInscriptionID must not be empty.");
    }
    if (receiverBTCAddress === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "receiverBTCAddress must not be empty.");
    }
    if (amountPayToSeller.eq(BNZero)) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "amountPayToSeller must be greater than zero.");
    }
    let needDummyUTXO = false;
    if (feePayToCreator.gt(BNZero)) {
        // creator is the selller
        if (creatorAddress !== receiverBTCAddress) {
            needDummyUTXO = true;
        }
        else {
            // create only one output, don't need to create 2 outputs
            amountPayToSeller = amountPayToSeller.plus(feePayToCreator);
            creatorAddress = "";
            feePayToCreator = BNZero;
        }
    }
    if (amountPayToSeller.lt(MinSats)) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "amountPayToSeller must not be less than " + fromSat(MinSats) + " BTC.");
    }
    if (feePayToCreator.gt(BNZero) && feePayToCreator.lt(MinSats)) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "feePayToCreator must not be less than " + fromSat(MinSats) + " BTC.");
    }
    const { address } = generateTaprootAddressFromPubKey(pubKey);
    // select inscription UTXO
    const { inscriptionUTXO, inscriptionInfo } = selectInscriptionUTXO(utxos, inscriptions, sellInscriptionID);
    let newInscriptionUTXO = inscriptionUTXO;
    // select dummy UTXO 
    // if there is no dummy UTXO, we have to create and broadcast the tx to split dummy UTXO first
    let dummyUTXORes;
    let selectedUTXOsRes = [];
    let splitTxID = "";
    let splitTxRaw = "";
    if (needDummyUTXO) {
        const { dummyUTXO, splitPsbtB64, indicesToSign, selectedUTXOs, newValueInscription } = createRawTxDummyUTXOForSale({
            pubKey,
            utxos,
            inscriptions,
            sellInscriptionID,
            feeRatePerByte,
        });
        if (dummyUTXO !== undefined && dummyUTXO !== null && dummyUTXO.tx_hash !== "") {
            // select an available dummy UTXO
            dummyUTXORes = dummyUTXO;
        }
        else {
            // need to create split tx 
            // sign transaction 
            const { base64SignedPsbt, msgTx, msgTxID, msgTxHex } = await handleSignPsbtWithSpecificWallet({
                base64Psbt: splitPsbtB64,
                indicesToSign,
                address,
                isGetMsgTx: true,
                walletType,
                cancelFn
            });
            splitTxID = msgTxID;
            splitTxRaw = msgTxHex;
            selectedUTXOsRes = selectedUTXOs;
            if (newValueInscription.eq(BNZero)) {
                // split from cardinal
                dummyUTXORes = {
                    tx_hash: splitTxID,
                    tx_output_n: 0,
                    value: new BigNumber(DummyUTXOValue),
                };
                newInscriptionUTXO = inscriptionUTXO;
            }
            else {
                // split from ordinal
                newInscriptionUTXO = {
                    tx_hash: splitTxID,
                    tx_output_n: 0,
                    value: newValueInscription,
                };
                dummyUTXORes = {
                    tx_hash: splitTxID,
                    tx_output_n: 1,
                    value: new BigNumber(DummyUTXOValue),
                };
            }
        }
    }
    console.log("sell splitTxID: ", splitTxID);
    console.log("sell dummyUTXORes: ", dummyUTXORes);
    console.log("sell newInscriptionUTXO: ", newInscriptionUTXO);
    const rawPsbtRes = createRawPSBTToSell({
        inscriptionUTXO: newInscriptionUTXO,
        amountPayToSeller: amountPayToSeller,
        receiverBTCAddress: receiverBTCAddress,
        internalPubKey: pubKey,
        dummyUTXO: dummyUTXORes,
        creatorAddress: creatorAddress,
        feePayToCreator: feePayToCreator,
    });
    // sign transaction 
    const { base64SignedPsbt } = await handleSignPsbtWithSpecificWallet({
        base64Psbt: rawPsbtRes.base64Psbt,
        indicesToSign: rawPsbtRes.indicesToSign,
        address,
        sigHashType: SigHashTypeForSale,
        walletType,
        cancelFn
    });
    const inscriptionUTXOs = [inscriptionUTXO];
    if (dummyUTXORes !== null) {
        inscriptionUTXOs.push(dummyUTXORes);
    }
    return { base64Psbt: base64SignedPsbt, selectedUTXOs: inscriptionUTXOs, splitTxID, splitUTXOs: selectedUTXOsRes, splitTxRaw: splitTxRaw };
};
/**
* reqBuyInscription creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbtB64 buffer private key of the buyer
* @param buyerPrivateKey buffer private key of the buyer
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param price  = amount pay to seller + fee pay to creator
* @returns the base64 encode Psbt
*/
const reqBuyInscription = async (params) => {
    const { sellerSignedPsbtB64, buyerPrivateKey, receiverInscriptionAddress, price, utxos, inscriptions, feeRatePerByte } = params;
    // decode seller's signed PSBT
    const sellerSignedPsbt = bitcoinjsLib.Psbt.fromBase64(sellerSignedPsbtB64, { network: tcBTCNetwork });
    const sellerInputs = sellerSignedPsbt.data.inputs;
    if (sellerInputs.length === 0) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Invalid seller's PSBT.");
    }
    const valueInscription = sellerInputs[0].witnessUtxo?.value;
    if (valueInscription === undefined || valueInscription === 0) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Invalid value inscription in seller's PSBT.");
    }
    const newUTXOs = utxos;
    // select or create dummy UTXO
    const { dummyUTXO, splitTxID, selectedUTXOs, newUTXO, fee: feeSplitUTXO, txHex: splitTxRaw } = await createDummyUTXOFromCardinal(buyerPrivateKey, utxos, inscriptions, feeRatePerByte);
    console.log("buy dummyUTXO: ", dummyUTXO);
    console.log("buy splitTxID: ", splitTxID);
    console.log("buy selectedUTXOs for split: ", selectedUTXOs);
    console.log("buy newUTXO: ", newUTXO);
    // remove selected utxo or dummyUTXO, and append new UTXO to list of UTXO to create the next PSBT 
    if (selectedUTXOs.length > 0) {
        for (const selectedUtxo of selectedUTXOs) {
            const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n);
            newUTXOs.splice(index, 1);
        }
    }
    else {
        const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === dummyUTXO.tx_hash && utxo.tx_output_n === dummyUTXO.tx_output_n);
        newUTXOs.splice(index, 1);
    }
    if (newUTXO !== undefined && newUTXO !== null) {
        newUTXOs.push(newUTXO);
    }
    console.log("buy newUTXOs: ", newUTXOs);
    // select cardinal UTXOs to payment
    const { selectedUTXOs: paymentUTXOs } = selectUTXOsToCreateBuyTx({ sellerSignedPsbt: sellerSignedPsbt, price: price, utxos: newUTXOs, inscriptions, feeRate: feeRatePerByte });
    console.log("selected UTXOs to buy paymentUTXOs: ", paymentUTXOs);
    // create PBTS from the seller's one
    const res = createPSBTToBuy({
        sellerSignedPsbt: sellerSignedPsbt,
        buyerPrivateKey: buyerPrivateKey,
        receiverInscriptionAddress: receiverInscriptionAddress,
        valueInscription: new BigNumber(valueInscription),
        price: price,
        paymentUtxos: paymentUTXOs,
        dummyUtxo: dummyUTXO,
        feeRate: feeRatePerByte,
    });
    return {
        tx: res.tx,
        txID: res?.txID,
        txHex: res?.txHex,
        fee: res?.fee.plus(feeSplitUTXO),
        selectedUTXOs: [...paymentUTXOs, dummyUTXO],
        splitTxID,
        splitUTXOs: [...selectedUTXOs],
        splitTxRaw: splitTxRaw,
    };
};
/**
* reqBuyInscription creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbtB64 buffer private key of the buyer
* @param buyerPrivateKey buffer private key of the buyer
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param price  = amount pay to seller + fee pay to creator
* @returns the base64 encode Psbt
*/
const reqBuyInscriptionFromAnyWallet = async ({ sellerSignedPsbtB64, pubKey, receiverInscriptionAddress, price, utxos, inscriptions, feeRatePerByte, walletType = WalletType.Xverse, cancelFn, }) => {
    // decode seller's signed PSBT
    const sellerSignedPsbt = bitcoinjsLib.Psbt.fromBase64(sellerSignedPsbtB64, { network: tcBTCNetwork });
    const sellerInputs = sellerSignedPsbt.data.inputs;
    if (sellerInputs.length === 0) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Invalid seller's PSBT.");
    }
    const valueInscription = sellerInputs[0].witnessUtxo?.value;
    if (valueInscription === undefined || valueInscription === 0) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Invalid value inscription in seller's PSBT.");
    }
    const newUTXOs = utxos;
    let splitTxID = "";
    let splitTxRaw = "";
    let dummyUTXORes;
    let newUTXO;
    const { address } = generateTaprootAddressFromPubKey(pubKey);
    // select or create dummy UTXO
    const { dummyUTXO, splitPsbtB64, indicesToSign, selectedUTXOs, changeAmount, fee: feeSplitUTXO } = await createRawTxDummyUTXOFromCardinal(pubKey, utxos, inscriptions, feeRatePerByte);
    if (dummyUTXO !== undefined && dummyUTXO !== null && dummyUTXO.tx_hash !== "") {
        // select an available dummy UTXO
        dummyUTXORes = dummyUTXO;
    }
    else {
        // need to create split tx 
        // sign transaction 
        const { base64SignedPsbt, msgTx, msgTxID, msgTxHex } = await handleSignPsbtWithSpecificWallet({
            base64Psbt: splitPsbtB64,
            indicesToSign,
            address,
            isGetMsgTx: true,
            walletType,
            cancelFn
        });
        splitTxID = msgTxID;
        splitTxRaw = msgTxHex;
        // split from cardinal
        dummyUTXORes = {
            tx_hash: splitTxID,
            tx_output_n: 0,
            value: new BigNumber(DummyUTXOValue),
        };
        if (changeAmount.gt(BNZero)) {
            newUTXO = {
                tx_hash: splitTxID,
                tx_output_n: 1,
                value: new BigNumber(changeAmount),
            };
        }
    }
    console.log("buy dummyUTXO: ", dummyUTXO);
    console.log("buy splitTxID: ", splitTxID);
    console.log("buy selectedUTXOs for split: ", selectedUTXOs);
    console.log("buy newUTXO: ", newUTXO);
    // remove selected utxo or dummyUTXO, and append new UTXO to list of UTXO to create the next PSBT 
    if (selectedUTXOs.length > 0) {
        for (const selectedUtxo of selectedUTXOs) {
            const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n);
            newUTXOs.splice(index, 1);
        }
    }
    else {
        const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === dummyUTXO.tx_hash && utxo.tx_output_n === dummyUTXO.tx_output_n);
        newUTXOs.splice(index, 1);
    }
    if (newUTXO !== undefined && newUTXO !== null) {
        newUTXOs.push(newUTXO);
    }
    console.log("buy newUTXOs: ", newUTXOs);
    // select cardinal UTXOs to payment
    const { selectedUTXOs: paymentUTXOs } = selectUTXOsToCreateBuyTx({ sellerSignedPsbt: sellerSignedPsbt, price: price, utxos: newUTXOs, inscriptions, feeRate: feeRatePerByte });
    console.log("selected UTXOs to buy paymentUTXOs: ", paymentUTXOs);
    // create PBTS from the seller's one
    const rawBuyRes = createRawPSBTToBuy({
        sellerSignedPsbt: sellerSignedPsbt,
        internalPubKey: pubKey,
        receiverInscriptionAddress: receiverInscriptionAddress,
        valueInscription: new BigNumber(valueInscription),
        price: price,
        paymentUtxos: paymentUTXOs,
        dummyUtxo: dummyUTXORes,
        feeRate: feeRatePerByte,
    });
    // sign transaction 
    const { base64SignedPsbt, msgTx, msgTxID, msgTxHex } = await handleSignPsbtWithSpecificWallet({
        base64Psbt: rawBuyRes.base64Psbt,
        indicesToSign: rawBuyRes.indicesToSign,
        address,
        isGetMsgTx: true,
        walletType,
        cancelFn
    });
    return {
        tx: msgTx,
        txID: msgTxID,
        txHex: msgTxHex,
        fee: rawBuyRes.fee.plus(feeSplitUTXO),
        selectedUTXOs: [...paymentUTXOs, dummyUTXORes],
        splitTxID,
        splitUTXOs: [...selectedUTXOs],
        splitTxRaw: splitTxRaw,
    };
};
/**
* reqBuyInscription creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbtB64 buffer private key of the buyer
* @param buyerPrivateKey buffer private key of the buyer
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param price  = amount pay to seller + fee pay to creator
* @returns the base64 encode Psbt
*/
const reqBuyMultiInscriptions = (params) => {
    const { buyReqInfos, buyerPrivateKey, utxos, inscriptions, feeRatePerByte } = params;
    // 
    const { senderAddress: buyerAddress } = generateTaprootKeyPair(buyerPrivateKey);
    // decode list of seller's signed PSBT
    let buyReqFullInfos = [];
    for (let i = 0; i < buyReqInfos.length; i++) {
        const sellerSignedPsbtB64 = buyReqInfos[i].sellerSignedPsbtB64;
        const sellerSignedPsbt = bitcoinjsLib.Psbt.fromBase64(sellerSignedPsbtB64, { network: tcBTCNetwork });
        const sellerInputs = sellerSignedPsbt.data.inputs;
        if (sellerInputs.length === 0) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Invalid seller's PSBT.");
        }
        const valueInscription = sellerInputs[0].witnessUtxo?.value;
        if (valueInscription === undefined || valueInscription === 0) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Invalid value inscription in seller's PSBT.");
        }
        buyReqFullInfos.push({
            ...buyReqInfos[i],
            sellerSignedPsbt,
            valueInscription: new BigNumber(valueInscription),
            paymentUTXO: null,
        });
    }
    const newUTXOs = [...utxos];
    // need to split UTXOs correspond to list of prices to payment
    // and only one dummy UTXO for multiple inscriptions
    const { buyReqFullInfos: buyReqFullInfosRes, dummyUTXO, splitTxID, selectedUTXOs, newUTXO, fee: feeSplitUTXO, splitTxHex } = prepareUTXOsToBuyMultiInscriptions({ privateKey: buyerPrivateKey, address: buyerAddress, utxos, inscriptions, feeRatePerByte, buyReqFullInfos });
    buyReqFullInfos = buyReqFullInfosRes;
    console.log("buyReqFullInfos: ", buyReqFullInfos);
    console.log("buyReqInfos: ", buyReqInfos);
    console.log("buy dummyUTXO: ", dummyUTXO);
    console.log("buy splitTxID: ", splitTxID);
    console.log("buy selectedUTXOs for split: ", selectedUTXOs);
    console.log("buy newUTXO: ", newUTXO);
    // remove selected utxo, payment utxo, dummyUTXO, and append new UTXO to list of UTXO to create the next PSBT
    const tmpSelectedUTXOs = [...selectedUTXOs];
    for (const info of buyReqFullInfos) {
        tmpSelectedUTXOs.push(info.paymentUTXO);
    }
    tmpSelectedUTXOs.push(dummyUTXO);
    for (const selectedUtxo of tmpSelectedUTXOs) {
        const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n);
        if (index !== -1) {
            newUTXOs.splice(index, 1);
        }
    }
    if (newUTXO !== undefined && newUTXO !== null) {
        newUTXOs.push(newUTXO);
    }
    console.log("buy newUTXOs: ", newUTXOs);
    // estimate fee
    let numIns = 2 + buyReqFullInfos.length; // one for dummy utxo, one for network fee
    let numOuts = 1 + buyReqFullInfos.length; // one for change value
    for (const info of buyReqFullInfos) {
        numIns += info.sellerSignedPsbt.txInputs.length;
        numOuts += info.sellerSignedPsbt.txOutputs.length;
    }
    let fee = new BigNumber(estimateTxFee(numIns, numOuts, feeRatePerByte));
    // select cardinal UTXOs to pay fee
    console.log("BUY Fee estimate: ", fee.toNumber());
    const { selectedUTXOs: feeSelectedUTXOs, totalInputAmount } = selectCardinalUTXOs(newUTXOs, {}, fee);
    // create PBTS from the seller's one
    const res = createPSBTToBuyMultiInscriptions({
        buyReqFullInfos,
        buyerPrivateKey: buyerPrivateKey,
        feeUTXOs: feeSelectedUTXOs,
        fee,
        dummyUTXO,
        feeRatePerByte,
    });
    fee = res.fee;
    return {
        tx: res.tx,
        txID: res?.txID,
        txHex: res?.txHex,
        fee: res?.fee.plus(feeSplitUTXO),
        selectedUTXOs: res.selectedUTXOs,
        splitTxID,
        splitUTXOs: [...selectedUTXOs],
        splitTxRaw: splitTxHex,
    };
};
/**
* reqBuyInscription creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbtB64 buffer private key of the buyer
* @param buyerPrivateKey buffer private key of the buyer
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param price  = amount pay to seller + fee pay to creator
* @returns the base64 encode Psbt
*/
const reqBuyMultiInscriptionsFromAnyWallet = async ({ buyReqInfos, pubKey, utxos, inscriptions, feeRatePerByte, walletType = WalletType.Xverse, cancelFn, }) => {
    const { address: buyerAddress } = generateTaprootAddressFromPubKey(pubKey);
    // decode list of seller's signed PSBT
    let buyReqFullInfos = [];
    for (let i = 0; i < buyReqInfos.length; i++) {
        const sellerSignedPsbtB64 = buyReqInfos[i].sellerSignedPsbtB64;
        const sellerSignedPsbt = bitcoinjsLib.Psbt.fromBase64(sellerSignedPsbtB64, { network: tcBTCNetwork });
        const sellerInputs = sellerSignedPsbt.data.inputs;
        if (sellerInputs.length === 0) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Invalid seller's PSBT.");
        }
        const valueInscription = sellerInputs[0].witnessUtxo?.value;
        if (valueInscription === undefined || valueInscription === 0) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "Invalid value inscription in seller's PSBT.");
        }
        buyReqFullInfos.push({
            ...buyReqInfos[i],
            sellerSignedPsbt,
            valueInscription: new BigNumber(valueInscription),
            paymentUTXO: null,
        });
    }
    const newUTXOs = [...utxos];
    // need to split UTXOs correspond to list of prices to payment
    // and only one dummy UTXO for multiple inscriptions
    const { buyReqFullInfos: buyReqFullInfosRes, dummyUTXO, splitPsbtB64, selectedUTXOs, fee: feeSplitUTXO, changeAmount, needCreateDummyUTXO, needPaymentUTXOs, indicesToSign, } = createRawTxToPrepareUTXOsToBuyMultiInscs({
        pubKey: pubKey, address: buyerAddress, utxos, inscriptions, feeRatePerByte, buyReqFullInfos
    });
    // sign transaction 
    const { base64SignedPsbt, msgTx, msgTxID, msgTxHex } = await handleSignPsbtWithSpecificWallet({
        base64Psbt: splitPsbtB64,
        indicesToSign: indicesToSign,
        address: buyerAddress,
        isGetMsgTx: true,
        walletType,
        cancelFn
    });
    const splitTxID = msgTxID;
    const splitTxHex = msgTxHex;
    let dummyUTXORes = dummyUTXO;
    let newUTXO;
    for (let i = 0; i < needPaymentUTXOs.length; i++) {
        const info = needPaymentUTXOs[i];
        const buyInfoIndex = info.buyInfoIndex;
        if (buyReqFullInfos[buyInfoIndex].paymentUTXO != null) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_CODE);
        }
        const newUTXO = {
            tx_hash: splitTxID,
            tx_output_n: i,
            value: info.amount,
        };
        buyReqFullInfos[buyInfoIndex].paymentUTXO = newUTXO;
    }
    if (needCreateDummyUTXO) {
        dummyUTXORes = {
            tx_hash: splitTxID,
            tx_output_n: needPaymentUTXOs.length,
            value: new BigNumber(DummyUTXOValue),
        };
    }
    if (changeAmount.gt(BNZero)) {
        const indexChangeUTXO = needCreateDummyUTXO ? needPaymentUTXOs.length + 1 : needPaymentUTXOs.length;
        newUTXO = {
            tx_hash: splitTxID,
            tx_output_n: indexChangeUTXO,
            value: changeAmount,
        };
    }
    buyReqFullInfos = buyReqFullInfosRes;
    console.log("buyReqFullInfos: ", buyReqFullInfos);
    console.log("buyReqInfos: ", buyReqInfos);
    console.log("buy dummyUTXO: ", dummyUTXO);
    console.log("buy splitTxID: ", splitTxID);
    console.log("buy selectedUTXOs for split: ", selectedUTXOs);
    console.log("buy newUTXO: ", newUTXO);
    // remove selected utxo, payment utxo, dummyUTXO, and append new UTXO to list of UTXO to create the next PSBT
    const tmpSelectedUTXOs = [...selectedUTXOs];
    for (const info of buyReqFullInfos) {
        tmpSelectedUTXOs.push(info.paymentUTXO);
    }
    tmpSelectedUTXOs.push(dummyUTXO);
    for (const selectedUtxo of tmpSelectedUTXOs) {
        const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n);
        if (index !== -1) {
            newUTXOs.splice(index, 1);
        }
    }
    if (newUTXO !== undefined && newUTXO !== null) {
        newUTXOs.push(newUTXO);
    }
    console.log("buy newUTXOs: ", newUTXOs);
    // estimate fee
    let numIns = 2 + buyReqFullInfos.length; // one for dummy utxo, one for network fee
    let numOuts = 1 + buyReqFullInfos.length; // one for change value
    for (const info of buyReqFullInfos) {
        numIns += info.sellerSignedPsbt.txInputs.length;
        numOuts += info.sellerSignedPsbt.txOutputs.length;
    }
    let fee = new BigNumber(estimateTxFee(numIns, numOuts, feeRatePerByte));
    // select cardinal UTXOs to pay fee
    console.log("BUY Fee estimate: ", fee.toNumber());
    const { selectedUTXOs: feeSelectedUTXOs, totalInputAmount } = selectCardinalUTXOs(newUTXOs, {}, fee);
    // create PBTS from the seller's one
    const rawBuyRes = createRawPSBTToBuyMultiInscriptions({
        buyReqFullInfos,
        internalPubKey: pubKey,
        feeUTXOs: feeSelectedUTXOs,
        fee,
        dummyUTXO: dummyUTXORes,
        feeRatePerByte,
    });
    fee = rawBuyRes.fee;
    // sign transaction 
    const finalRes = await handleSignPsbtWithSpecificWallet({
        base64Psbt: rawBuyRes.base64Psbt,
        indicesToSign: rawBuyRes.indicesToSign,
        address: buyerAddress,
        isGetMsgTx: true,
        walletType,
        cancelFn
    });
    return {
        tx: finalRes.msgTx,
        txID: finalRes.msgTxID,
        txHex: finalRes.msgTxHex,
        fee: rawBuyRes?.fee.plus(feeSplitUTXO),
        selectedUTXOs: rawBuyRes.selectedUTXOs,
        splitTxID,
        splitUTXOs: [...selectedUTXOs],
        splitTxRaw: splitTxHex,
    };
};

// default is bitcoin mainnet
exports.Network = bitcoinjsLib.networks.bitcoin;
const NetworkType$1 = {
    Mainnet: 1,
    Testnet: 2,
    Regtest: 3,
};
const setBTCNetwork = (netType) => {
    switch (netType) {
        case NetworkType$1.Mainnet: {
            exports.Network = bitcoinjsLib.networks.bitcoin;
            break;
        }
        case NetworkType$1.Testnet: {
            exports.Network = bitcoinjsLib.networks.testnet;
            break;
        }
        case NetworkType$1.Regtest: {
            exports.Network = bitcoinjsLib.networks.regtest;
            break;
        }
    }
};

exports.StorageKeys = void 0;
(function (StorageKeys) {
    StorageKeys["HDWallet"] = "hd-wallet-cipher";
    StorageKeys["masterless"] = "masterless-cipher";
})(exports.StorageKeys || (exports.StorageKeys = {}));

new BigNumber(0);

const ERROR_CODE = {
    INVALID_CODE: "0",
    INVALID_PARAMS: "-1",
    NOT_SUPPORT_SEND: "-2",
    NOT_FOUND_INSCRIPTION: "-3",
    NOT_ENOUGH_BTC_TO_SEND: "-4",
    NOT_ENOUGH_BTC_TO_PAY_FEE: "-5",
    ERR_BROADCAST_TX: "-6",
    INVALID_SIG: "-7",
    INVALID_VALIDATOR_LABEL: "-8",
    NOT_FOUND_UTXO: "-9",
    NOT_FOUND_DUMMY_UTXO: "-10",
    WALLET_NOT_SUPPORT: "-11",
    SIGN_XVERSE_ERROR: "-12",
    CREATE_COMMIT_TX_ERR: "-13",
    INVALID_TAPSCRIPT_ADDRESS: "-14",
    INVALID_NETWORK_TYPE: "-15",
    RPC_ERROR: "-16",
    RPC_GET_INSCRIBEABLE_INFO_ERROR: "-17",
    RPC_SUBMIT_BTCTX_ERROR: "-18",
    RPC_GET_TAPSCRIPT_INFO: "-19",
    RESTORE_HD_WALLET: "-20",
    DECRYPT: "-21",
    TAPROOT_FROM_MNEMONIC: "-22",
    MNEMONIC_GEN_TAPROOT: "-23",
    CANNOT_FIND_ACCOUNT: "-24",
};
const ERROR_MESSAGE = {
    [ERROR_CODE.INVALID_CODE]: {
        message: "Something went wrong.",
        desc: "Something went wrong.",
    },
    [ERROR_CODE.INVALID_PARAMS]: {
        message: "Invalid input params.",
        desc: "Invalid input params.",
    },
    [ERROR_CODE.NOT_SUPPORT_SEND]: {
        message: "This inscription is not supported to send.",
        desc: "This inscription is not supported to send.",
    },
    [ERROR_CODE.NOT_FOUND_INSCRIPTION]: {
        message: "Can not find inscription UTXO in your wallet.",
        desc: "Can not find inscription UTXO in your wallet.",
    },
    [ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND]: {
        message: "Your balance is insufficient. Please top up BTC to your wallet.",
        desc: "Your balance is insufficient. Please top up BTC to your wallet.",
    },
    [ERROR_CODE.NOT_ENOUGH_BTC_TO_PAY_FEE]: {
        message: "Your balance is insufficient. Please top up BTC to pay network fee.",
        desc: "Your balance is insufficient. Please top up BTC to pay network fee.",
    },
    [ERROR_CODE.ERR_BROADCAST_TX]: {
        message: "There was an issue when broadcasting the transaction to the BTC network.",
        desc: "There was an issue when broadcasting the transaction to the BTC network.",
    },
    [ERROR_CODE.INVALID_SIG]: {
        message: "Signature is invalid in the partially signed bitcoin transaction.",
        desc: "Signature is invalid in the partially signed bitcoin transaction.",
    },
    [ERROR_CODE.INVALID_VALIDATOR_LABEL]: {
        message: "Missing or invalid label.",
        desc: "Missing or invalid label.",
    },
    [ERROR_CODE.NOT_FOUND_UTXO]: {
        message: "Can not find UTXO with exact value.",
        desc: "Can not find UTXO with exact value.",
    },
    [ERROR_CODE.NOT_FOUND_DUMMY_UTXO]: {
        message: "Can not find dummy UTXO in your wallet.",
        desc: "Can not find dummy UTXO in your wallet.",
    },
    [ERROR_CODE.SIGN_XVERSE_ERROR]: {
        message: "Can not sign with Xverse.",
        desc: "Can not sign with Xverse.",
    },
    [ERROR_CODE.WALLET_NOT_SUPPORT]: {
        message: "Your wallet is not supported currently.",
        desc: "Your wallet is not supported currently.",
    },
    [ERROR_CODE.CREATE_COMMIT_TX_ERR]: {
        message: "Create commit tx error.",
        desc: "Create commit tx error.",
    },
    [ERROR_CODE.INVALID_TAPSCRIPT_ADDRESS]: {
        message: "Can not generate valid tap script address to inscribe.",
        desc: "Can not generate valid tap script address to inscribe.",
    },
    [ERROR_CODE.INVALID_NETWORK_TYPE]: {
        message: "Invalid network type params.",
        desc: "Invalid network type params.",
    },
    [ERROR_CODE.RPC_ERROR]: {
        message: "Call RPC TC node error.",
        desc: "Call RPC TC node error.",
    },
    [ERROR_CODE.RPC_GET_INSCRIBEABLE_INFO_ERROR]: {
        message: "Call RPC get inscribeable info error.",
        desc: "Call RPC get inscribeable info error.",
    },
    [ERROR_CODE.RPC_SUBMIT_BTCTX_ERROR]: {
        message: "Call RPC submit btc tx error.",
        desc: "Call RPC submit btc tx error.",
    },
    [ERROR_CODE.RESTORE_HD_WALLET]: {
        message: "Restore hd wallet error.",
        desc: "Restore hd wallet error.",
    },
    [ERROR_CODE.DECRYPT]: {
        message: "Decrypt error.",
        desc: "Decrypt error.",
    },
    [ERROR_CODE.TAPROOT_FROM_MNEMONIC]: {
        message: "Generate private key by mnemonic error.",
        desc: "Generate private key by mnemonic error.",
    },
    [ERROR_CODE.CANNOT_FIND_ACCOUNT]: {
        message: "Can not find account.",
        desc: "an not find account.",
    },
};
class SDKError extends Error {
    constructor(code, desc) {
        super();
        const _error = ERROR_MESSAGE[code];
        this.message = `${_error.message} (${code})` || "";
        this.code = code;
        this.desc = desc || _error?.desc;
    }
    getMessage() {
        return this.message;
    }
}

bitcoinjsLib.initEccLib(ecc__namespace);
const ECPair = ecpair.ECPairFactory(ecc__namespace);
BIP32Factory__default["default"](ecc__namespace);
/**
* convertPrivateKey converts buffer private key to WIF private key string
* @param bytes buffer private key
* @returns the WIF private key string
*/
const convertPrivateKey = (bytes) => {
    return wif__default["default"].encode(128, bytes, true);
};
function toXOnly(pubkey) {
    if (pubkey.length === 33) {
        return pubkey.subarray(1, 33);
    }
    return pubkey;
}
function tweakSigner(signer, opts = {}) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let privateKey = signer.privateKey;
    if (!privateKey) {
        throw new Error("Private key is required for tweaking signer!");
    }
    if (signer.publicKey[0] === 3) {
        privateKey = ecc__namespace.privateNegate(privateKey);
    }
    const tweakedPrivateKey = ecc__namespace.privateAdd(privateKey, tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash));
    if (!tweakedPrivateKey) {
        throw new Error("Invalid tweaked private key!");
    }
    return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
        network: opts.network,
    });
}
function tapTweakHash(pubKey, h) {
    return bitcoinjsLib.crypto.taggedHash("TapTweak", Buffer.concat(h ? [pubKey, h] : [pubKey]));
}

bitcoinjsLib.Transaction.SIGHASH_SINGLE | bitcoinjsLib.Transaction.SIGHASH_ANYONECANPAY;

// default is bitcoin mainnet
bitcoinjsLib.networks.bitcoin;
const NetworkType = {
    Mainnet: 1,
    Testnet: 2,
    Regtest: 3,
};

var StorageKeys;
(function (StorageKeys) {
    StorageKeys["HDWallet"] = "hd-wallet-cipher";
    StorageKeys["masterless"] = "masterless-cipher";
})(StorageKeys || (StorageKeys = {}));

function isPrivateKey$1(privateKey) {
    let isValid = false;
    try {
        // init key pair from senderPrivateKey
        const keyPair = ECPair.fromPrivateKey(privateKey);
        // Tweak the original keypair
        const tweakedSigner = tweakSigner(keyPair, { network: tcBTCNetwork });
        // Generate an address from the tweaked public key
        const p2pktr = bitcoinjsLib.payments.p2tr({
            pubkey: toXOnly(tweakedSigner.publicKey),
            network: tcBTCNetwork
        });
        const senderAddress = p2pktr.address ? p2pktr.address : "";
        isValid = senderAddress !== "";
    }
    catch (e) {
        isValid = false;
    }
    return isValid;
}
class Validator$1 {
    constructor(label, value) {
        if (!label && typeof label !== "string") {
            throw new SDKError(ERROR_CODE.INVALID_VALIDATOR_LABEL);
        }
        this.value = value;
        this.label = label;
        this.isRequired = false;
    }
    _throwError(message) {
        throw new Error(`Validating "${this.label}" failed: ${message}. Found ${this.value} (type of ${typeof this.value})`);
    }
    _isDefined() {
        return this.value !== null && this.value !== undefined;
    }
    _onCondition(condition, message) {
        if (((!this.isRequired && this._isDefined()) || this.isRequired) &&
            !condition()) {
            this._throwError(message);
        }
        return this;
    }
    required(message = "Required") {
        this.isRequired = true;
        return this._onCondition(() => this._isDefined(), message);
    }
    string(message = "Must be string") {
        return this._onCondition(() => typeof this.value === "string", message);
    }
    buffer(message = "Must be buffer") {
        return this._onCondition(() => Buffer.isBuffer(this.value), message);
    }
    function(message = "Must be a function") {
        return this._onCondition(() => typeof this.value === "function", message);
    }
    boolean(message = "Must be boolean") {
        return this._onCondition(() => typeof this.value === "boolean", message);
    }
    number(message = "Must be number") {
        return this._onCondition(() => Number.isFinite(this.value), message);
    }
    array(message = "Must be array") {
        return this._onCondition(() => this.value instanceof Array, message);
    }
    privateKey(message = "Invalid private key") {
        return this._onCondition(() => this.buffer() && isPrivateKey$1(this.value), message);
    }
    mnemonic(message = "Invalid mnemonic") {
        return this._onCondition(() => ethers.utils.isValidMnemonic(this.value), message);
    }
}

const doubleHash$1 = (key) => {
    const hash = CryptoJS__namespace.SHA256(key);
    return CryptoJS__namespace.SHA256(hash).toString();
};
const encryptAES$1 = (text, key) => {
    const password = doubleHash$1(key);
    return CryptoJS__namespace.AES.encrypt(text, password).toString();
};
const decryptAES$1 = (cipherText, key) => {
    const password = doubleHash$1(key);
    const decrypted = CryptoJS__namespace.AES.decrypt(cipherText, password);
    if (decrypted) {
        try {
            const str = decrypted.toString(CryptoJS__namespace.enc.Utf8);
            if (str.length > 0) {
                return str;
            }
            else {
                throw new SDKError(ERROR_CODE.DECRYPT);
            }
        }
        catch (e) {
            throw new SDKError(ERROR_CODE.DECRYPT);
        }
    }
    throw new SDKError(ERROR_CODE.DECRYPT);
};

class StorageService {
    constructor(namespace) {
        this.namespace = namespace;
        this.setMethod = undefined;
        this.getMethod = undefined;
        this.removeMethod = undefined;
    }
    implement({ setMethod, getMethod, removeMethod, namespace }) {
        new Validator$1("setMethod", setMethod).required();
        new Validator$1("getMethod", getMethod).required();
        new Validator$1("removeMethod", removeMethod).required();
        new Validator$1("namespace", namespace).string();
        this.setMethod = setMethod;
        this.getMethod = getMethod;
        this.removeMethod = removeMethod;
        this.namespace = namespace;
    }
    _getKey(key) {
        return this.namespace ? `${this.namespace}-${key}` : key;
    }
    async set(key, data) {
        if (!this.setMethod)
            return;
        new Validator$1("key", key).required().string();
        const dataStr = JSON.stringify(data);
        return await this.setMethod(this._getKey(key), dataStr);
    }
    async get(key) {
        new Validator$1("key", key).required().string();
        if (!this.getMethod)
            return;
        const dataStr = await this.getMethod(this._getKey(key));
        return JSON.parse(dataStr);
    }
    async remove(key) {
        new Validator$1("key", key).required().string();
        if (!this.removeMethod)
            return;
        return await this.removeMethod(this._getKey(key));
    }
}

const setupConfig = ({ storage, tcClient, netType }) => {
    let network;
    switch (netType) {
        case NetworkType.Mainnet: {
            network = bitcoinjsLib.networks.bitcoin;
            break;
        }
        case NetworkType.Testnet: {
            network = bitcoinjsLib.networks.testnet;
            break;
        }
        case NetworkType.Regtest: {
            network = bitcoinjsLib.networks.regtest;
            break;
        }
    }
    const _global = global || globalThis;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _global.tcStorage = storage;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _global.tcClient = tcClient;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _global.tcBTCNetwork = network;
};

/**
 * Helper function that produces a serialized witness script
 * https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/csv.spec.ts#L477
 */
function witnessStackToScriptWitness(witness) {
    let buffer = Buffer.allocUnsafe(0);
    function writeSlice(slice) {
        buffer = Buffer.concat([buffer, Buffer.from(slice)]);
    }
    function writeVarInt(i) {
        const currentLen = buffer.length;
        const varintLen = varuint__default["default"].encodingLength(i);
        buffer = Buffer.concat([buffer, Buffer.allocUnsafe(varintLen)]);
        varuint__default["default"].encode(i, buffer, currentLen);
    }
    function writeVarSlice(slice) {
        writeVarInt(slice.length);
        writeSlice(slice);
    }
    function writeVector(vector) {
        writeVarInt(vector.length);
        vector.forEach(writeVarSlice);
    }
    writeVector(witness);
    return buffer;
}

const createRawRevealTx = ({ internalPubKey, commitTxID, hashLockKeyPair, hashLockRedeem, script_p2tr, revealTxFee }) => {
    const { p2pktr, address: p2pktr_addr } = generateTaprootAddressFromPubKey(internalPubKey);
    const tapLeafScript = {
        leafVersion: hashLockRedeem?.redeemVersion,
        script: hashLockRedeem?.output,
        controlBlock: script_p2tr.witness[script_p2tr.witness.length - 1],
    };
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    psbt.addInput({
        hash: commitTxID,
        index: 0,
        witnessUtxo: { value: revealTxFee + MinSats, script: script_p2tr.output },
        tapLeafScript: [
            tapLeafScript
        ]
    });
    psbt.addOutput({
        address: p2pktr_addr,
        value: MinSats
    });
    // const hash_lock_keypair = ECPair.fromWIF(hashLockPriKey);
    psbt.signInput(0, hashLockKeyPair);
    // We have to construct our witness script in a custom finalizer
    const customFinalizer = (_inputIndex, input) => {
        const scriptSolution = [
            input.tapScriptSig[0].signature,
        ];
        const witness = scriptSolution
            .concat(tapLeafScript.script)
            .concat(tapLeafScript.controlBlock);
        return {
            finalScriptWitness: witnessStackToScriptWitness(witness)
        };
    };
    psbt.finalizeInput(0, customFinalizer);
    const revealTX = psbt.extractTransaction();
    console.log("revealTX: ", revealTX);
    return { revealTxHex: revealTX.toHex(), revealTxID: revealTX.getId() };
};
function getRevealVirtualSize(hash_lock_redeem, script_p2tr, p2pktr_addr, hash_lock_keypair) {
    const tapLeafScript = {
        leafVersion: hash_lock_redeem.redeemVersion,
        script: hash_lock_redeem.output,
        controlBlock: script_p2tr.witness[script_p2tr.witness.length - 1]
    };
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    psbt.addInput({
        hash: "00".repeat(32),
        index: 0,
        witnessUtxo: { value: 1, script: script_p2tr.output },
        tapLeafScript: [
            tapLeafScript
        ]
    });
    psbt.addOutput({
        address: p2pktr_addr,
        value: 1
    });
    psbt.signInput(0, hash_lock_keypair);
    // We have to construct our witness script in a custom finalizer
    const customFinalizer = (_inputIndex, input) => {
        const scriptSolution = [
            input.tapScriptSig[0].signature,
        ];
        const witness = scriptSolution
            .concat(tapLeafScript.script)
            .concat(tapLeafScript.controlBlock);
        return {
            finalScriptWitness: witnessStackToScriptWitness(witness)
        };
    };
    psbt.finalizeInput(0, customFinalizer);
    const tx = psbt.extractTransaction();
    return tx.virtualSize();
}
/**
* createInscribeTx creates commit and reveal tx to inscribe data on Bitcoin netword.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the inscriber
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param tcTxID TC txID need to be inscribed
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the hex commit transaction
* @returns the commit transaction id
* @returns the hex reveal transaction
* @returns the reveal transaction id
* @returns the total network fee
*/
const createInscribeTx = async ({ senderPrivateKey, utxos, inscriptions, tcTxIDs, feeRatePerByte, tcClient, }) => {
    const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    const internalPubKey = toXOnly$1(keyPair.publicKey);
    // create lock script for commit tx
    const { hashLockKeyPair, hashLockRedeem, script_p2tr } = await createLockScript({
        internalPubKey,
        tcTxIDs,
        tcClient
    });
    // estimate fee and select UTXOs
    const estCommitTxFee = estimateTxFee(1, 2, feeRatePerByte);
    const revealVByte = getRevealVirtualSize(hashLockRedeem, script_p2tr, senderAddress, hashLockKeyPair);
    const estRevealTxFee = revealVByte * feeRatePerByte;
    const totalFee = estCommitTxFee + estRevealTxFee;
    // const totalAmount = new BigNumber(totalFee + MinSats); // MinSats for new output in the reveal tx
    // const { selectedUTXOs, totalInputAmount } = selectCardinalUTXOs(utxos, inscriptions, totalAmount);
    if (script_p2tr.address === undefined || script_p2tr.address === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_TAPSCRIPT_ADDRESS, "");
    }
    const { txHex: commitTxHex, txID: commitTxID, fee: commitTxFee, changeAmount, selectedUTXOs, tx } = createTxSendBTC({
        senderPrivateKey,
        utxos,
        inscriptions,
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee + MinSats) }],
        feeRatePerByte,
    });
    const newUTXOs = [];
    if (changeAmount.gt(BNZero)) {
        newUTXOs.push({
            tx_hash: commitTxID,
            tx_output_n: 1,
            value: changeAmount
        });
    }
    console.log("commitTX: ", tx);
    console.log("COMMITTX selectedUTXOs: ", selectedUTXOs);
    // create and sign reveal tx
    const { revealTxHex, revealTxID } = createRawRevealTx({
        internalPubKey,
        commitTxID,
        hashLockKeyPair,
        hashLockRedeem,
        script_p2tr,
        revealTxFee: estRevealTxFee,
    });
    console.log("commitTxHex: ", commitTxHex);
    console.log("revealTxHex: ", revealTxHex);
    newUTXOs.push({
        tx_hash: revealTxID,
        tx_output_n: 0,
        value: new BigNumber(MinSats),
    });
    const { btcTxID } = await tcClient.submitInscribeTx([commitTxHex, revealTxHex]);
    console.log("btcTxID: ", btcTxID);
    return {
        commitTxHex,
        commitTxID,
        revealTxHex,
        revealTxID,
        totalFee: new BigNumber(totalFee),
        selectedUTXOs: selectedUTXOs,
        newUTXOs: newUTXOs,
    };
};
const splitBatchInscribeTx = ({ tcTxDetails }) => {
    // sort tc tx by inscreasing nonce
    tcTxDetails = tcTxDetails.sort((a, b) => {
        if (a.Nonce > b.Nonce) {
            return 1;
        }
        if (a.Nonce < b.Nonce) {
            return -1;
        }
        return 0;
    });
    console.log("tcTxDetails after sort: ", tcTxDetails);
    // create inscribe tx 
    if (tcTxDetails.length === 0) {
        console.log("There is no transaction to inscribe");
        return [];
    }
    const batchInscribeTxIDs = [];
    let inscribeableTxIDs = [tcTxDetails[0].Hash];
    let prevNonce = tcTxDetails[0].Nonce;
    for (let i = 1; i < tcTxDetails.length; i++) {
        if (prevNonce + 1 === tcTxDetails[i].Nonce) {
            inscribeableTxIDs.push(tcTxDetails[i].Hash);
        }
        else {
            batchInscribeTxIDs.push([...inscribeableTxIDs]);
            inscribeableTxIDs = [tcTxDetails[i].Hash];
        }
        prevNonce = tcTxDetails[i].Nonce;
    }
    batchInscribeTxIDs.push([...inscribeableTxIDs]);
    console.log("batchInscribeTxIDs: ", batchInscribeTxIDs);
    return batchInscribeTxIDs;
};
/**
* createInscribeTx creates commit and reveal tx to inscribe data on Bitcoin netword.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the inscriber
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param tcTxID TC txID need to be inscribed
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the hex commit transaction
* @returns the commit transaction id
* @returns the hex reveal transaction
* @returns the reveal transaction id
* @returns the total network fee
*/
const createBatchInscribeTxs = async ({ senderPrivateKey, utxos, inscriptions, tcTxDetails, feeRatePerByte, tcClient, }) => {
    const batchInscribeTxIDs = splitBatchInscribeTx({ tcTxDetails });
    const result = [];
    const newUTXOs = [...utxos];
    for (const batch of batchInscribeTxIDs) {
        console.log("[BatchInscribe] New UTXOs for creating new tx: ", newUTXOs);
        try {
            const { commitTxHex, commitTxID, revealTxHex, revealTxID, totalFee, newUTXOs: newUTXOsTmp, selectedUTXOs } = await createInscribeTx({
                senderPrivateKey,
                utxos: newUTXOs,
                inscriptions,
                tcTxIDs: batch,
                feeRatePerByte,
                tcClient,
            });
            result.push({
                tcTxIDs: batch,
                commitTxHex,
                commitTxID,
                revealTxHex,
                revealTxID,
                totalFee,
            });
            // remove selected UTXOs to create next txs
            if (selectedUTXOs.length > 0) {
                for (const selectedUtxo of selectedUTXOs) {
                    const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n);
                    newUTXOs.splice(index, 1);
                }
            }
            // append change UTXOs to create next txs
            if (newUTXOsTmp.length > 0) {
                newUTXOs.push(...newUTXOsTmp);
            }
        }
        catch (e) {
            console.log("Error when create inscribe batch txs: ", e);
            if (result.length === 0) {
                throw e;
            }
            return result;
        }
    }
    return result;
};
/**
* createInscribeTx creates commit and reveal tx to inscribe data on Bitcoin netword.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the inscriber
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param data list of hex data need to inscribe
* @param reImbursementTCAddress TC address of the inscriber to receive gas.
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the hex commit transaction
* @returns the commit transaction id
* @returns the hex reveal transaction
* @returns the reveal transaction id
* @returns the total network fee
*/
const createInscribeTxFromAnyWallet = async ({ pubKey, utxos, inscriptions, tcTxIDs, feeRatePerByte, tcClient, cancelFn }) => {
    // const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    // const internalPubKey = toXOnly(keyPair.publicKey);
    const { address: senderAddress } = generateTaprootAddressFromPubKey(pubKey);
    // create lock script for commit tx
    const { hashLockKeyPair, hashLockRedeem, script_p2tr } = await createLockScript({
        internalPubKey: pubKey,
        tcTxIDs,
        tcClient,
    });
    // estimate fee and select UTXOs
    const estCommitTxFee = estimateTxFee(1, 2, feeRatePerByte);
    const revealVByte = getRevealVirtualSize(hashLockRedeem, script_p2tr, senderAddress, hashLockKeyPair);
    const estRevealTxFee = revealVByte * feeRatePerByte;
    const totalFee = estCommitTxFee + estRevealTxFee;
    // const totalAmount = new BigNumber(totalFee + MinSats); // MinSats for new output in the reveal tx
    // const { selectedUTXOs, totalInputAmount } = selectCardinalUTXOs(utxos, inscriptions, totalAmount);
    if (script_p2tr.address === undefined || script_p2tr.address === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_TAPSCRIPT_ADDRESS, "");
    }
    const { base64Psbt: commitPsbtB64, fee: commitTxFee, changeAmount, selectedUTXOs, indicesToSign } = createRawTxSendBTC({
        pubKey,
        utxos,
        inscriptions,
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee + MinSats) }],
        feeRatePerByte,
    });
    // sign transaction 
    const { msgTx: commitTx, msgTxID: commitTxID, msgTxHex: commitTxHex } = await handleSignPsbtWithSpecificWallet({
        base64Psbt: commitPsbtB64,
        indicesToSign: indicesToSign,
        address: senderAddress,
        isGetMsgTx: true,
        cancelFn
    });
    console.log("commitTX: ", commitTx);
    console.log("COMMITTX selectedUTXOs: ", selectedUTXOs);
    // create and sign reveal tx
    const { revealTxHex, revealTxID } = createRawRevealTx({
        internalPubKey: pubKey,
        commitTxID,
        hashLockKeyPair,
        hashLockRedeem,
        script_p2tr,
        revealTxFee: estRevealTxFee,
    });
    return {
        commitTxHex,
        commitTxID,
        revealTxHex,
        revealTxID,
        totalFee: new BigNumber(totalFee),
    };
};
const createLockScript = async ({ internalPubKey, tcTxIDs, tcClient, }) => {
    // Create a tap tree with two spend paths
    // One path should allow spending using secret
    // The other path should pay to another pubkey
    // Make random key pair for hash_lock script
    const hashLockKeyPair = ECPair$1.makeRandom({ network: tcBTCNetwork });
    // call TC node to get Tapscript and hash lock redeem
    const { hashLockScriptHex } = await tcClient.getTapScriptInfo(hashLockKeyPair.publicKey.toString("hex"), tcTxIDs);
    const hashLockScript = Buffer.from(hashLockScriptHex, "hex");
    const hashLockRedeem = {
        output: hashLockScript,
        redeemVersion: 192,
    };
    const scriptTree = hashLockRedeem;
    const script_p2tr = bitcoinjsLib.payments.p2tr({
        internalPubkey: internalPubKey,
        scriptTree,
        redeem: hashLockRedeem,
        network: tcBTCNetwork
    });
    return {
        hashLockKeyPair,
        hashLockScript,
        hashLockRedeem,
        script_p2tr
    };
};
const getRevealVirtualSizeByDataSize = (dataSize) => {
    const inputSize = InputSize + dataSize;
    return inputSize + OutputSize;
};
/**
* estimateInscribeFee estimate BTC amount need to inscribe for creating project.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param tcTxSizeByte size of tc tx (in byte)
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the total BTC fee
*/
const estimateInscribeFee = ({ tcTxSizeByte, feeRatePerByte, }) => {
    const estCommitTxFee = estimateTxFee(2, 2, feeRatePerByte);
    const revealVByte = getRevealVirtualSizeByDataSize(tcTxSizeByte / 4);
    const estRevealTxFee = revealVByte * feeRatePerByte;
    const totalFee = estCommitTxFee + estRevealTxFee;
    return { totalFee: new BigNumber(totalFee) };
};
/**
* estimateInscribeFee estimate BTC amount need to inscribe for creating project.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param tcTxSizeByte size of tc tx (in byte)
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the total BTC fee
*/
const aggregateUTXOs = async ({ tcAddress, btcAddress, utxos, tcClient, }) => {
    const txs = await tcClient.getPendingInscribeTxs(tcAddress);
    const pendingUTXOs = [];
    for (const tx of txs) {
        for (const vin of tx.Vin) {
            pendingUTXOs.push({
                tx_hash: vin.txid,
                tx_output_n: vin.vout,
                value: BNZero
            });
        }
    }
    console.log("pendingUTXOs: ", pendingUTXOs);
    const newUTXOs = [];
    for (const tx of txs) {
        const btcTxID = tx.BTCHash;
        for (let i = 0; i < tx.Vout.length; i++) {
            const vout = tx.Vout[i];
            try {
                const receiverAddress = bitcoinjsLib.address.fromOutputScript(Buffer.from(vout.scriptPubKey?.hex, "hex"), tcBTCNetwork);
                if (receiverAddress === btcAddress) {
                    newUTXOs.push({
                        tx_hash: btcTxID,
                        tx_output_n: i,
                        value: new BigNumber(toSat(vout.value))
                    });
                }
            }
            catch (e) {
                continue;
            }
        }
    }
    console.log("newUTXOs: ", newUTXOs);
    const tmpUTXOs = [...utxos, ...newUTXOs];
    console.log("tmpUTXOs: ", tmpUTXOs);
    const ids = [];
    const tmpUniqUTXOs = [];
    for (const utxo of tmpUTXOs) {
        const id = utxo.tx_hash + ":" + utxo.tx_output_n;
        console.log("id: ", id);
        if (ids.findIndex((idTmp) => idTmp === id) !== -1) {
            continue;
        }
        else {
            tmpUniqUTXOs.push(utxo);
            ids.push(id);
        }
    }
    console.log("tmpUniqUTXOs ", tmpUniqUTXOs);
    const result = [];
    for (const utxo of tmpUniqUTXOs) {
        const foundIndex = pendingUTXOs.findIndex((pendingUTXO) => {
            return pendingUTXO.tx_hash === utxo.tx_hash && pendingUTXO.tx_output_n === utxo.tx_output_n;
        });
        if (foundIndex === -1) {
            result.push(utxo);
        }
    }
    console.log("result: ", result);
    return result;
};

const increaseGasPrice = (wei) => {
    const res = wei.plus(new BigNumber(1000000000));
    return res;
};

const Mainnet = "mainnet";
const Testnet = "testnet";
const Regtest = "regtest";
const SupportedTCNetworkType = [Mainnet, Testnet, Regtest];
const DefaultEndpointTCNodeTestnet = "http://139.162.54.236:22225";
const DefaultEndpointTCNodeMainnet = "https://tc-node.trustless.computer";
const DefaultEndpointTCNodeRegtest = "";
const MethodPost = "POST";
class TcClient {
    constructor(...params) {
        this.url = DefaultEndpointTCNodeMainnet;
        this.network = Mainnet;
        this.callRequest = async (payload, methodType, method) => {
            // JSONRPCClient needs to know how to send a JSON-RPC request.
            // Tell it by passing a function to its constructor. The function must take a JSON-RPC request and send it.
            const client = new axios__default["default"].Axios({
                baseURL: this.url
            });
            const dataReq = {
                jsonrpc: "2.0",
                id: +new Date(),
                method: method,
                params: payload,
            };
            console.log("Data req: ", dataReq);
            const response = await client.post("", JSON.stringify(dataReq), {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const { status, data } = response;
            console.log("data from response: ", data);
            if (status !== 200) {
                throw new SDKError$1(ERROR_CODE$1.RPC_ERROR, data);
            }
            const dataResp = JSON.parse(data);
            console.log("Data resp: ", dataResp);
            if (dataResp.error || !dataResp.result) {
                throw new SDKError$1(ERROR_CODE$1.RPC_ERROR, data.error);
            }
            return dataResp.result;
        };
        // call to tc node to get inscribeable nonce and gas price (if need to replace previous orphan tx(s))
        this.getNonceInscribeable = async (tcAddress) => {
            const payload = [tcAddress];
            const resp = await this.callRequest(payload, MethodPost, "eth_getInscribableInfo");
            console.log("Resp getNonceInscribeable: ", resp);
            if (resp === "") {
                throw new SDKError$1(ERROR_CODE$1.RPC_GET_INSCRIBEABLE_INFO_ERROR, "response is empty");
            }
            const strs = resp.split(":");
            console.log("strs: ", strs);
            if (strs.length !== 2) {
                throw new SDKError$1(ERROR_CODE$1.RPC_GET_INSCRIBEABLE_INFO_ERROR, "response is invalid");
            }
            const gasPrice = new BigNumber(strs[1]);
            let gasPriceRes;
            if (gasPrice.eq(BNZero)) {
                gasPriceRes = -1;
            }
            else {
                gasPriceRes = increaseGasPrice(gasPrice).toNumber();
            }
            return {
                nonce: Number(strs[0]),
                gasPrice: gasPriceRes,
            };
        };
        // submitInscribeTx submits btc tx into TC node and then it will broadcast txs to Bitcoin fullnode
        this.submitInscribeTx = async (btcTxHex) => {
            const payload = [btcTxHex];
            const resp = await this.callRequest(payload, MethodPost, "eth_submitBitcoinTx");
            console.log("Resp eth_submitBitcoinTx: ", resp);
            if (resp === "") {
                throw new SDKError$1(ERROR_CODE$1.RPC_GET_INSCRIBEABLE_INFO_ERROR, "response is empty");
            }
            return {
                btcTxID: resp,
            };
        };
        // submitInscribeTx submits btc tx into TC node and then it will broadcast txs to Bitcoin fullnode
        this.getTapScriptInfo = async (hashLockPubKey, tcTxIDs) => {
            const payload = [hashLockPubKey, tcTxIDs];
            const resp = await this.callRequest(payload, MethodPost, "eth_getHashLockScript");
            console.log("Resp eth_getHashLockScript: ", resp);
            if (resp === "") {
                throw new SDKError$1(ERROR_CODE$1.RPC_GET_TAPSCRIPT_INFO, "response is empty");
            }
            return {
                hashLockScriptHex: resp,
            };
        };
        // submitInscribeTx submits btc tx into TC node and then it will broadcast txs to Bitcoin fullnode
        this.getUnInscribedTransactionByAddress = async (tcAddress) => {
            const payload = [tcAddress];
            const resp = await this.callRequest(payload, MethodPost, "eth_getUnInscribedTransactionByAddress");
            console.log("Resp eth_getUnInscribedTransactionByAddress: ", resp);
            if (resp === "") {
                throw new SDKError$1(ERROR_CODE$1.RPC_GET_TAPSCRIPT_INFO, "response is empty");
            }
            return {
                unInscribedTxIDs: resp,
            };
        };
        this.getUnInscribedTransactionDetailByAddress = async (tcAddress) => {
            const payload = [tcAddress];
            const resp = await this.callRequest(payload, MethodPost, "eth_getUnInscribedTransactionDetailByAddress");
            console.log("Resp getUnInscribedTransactionDetailByAddress: ", resp);
            if (resp === "") {
                throw new SDKError$1(ERROR_CODE$1.RPC_GET_TAPSCRIPT_INFO, "response is empty");
            }
            const txDetails = [];
            console.log("resp: ", resp);
            for (const tx of resp) {
                txDetails.push({
                    Nonce: tx.Nonce,
                    GasPrice: tx.GasPrice,
                    Gas: tx.Gas,
                    To: tx.To,
                    Value: tx.Value,
                    Input: tx.Input,
                    V: tx.V,
                    R: new BigNumber(tx.R),
                    S: new BigNumber(tx.S),
                    Hash: tx.Hash,
                    From: tx.From,
                    Type: tx.Type,
                });
            }
            return {
                unInscribedTxDetails: txDetails,
            };
        };
        // getTCTxByHash get TC tx 
        this.getTCTxByHash = async (tcTxID) => {
            const payload = [tcTxID];
            const resp = await this.callRequest(payload, MethodPost, "eth_getTransactionByHash");
            console.log("Resp eth_getTransactionByHash: ", resp);
            if (resp === "") {
                throw new SDKError$1(ERROR_CODE$1.RPC_GET_TAPSCRIPT_INFO, "response is empty");
            }
            if (resp.blockHash) {
                const receipt = await this.getTCTxReceipt(tcTxID);
                resp.status = receipt.status;
            }
            return resp;
        };
        // getTCTxReceipt get TC tx receipt
        this.getTCTxReceipt = async (tcTxID) => {
            const payload = [tcTxID];
            const resp = await this.callRequest(payload, MethodPost, "eth_getTransactionReceipt");
            console.log("Resp eth_getTransactionByHash: ", resp);
            if (resp === "") {
                throw new SDKError$1(ERROR_CODE$1.RPC_GET_TAPSCRIPT_INFO, "response is empty");
            }
            return resp;
        };
        // getPendingInscribeTxs returns pending BTC inscribe txs in TC node (both broadcasted and holding)
        this.getPendingInscribeTxs = async (tcAddress) => {
            const payload = [tcAddress];
            const resp = await this.callRequest(payload, MethodPost, "eth_getPendingInscribedUTXOByAddress");
            console.log("Resp eth_getPendingInscribedUTXOByAddress: ", resp);
            if (resp === "") {
                throw new SDKError$1(ERROR_CODE$1.RPC_GET_TAPSCRIPT_INFO, "response is empty");
            }
            const btcTx = [];
            for (const info of resp) {
                btcTx.push(info.Commit);
                btcTx.push(info.Reveal);
            }
            return btcTx;
        };
        if (params.length === 0) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS);
        }
        // check network type
        if (!SupportedTCNetworkType.includes(params[0])) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_NETWORK_TYPE);
        }
        this.network = params[0];
        if (params.length === 2) {
            this.url = params[1];
            return this;
        }
        else if (params.length === 1) {
            switch (this.network) {
                case Mainnet: {
                    this.url = DefaultEndpointTCNodeMainnet;
                    return this;
                }
                case Testnet: {
                    this.url = DefaultEndpointTCNodeTestnet;
                    return this;
                }
                case Regtest: {
                    this.url = DefaultEndpointTCNodeRegtest;
                    return this;
                }
            }
        }
    }
}

exports.RequestFunction = void 0;
(function (RequestFunction) {
    RequestFunction["sign"] = "sign";
    RequestFunction["request"] = "request";
})(exports.RequestFunction || (exports.RequestFunction = {}));
exports.RequestMethod = void 0;
(function (RequestMethod) {
    RequestMethod["account"] = "account";
})(exports.RequestMethod || (exports.RequestMethod = {}));

const URL = "https://trustlesswallet.io";

function isPrivateKey(privateKey) {
    let isValid = false;
    try {
        // init key pair from senderPrivateKey
        const keyPair = ECPair.fromPrivateKey(privateKey);
        // Tweak the original keypair
        const tweakedSigner = tweakSigner(keyPair, { network: tcBTCNetwork });
        // Generate an address from the tweaked public key
        const p2pktr = bitcoinjsLib.payments.p2tr({
            pubkey: toXOnly(tweakedSigner.publicKey),
            network: tcBTCNetwork
        });
        const senderAddress = p2pktr.address ? p2pktr.address : "";
        isValid = senderAddress !== "";
    }
    catch (e) {
        isValid = false;
    }
    return isValid;
}
class Validator {
    constructor(label, value) {
        if (!label && typeof label !== "string") {
            throw new SDKError(ERROR_CODE.INVALID_VALIDATOR_LABEL);
        }
        this.value = value;
        this.label = label;
        this.isRequired = false;
    }
    _throwError(message) {
        throw new Error(`Validating "${this.label}" failed: ${message}. Found ${this.value} (type of ${typeof this.value})`);
    }
    _isDefined() {
        return this.value !== null && this.value !== undefined;
    }
    _onCondition(condition, message) {
        if (((!this.isRequired && this._isDefined()) || this.isRequired) &&
            !condition()) {
            this._throwError(message);
        }
        return this;
    }
    required(message = "Required") {
        this.isRequired = true;
        return this._onCondition(() => this._isDefined(), message);
    }
    string(message = "Must be string") {
        return this._onCondition(() => typeof this.value === "string", message);
    }
    buffer(message = "Must be buffer") {
        return this._onCondition(() => Buffer.isBuffer(this.value), message);
    }
    function(message = "Must be a function") {
        return this._onCondition(() => typeof this.value === "function", message);
    }
    boolean(message = "Must be boolean") {
        return this._onCondition(() => typeof this.value === "boolean", message);
    }
    number(message = "Must be number") {
        return this._onCondition(() => Number.isFinite(this.value), message);
    }
    array(message = "Must be array") {
        return this._onCondition(() => this.value instanceof Array, message);
    }
    privateKey(message = "Invalid private key") {
        return this._onCondition(() => this.buffer() && isPrivateKey(this.value), message);
    }
    mnemonic(message = "Invalid mnemonic") {
        return this._onCondition(() => ethers.utils.isValidMnemonic(this.value), message);
    }
}

const doubleHash = (key) => {
    const hash = CryptoJS__namespace.SHA256(key);
    return CryptoJS__namespace.SHA256(hash).toString();
};
const encryptAES = (text, key) => {
    const password = doubleHash(key);
    return CryptoJS__namespace.AES.encrypt(text, password).toString();
};
const decryptAES = (cipherText, key) => {
    const password = doubleHash(key);
    const decrypted = CryptoJS__namespace.AES.decrypt(cipherText, password);
    if (decrypted) {
        try {
            const str = decrypted.toString(CryptoJS__namespace.enc.Utf8);
            if (str.length > 0) {
                return str;
            }
            else {
                throw new SDKError(ERROR_CODE.DECRYPT);
            }
        }
        catch (e) {
            throw new SDKError(ERROR_CODE.DECRYPT);
        }
    }
    throw new SDKError(ERROR_CODE.DECRYPT);
};

const window = globalThis || global;
const openWindow = ({ url = URL, search, target }) => {
    if (window) {
        setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window?.open(`${url}/${search}`, target);
        }, 500);
    }
};
const signTransaction = (payload) => {
    new Validator("Transaction hash", payload.hash).string().required();
    new Validator("Method", payload.method).string().required();
    const _target = payload.target || "_blank";
    if (window && URLSearchParams) {
        let search = `?function=${exports.RequestFunction.sign}&hash=${payload.hash}&method=${payload.method}&dappURL=${payload.dappURL}`;
        if (payload.isRedirect) {
            search += `&isRedirect=${payload.isRedirect}`;
        }
        openWindow({
            search,
            target: _target
        });
    }
};
const actionRequest = async (payload) => {
    new Validator("Missing method", payload.method).string().required();
    new Validator("Missing redirect url", payload.redirectURL).string().required();
    const _target = payload.target || "_parent";
    if (window && URLSearchParams) {
        const search = `?function=${exports.RequestFunction.request}&method=${payload.method}&redirectURL=${payload.redirectURL}`;
        openWindow({
            search,
            target: _target
        });
    }
};
const requestAccountResponse = async (payload) => {
    new Validator("Missing redirect url", payload.redirectURL).string().required();
    new Validator("Missing tc address", payload.tcAddress).string().required();
    new Validator("Missing taproot address", payload.tpAddress).string().required();
    const _target = payload.target || "_parent";
    const redirectURL = payload.redirectURL;
    // const lastChar = redirectURL.substr(redirectURL.length - 1);
    // const divide = "/";
    // if (lastChar !== divide) {
    //     redirectURL = redirectURL + divide;
    // }
    if (window && URLSearchParams) {
        const search = `?tcAddress=${payload.tcAddress}&tpAddress=${payload.tpAddress}&target=${_target}`;
        openWindow({
            url: redirectURL,
            search: search,
            target: _target
        });
    }
};

var RequestFunction;
(function (RequestFunction) {
    RequestFunction["sign"] = "sign";
    RequestFunction["request"] = "request";
})(RequestFunction || (RequestFunction = {}));
var RequestMethod;
(function (RequestMethod) {
    RequestMethod["account"] = "account";
})(RequestMethod || (RequestMethod = {}));

const deriveHDNodeByIndex$1 = (payload) => {
    const hdNode = ethers.ethers.utils.HDNode
        .fromMnemonic(payload.mnemonic)
        .derivePath(ETHDerivationPath$1 + "/" + payload.index);
    const privateKey = hdNode.privateKey;
    const address = hdNode.address;
    const accountName = payload.name || `Account ${payload.index + 1}`;
    return {
        name: accountName,
        index: payload.index,
        privateKey: privateKey,
        address: address,
    };
};
const validateHDWallet$1 = (wallet, methodName) => {
    new Validator(`${methodName}-` + "validate-mnemonic", wallet?.mnemonic).mnemonic().required();
    new Validator(`${methodName}-` + "validate-name", wallet?.name).string().required();
    new Validator(`${methodName}-` + "validate-nodes", wallet?.nodes).required();
    new Validator(`${methodName}-` + "validate-btcPrivateKey", wallet?.btcPrivateKey).required();
    if (wallet?.nodes) {
        for (const node of wallet.nodes) {
            new Validator(`${methodName}-` + "validate-derive-name", node.name).required();
            new Validator(`${methodName}-` + "validate-derive-index", node.index).required();
            new Validator(`${methodName}-` + "validate-derive-privateKey", node.privateKey).required();
            new Validator(`${methodName}-` + "validate-derive-address", node.address).required();
        }
    }
};
const getStorageHDWalletCipherText$1 = () => {
    return tcStorage.get(StorageKeys.HDWallet);
};
const getStorageHDWallet$1 = async (password) => {
    const cipherText = await getStorageHDWalletCipherText$1();
    if (!cipherText) {
        return undefined;
    }
    const rawText = decryptAES(cipherText, password);
    const wallet = JSON.parse(rawText);
    validateHDWallet$1(wallet, "getStorageHDWallet");
    return wallet;
};
const setStorageHDWallet$1 = async (wallet, password) => {
    const cipherText = encryptAES(JSON.stringify(wallet), password);
    await tcStorage.set(StorageKeys.HDWallet, cipherText);
};

class HDWallet$1 {
    constructor() {
        this.set = (wallet) => {
            validateHDWallet$1(wallet, "hdset");
            this.name = wallet.name;
            this.mnemonic = wallet.mnemonic;
            this.nodes = wallet.nodes;
            this.deletedIndexs = wallet.deletedIndexs;
            this.btcPrivateKey = wallet.btcPrivateKey;
        };
        this.saveWallet = async (wallet, password) => {
            this.set(wallet);
            await setStorageHDWallet$1(wallet, password);
        };
        this.createNewAccount = async ({ password, name }) => {
            const wallet = await getStorageHDWallet$1(password);
            validateHDWallet$1(wallet, "create-new-account");
            if (!wallet)
                return;
            const { mnemonic, nodes, deletedIndexs } = wallet;
            const latestNode = maxBy__default["default"](nodes, item => Number(item.index));
            let newNodeIndex = (latestNode?.index || 0) + 1;
            for (const deletedIndex of deletedIndexs) {
                if (newNodeIndex <= deletedIndex) {
                    newNodeIndex += 1;
                }
            }
            const childNode = deriveHDNodeByIndex$1({
                mnemonic,
                index: newNodeIndex,
                name
            });
            nodes.push(childNode);
            await this.saveWallet(wallet, password);
        };
        this.deletedAccount = async ({ password, address }) => {
            const wallet = await getStorageHDWallet$1(password);
            validateHDWallet$1(wallet, "delete-account");
            if (!wallet)
                return;
            const { nodes, deletedIndexs } = wallet;
            const node = nodes.find(node => node.address.toLowerCase() === address.toLowerCase());
            if (!node) {
                throw new SDKError(ERROR_CODE.CANNOT_FIND_ACCOUNT);
            }
            deletedIndexs.push(node.index);
            const newNodes = nodes.filter(node => node.address.toLowerCase() !== address.toLowerCase());
            await this.saveWallet({
                ...wallet,
                nodes: newNodes
            }, password);
        };
        this.restore = async (password) => {
            new Validator("restore-password: ", password).string().required();
            try {
                const wallet = await getStorageHDWallet$1(password);
                return wallet;
            }
            catch (error) {
                let message = "";
                if (error instanceof Error) {
                    message = error.message;
                }
                throw new SDKError(ERROR_CODE.RESTORE_HD_WALLET, message);
            }
        };
        this.name = undefined;
        this.mnemonic = undefined;
        this.nodes = undefined;
        this.deletedIndexs = undefined;
        this.btcPrivateKey = undefined;
    }
}

const ETHDerivationPath$1 = "m/44'/60'/0'/0";
const BTCTaprootDerivationPath$1 = "m/86'/0'/0'/0/0";

bitcoinjsLib.initEccLib(ecc__namespace);
const bip32$1 = BIP32Factory__default["default"](ecc__namespace);
const validateMnemonicBTC$1 = (mnemonic) => {
    return bip39__namespace.validateMnemonic(mnemonic);
};
const generateTaprootHDNodeFromMnemonic$1 = async (mnemonic) => {
    const isValid = validateMnemonicBTC$1(mnemonic);
    if (!isValid) {
        throw new SDKError(ERROR_CODE.MNEMONIC_GEN_TAPROOT);
    }
    const seed = await bip39__namespace.mnemonicToSeed(mnemonic);
    const rootKey = bip32$1.fromSeed(seed);
    const childNode = rootKey.derivePath(BTCTaprootDerivationPath$1);
    const { address } = bitcoinjsLib.payments.p2tr({
        internalPubkey: toXOnly(childNode.publicKey),
    });
    const privateKeyBuffer = childNode.privateKey;
    if (!privateKeyBuffer || !address) {
        throw new SDKError(ERROR_CODE.TAPROOT_FROM_MNEMONIC);
    }
    const privateKeyStr = convertPrivateKey(privateKeyBuffer);
    return privateKeyStr;
};

class MasterWallet {
    constructor() {
        this.restoreHDWallet = async (password) => {
            const hdWalletIns = new HDWallet$1();
            const wallet = await hdWalletIns.restore(password);
            if (wallet) {
                hdWalletIns.set({
                    ...wallet
                });
                this._hdWallet = hdWalletIns;
                return wallet;
            }
        };
        this.load = async (password) => {
            new Validator("password", password).string().required();
            const hdWallet = await this.restoreHDWallet(password);
            return {
                hdWallet
            };
        };
        this.getHDWallet = () => {
            new Validator("Get HDWallet", this._hdWallet).required("Please restore wallet.");
            return this._hdWallet;
        };
        this.getBTCPrivateKey = () => {
            return this._hdWallet?.btcPrivateKey;
        };
        this._hdWallet = undefined;
        this._masterless = undefined;
    }
}

class HDWallet {
    constructor() {
        this.set = (wallet) => {
            validateHDWallet$1(wallet, "hdset");
            this.name = wallet.name;
            this.mnemonic = wallet.mnemonic;
            this.nodes = wallet.nodes;
            this.deletedIndexs = wallet.deletedIndexs;
            this.btcPrivateKey = wallet.btcPrivateKey;
        };
        this.saveWallet = async (wallet, password) => {
            this.set(wallet);
            await setStorageHDWallet$1(wallet, password);
        };
        this.createNewAccount = async ({ password, name }) => {
            const wallet = await getStorageHDWallet$1(password);
            validateHDWallet$1(wallet, "create-new-account");
            if (!wallet)
                return;
            const { mnemonic, nodes, deletedIndexs } = wallet;
            const latestNode = maxBy__default["default"](nodes, item => Number(item.index));
            let newNodeIndex = (latestNode?.index || 0) + 1;
            for (const deletedIndex of deletedIndexs) {
                if (newNodeIndex <= deletedIndex) {
                    newNodeIndex += 1;
                }
            }
            const childNode = deriveHDNodeByIndex$1({
                mnemonic,
                index: newNodeIndex,
                name
            });
            nodes.push(childNode);
            await this.saveWallet(wallet, password);
        };
        this.deletedAccount = async ({ password, address }) => {
            const wallet = await getStorageHDWallet$1(password);
            validateHDWallet$1(wallet, "delete-account");
            if (!wallet)
                return;
            const { nodes, deletedIndexs } = wallet;
            const node = nodes.find(node => node.address.toLowerCase() === address.toLowerCase());
            if (!node) {
                throw new SDKError(ERROR_CODE.CANNOT_FIND_ACCOUNT);
            }
            deletedIndexs.push(node.index);
            const newNodes = nodes.filter(node => node.address.toLowerCase() !== address.toLowerCase());
            await this.saveWallet({
                ...wallet,
                nodes: newNodes
            }, password);
        };
        this.restore = async (password) => {
            new Validator("restore-password: ", password).string().required();
            try {
                const wallet = await getStorageHDWallet$1(password);
                return wallet;
            }
            catch (error) {
                let message = "";
                if (error instanceof Error) {
                    message = error.message;
                }
                throw new SDKError(ERROR_CODE.RESTORE_HD_WALLET, message);
            }
        };
        this.name = undefined;
        this.mnemonic = undefined;
        this.nodes = undefined;
        this.deletedIndexs = undefined;
        this.btcPrivateKey = undefined;
    }
}

class Masterless {
    constructor() {
        this.name = undefined;
        this.privateKey = undefined;
        this.address = undefined;
    }
}

const ETHDerivationPath = "m/44'/60'/0'/0";
const BTCTaprootDerivationPath = "m/86'/0'/0'/0/0";

const deriveHDNodeByIndex = (payload) => {
    const hdNode = ethers.ethers.utils.HDNode
        .fromMnemonic(payload.mnemonic)
        .derivePath(ETHDerivationPath$1 + "/" + payload.index);
    const privateKey = hdNode.privateKey;
    const address = hdNode.address;
    const accountName = payload.name || `Account ${payload.index + 1}`;
    return {
        name: accountName,
        index: payload.index,
        privateKey: privateKey,
        address: address,
    };
};
const randomMnemonic = async () => {
    const wallet = ethers.ethers.Wallet.createRandom();
    const mnemonic = wallet.mnemonic.phrase;
    new Validator("Generate mnemonic", mnemonic).mnemonic().required();
    const btcPrivateKey = await generateTaprootHDNodeFromMnemonic$1(mnemonic);
    const childNode = deriveHDNodeByIndex({
        mnemonic,
        index: 0,
        name: undefined
    });
    return {
        name: "Anon",
        mnemonic,
        nodes: [childNode],
        btcPrivateKey,
        deletedIndexs: []
    };
};
const validateHDWallet = (wallet, methodName) => {
    new Validator(`${methodName}-` + "validate-mnemonic", wallet?.mnemonic).mnemonic().required();
    new Validator(`${methodName}-` + "validate-name", wallet?.name).string().required();
    new Validator(`${methodName}-` + "validate-nodes", wallet?.nodes).required();
    new Validator(`${methodName}-` + "validate-btcPrivateKey", wallet?.btcPrivateKey).required();
    if (wallet?.nodes) {
        for (const node of wallet.nodes) {
            new Validator(`${methodName}-` + "validate-derive-name", node.name).required();
            new Validator(`${methodName}-` + "validate-derive-index", node.index).required();
            new Validator(`${methodName}-` + "validate-derive-privateKey", node.privateKey).required();
            new Validator(`${methodName}-` + "validate-derive-address", node.address).required();
        }
    }
};
const getStorageHDWalletCipherText = () => {
    return tcStorage.get(StorageKeys.HDWallet);
};
const getStorageHDWallet = async (password) => {
    const cipherText = await getStorageHDWalletCipherText();
    if (!cipherText) {
        return undefined;
    }
    const rawText = decryptAES(cipherText, password);
    const wallet = JSON.parse(rawText);
    validateHDWallet(wallet, "getStorageHDWallet");
    return wallet;
};
const setStorageHDWallet = async (wallet, password) => {
    const cipherText = encryptAES(JSON.stringify(wallet), password);
    await tcStorage.set(StorageKeys.HDWallet, cipherText);
};

bitcoinjsLib.initEccLib(ecc__namespace);
const bip32 = BIP32Factory__default["default"](ecc__namespace);
const validateMnemonicBTC = (mnemonic) => {
    return bip39__namespace.validateMnemonic(mnemonic);
};
const generateTaprootHDNodeFromMnemonic = async (mnemonic) => {
    const isValid = validateMnemonicBTC(mnemonic);
    if (!isValid) {
        throw new SDKError(ERROR_CODE.MNEMONIC_GEN_TAPROOT);
    }
    const seed = await bip39__namespace.mnemonicToSeed(mnemonic);
    const rootKey = bip32.fromSeed(seed);
    const childNode = rootKey.derivePath(BTCTaprootDerivationPath$1);
    const { address } = bitcoinjsLib.payments.p2tr({
        internalPubkey: toXOnly(childNode.publicKey),
    });
    const privateKeyBuffer = childNode.privateKey;
    if (!privateKeyBuffer || !address) {
        throw new SDKError(ERROR_CODE.TAPROOT_FROM_MNEMONIC);
    }
    const privateKeyStr = convertPrivateKey(privateKeyBuffer);
    return privateKeyStr;
};

exports.BNZero = BNZero;
exports.BTCTaprootDerivationPath = BTCTaprootDerivationPath;
exports.BlockStreamURL = BlockStreamURL;
exports.DummyUTXOValue = DummyUTXOValue;
exports.ECPair = ECPair$1;
exports.ERROR_CODE = ERROR_CODE$1;
exports.ERROR_MESSAGE = ERROR_MESSAGE$1;
exports.ETHDerivationPath = ETHDerivationPath;
exports.HDWallet = HDWallet;
exports.InputSize = InputSize;
exports.Mainnet = Mainnet;
exports.MasterWallet = MasterWallet;
exports.Masterless = Masterless;
exports.MinSats = MinSats;
exports.NetworkType = NetworkType$1;
exports.OutputSize = OutputSize;
exports.Regtest = Regtest;
exports.SDKError = SDKError$1;
exports.StorageService = StorageService;
exports.TcClient = TcClient;
exports.Testnet = Testnet;
exports.URL = URL;
exports.Validator = Validator$1;
exports.WalletType = WalletType;
exports.actionRequest = actionRequest;
exports.aggregateUTXOs = aggregateUTXOs;
exports.broadcastTx = broadcastTx;
exports.convertPrivateKey = convertPrivateKey$1;
exports.convertPrivateKeyFromStr = convertPrivateKeyFromStr;
exports.createBatchInscribeTxs = createBatchInscribeTxs;
exports.createDummyUTXOFromCardinal = createDummyUTXOFromCardinal;
exports.createInscribeTx = createInscribeTx;
exports.createInscribeTxFromAnyWallet = createInscribeTxFromAnyWallet;
exports.createLockScript = createLockScript;
exports.createPSBTToBuy = createPSBTToBuy;
exports.createPSBTToSell = createPSBTToSell;
exports.createRawPSBTToSell = createRawPSBTToSell;
exports.createRawRevealTx = createRawRevealTx;
exports.createRawTx = createRawTx;
exports.createRawTxDummyUTXOForSale = createRawTxDummyUTXOForSale;
exports.createRawTxDummyUTXOFromCardinal = createRawTxDummyUTXOFromCardinal;
exports.createRawTxSendBTC = createRawTxSendBTC;
exports.createRawTxSplitFundFromOrdinalUTXO = createRawTxSplitFundFromOrdinalUTXO;
exports.createRawTxToPrepareUTXOsToBuyMultiInscs = createRawTxToPrepareUTXOsToBuyMultiInscs;
exports.createTx = createTx;
exports.createTxFromAnyWallet = createTxFromAnyWallet;
exports.createTxSendBTC = createTxSendBTC;
exports.createTxSplitFundFromOrdinalUTXO = createTxSplitFundFromOrdinalUTXO;
exports.createTxWithSpecificUTXOs = createTxWithSpecificUTXOs;
exports.decryptAES = decryptAES$1;
exports.decryptWallet = decryptWallet;
exports.deriveETHWallet = deriveETHWallet;
exports.deriveHDNodeByIndex = deriveHDNodeByIndex;
exports.derivePasswordWallet = derivePasswordWallet;
exports.deriveSegwitWallet = deriveSegwitWallet;
exports.encryptAES = encryptAES$1;
exports.encryptWallet = encryptWallet;
exports.estimateInscribeFee = estimateInscribeFee;
exports.estimateNumInOutputs = estimateNumInOutputs;
exports.estimateNumInOutputsForBuyInscription = estimateNumInOutputsForBuyInscription;
exports.estimateTxFee = estimateTxFee;
exports.filterAndSortCardinalUTXOs = filterAndSortCardinalUTXOs;
exports.findExactValueUTXO = findExactValueUTXO;
exports.fromSat = fromSat;
exports.generateP2PKHKeyFromRoot = generateP2PKHKeyFromRoot;
exports.generateP2PKHKeyPair = generateP2PKHKeyPair;
exports.generateTaprootAddress = generateTaprootAddress;
exports.generateTaprootAddressFromPubKey = generateTaprootAddressFromPubKey;
exports.generateTaprootHDNodeFromMnemonic = generateTaprootHDNodeFromMnemonic;
exports.generateTaprootKeyPair = generateTaprootKeyPair;
exports.getBTCBalance = getBTCBalance;
exports.getBitcoinKeySignContent = getBitcoinKeySignContent;
exports.getStorageHDWallet = getStorageHDWallet;
exports.getStorageHDWalletCipherText = getStorageHDWalletCipherText;
exports.handleSignPsbtWithSpecificWallet = handleSignPsbtWithSpecificWallet;
exports.importBTCPrivateKey = importBTCPrivateKey;
exports.increaseGasPrice = increaseGasPrice;
exports.prepareUTXOsToBuyMultiInscriptions = prepareUTXOsToBuyMultiInscriptions;
exports.randomMnemonic = randomMnemonic;
exports.reqBuyInscription = reqBuyInscription;
exports.reqBuyInscriptionFromAnyWallet = reqBuyInscriptionFromAnyWallet;
exports.reqBuyMultiInscriptions = reqBuyMultiInscriptions;
exports.reqBuyMultiInscriptionsFromAnyWallet = reqBuyMultiInscriptionsFromAnyWallet;
exports.reqListForSaleInscFromAnyWallet = reqListForSaleInscFromAnyWallet;
exports.reqListForSaleInscription = reqListForSaleInscription;
exports.requestAccountResponse = requestAccountResponse;
exports.selectCardinalUTXOs = selectCardinalUTXOs;
exports.selectInscriptionUTXO = selectInscriptionUTXO;
exports.selectTheSmallestUTXO = selectTheSmallestUTXO;
exports.selectUTXOs = selectUTXOs;
exports.selectUTXOsToCreateBuyTx = selectUTXOsToCreateBuyTx;
exports.setBTCNetwork = setBTCNetwork;
exports.setStorageHDWallet = setStorageHDWallet;
exports.setupConfig = setupConfig;
exports.signByETHPrivKey = signByETHPrivKey;
exports.signPSBT = signPSBT;
exports.signPSBT2 = signPSBT2;
exports.signTransaction = signTransaction;
exports.splitBatchInscribeTx = splitBatchInscribeTx;
exports.tapTweakHash = tapTweakHash$1;
exports.toSat = toSat;
exports.toXOnly = toXOnly$1;
exports.tweakSigner = tweakSigner$1;
exports.validateHDWallet = validateHDWallet;
exports.validateMnemonicBTC = validateMnemonicBTC;
//# sourceMappingURL=index.js.map
