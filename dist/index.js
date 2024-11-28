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

// const BlockStreamURL = "https://blockstream.info/api";
const MinSats = 1000; // TODO: update
const DummyUTXOValue = 1000;
const InputSize = 68;
const OutputSize = 43;
const BNZero = new BigNumber(0);
const MinSats2 = 546;
const MinSats3 = 796;
// const MinSats2 = 333;
const DefaultSequence = 4294967295;
const DefaultSequenceRBF = 4294967293;
const MaxTxSize = 357376; // 349 KB
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
    NOT_FOUND_TX_TO_RBF: "-30",
    COMMIT_TX_EMPTY: "-31",
    REVEAL_TX_EMPTY: "-32",
    OLD_VIN_EMPTY: "-33",
    INVALID_NEW_FEE_RBF: "-34",
    GET_UTXO_VALUE_ERR: "-35",
    IS_NOT_RBFABLE: "-36",
    INVALID_BTC_ADDRESS_TYPE: "-37",
    MNEMONIC_GEN_SEGWIT: "-38",
    SEGWIT_FROM_MNEMONIC: "-39",
    RESTORE_MASTERLESS_WALLET: "-40",
    CANNOT_CREATE_ACCOUNT: "-41",
    HEX_TX_IS_EMPTY: "-42",
    EXCEED_TX_SIZE: "-43",
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
        message: "Incorrect password.",
        desc: "Incorrect password.",
    },
    [ERROR_CODE$1.TAPROOT_FROM_MNEMONIC]: {
        message: "Generate private key by mnemonic error.",
        desc: "Generate private key by mnemonic error.",
    },
    [ERROR_CODE$1.CANNOT_FIND_ACCOUNT]: {
        message: "Can not find account.",
        desc: "an not find account.",
    },
    [ERROR_CODE$1.NOT_FOUND_TX_TO_RBF]: {
        message: "BTC transaction was not found from TC node.",
        desc: "BTC transaction was not found from TC node.",
    },
    [ERROR_CODE$1.COMMIT_TX_EMPTY]: {
        message: "Commit tx need to RBF is empty.",
        desc: "Commit tx need to RBF is empty.",
    },
    [ERROR_CODE$1.REVEAL_TX_EMPTY]: {
        message: "Reveal tx need to RBF is empty.",
        desc: "Reveal tx need to RBF is empty.",
    },
    [ERROR_CODE$1.OLD_VIN_EMPTY]: {
        message: "Can not get vin from inscribe tx to RBF.",
        desc: "Can not get vin from inscribe tx to RBF.",
    },
    [ERROR_CODE$1.INVALID_NEW_FEE_RBF]: {
        message: "New fee for RBF tx must be greater than the old one.",
        desc: "New fee for RBF tx must be greater than the old one.",
    },
    [ERROR_CODE$1.GET_UTXO_VALUE_ERR]: {
        message: "Get UTXO value from blockstream not found.",
        desc: "Get UTXO value from blockstream not found.",
    },
    [ERROR_CODE$1.IS_NOT_RBFABLE]: {
        message: "This transaction doesn't support to speed up.",
        desc: "This transaction doesn't support to speed up.",
    },
    [ERROR_CODE$1.INVALID_BTC_ADDRESS_TYPE]: {
        message: "Bitcoin address is invalid or not supported.",
        desc: "Bitcoin address is invalid or not supported.",
    },
    [ERROR_CODE$1.MNEMONIC_GEN_TAPROOT]: {
        message: "Gen taproot from mnemonic error.",
        desc: "Gen taproot from mnemonic error.",
    },
    [ERROR_CODE$1.MNEMONIC_GEN_SEGWIT]: {
        message: "Gen segwit from mnemonic error.",
        desc: "Gen segwit from mnemonic error.",
    },
    [ERROR_CODE$1.SEGWIT_FROM_MNEMONIC]: {
        message: "Generate private key by mnemonic error.",
        desc: "Generate private key by mnemonic error.",
    },
    [ERROR_CODE$1.RESTORE_MASTERLESS_WALLET]: {
        message: "Restore masterless wallet error.",
        desc: "Restore masterless wallet error.",
    },
    [ERROR_CODE$1.CANNOT_CREATE_ACCOUNT]: {
        message: "Create account error.",
        desc: "Create account error.",
    },
    [ERROR_CODE$1.HEX_TX_IS_EMPTY]: {
        message: "TC transaction hex is empty.",
        desc: "Create account error.",
    },
    [ERROR_CODE$1.EXCEED_TX_SIZE]: {
        message: "TC transaction size is exceed.",
        desc: "TC transaction size is exceed.",
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
* estimateTxFee estimates the transaction fee
* @param numIns number of inputs in the transaction
* @param numOuts number of outputs in the transaction, only normal outputs
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns returns the estimated transaction fee in satoshi
*/
const estimateTxTransferSRC20Fee = (numIns, numOuts, feeRatePerByte) => {
    const fee = (68 * numIns + 43 * numOuts + 2 * (33 * 3)) * feeRatePerByte;
    return fee;
};
/**
* estimateTxSize estimates the transaction fee
* @param numIns number of inputs in the transaction
* @param numOuts number of outputs in the transaction
* @returns returns the estimated transaction size in byte
*/
const estimateTxSize = (numIns, numOuts) => {
    const size = (68 * numIns + 43 * numOuts);
    return size;
};
/**
* estimateNumInOutputs estimates number of inputs and outputs by parameters:
* @param inscriptionID id of inscription to send (if any)
* @param sendAmount satoshi amount need to send
* @param isUseInscriptionPayFee use inscription output coin to pay fee or not
* @returns returns the estimated number of inputs and outputs in the transaction
*/
const estimateNumInOutputs = (inscriptionID, sendAmount, isUseInscriptionPayFee, lenPaymentInfos) => {
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
    if (lenPaymentInfos > 0) {
        numOuts = lenPaymentInfos + 1;
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
const selectUTXOs = (utxos, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFee, isSelectUTXOs, numPaymentInfos) => {
    let resultUTXOs = [];
    let normalUTXOs = [];
    let inscriptionUTXO = null;
    let inscriptionInfo = null;
    let valueOutInscription = BNZero;
    let changeAmount = BNZero;
    let maxAmountInsTransfer = BNZero;
    let totalInputAmount = BNZero;
    // convert feeRate to interger
    feeRatePerByte = Math.round(feeRatePerByte);
    console.log("selectUTXOs utxos: ", { utxos: utxos, inscriptions: inscriptions, feeRatePerByte: feeRatePerByte, sendAmount: sendAmount, isUseInscriptionPayFeeParam: isUseInscriptionPayFee });
    // isSelectUTXOs is able is false only when sendInscriptionID is empty
    if (sendInscriptionID !== "") {
        isSelectUTXOs = true;
    }
    if (!isSelectUTXOs) {
        resultUTXOs = [...utxos];
        for (const utxo of utxos) {
            totalInputAmount = totalInputAmount.plus(utxo.value);
        }
    }
    else {
        // estimate fee
        const { numIns, numOuts } = estimateNumInOutputs(sendInscriptionID, sendAmount, isUseInscriptionPayFee, numPaymentInfos);
        const estFee = new BigNumber(estimateTxFee(numIns, numOuts, feeRatePerByte));
        console.log("selectUTXOs estFee: ", { estFee: estFee, numIns: numIns, numOuts: numOuts, feeRatePerByte: feeRatePerByte });
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
        console.log("selectUTXOs totalSendAmount: ", totalSendAmount);
        if (totalSendAmount.gt(BNZero)) {
            const { selectedUTXOs, remainUTXOs, totalInputAmount: amt } = selectCardinalUTXOs(normalUTXOs, {}, totalSendAmount);
            resultUTXOs.push(...selectedUTXOs);
            totalInputAmount = amt;
            console.log("selectedUTXOs: ", selectedUTXOs);
            console.log("isUseInscriptionPayFee: ", isUseInscriptionPayFee);
            console.log("totalInputAmount: ", totalInputAmount.toNumber());
            if (!isUseInscriptionPayFee) {
                // re-estimate fee with exact number of inputs and outputs
                const { numIns, numOuts } = estimateNumInOutputs(sendInscriptionID, sendAmount, isUseInscriptionPayFee, numPaymentInfos);
                const feeRes = new BigNumber(estimateTxFee(resultUTXOs.length, numOuts, feeRatePerByte));
                console.log("feeRes: ", feeRes);
                if (sendAmount.plus(feeRes).gt(totalInputAmount)) {
                    // need to select extra UTXOs
                    const { selectedUTXOs: extraUTXOs, totalInputAmount: extraAmt } = selectCardinalUTXOs(remainUTXOs, {}, sendAmount.plus(feeRes).minus(totalInputAmount));
                    resultUTXOs.push(...extraUTXOs);
                    console.log("extraUTXOs: ", extraUTXOs);
                    totalInputAmount = totalInputAmount.plus(extraAmt);
                }
            }
        }
    }
    // re-estimate fee with exact number of inputs and outputs
    const estNumRes = estimateNumInOutputs(sendInscriptionID, sendAmount, isUseInscriptionPayFee, numPaymentInfos);
    let feeRes = new BigNumber(estimateTxFee(resultUTXOs.length, estNumRes.numOuts, feeRatePerByte));
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
* @param sendInscriptionInfos list of inscription IDs and receiver addresses
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
const selectUTXOsV2 = (utxos, inscriptions, sendInscriptionInfos, sendBTCInfos, feeRatePerByte) => {
    let resultUTXOs = [];
    let normalUTXOs = [];
    let changeAmount = BNZero;
    let totalInputAmount = BNZero;
    // convert feeRate to interger
    feeRatePerByte = Math.round(feeRatePerByte);
    console.log("selectUTXOs utxos: ", { utxos: utxos, inscriptions: inscriptions, feeRatePerByte: feeRatePerByte });
    // estimate fee
    const numIns = sendInscriptionInfos.length + 1;
    const numOuts = sendInscriptionInfos.length + sendBTCInfos.length + 1;
    const estFee = new BigNumber(estimateTxFee(numIns, numOuts, feeRatePerByte));
    console.log("selectUTXOs estFee: ", { estFee: estFee, numIns: numIns, numOuts: numOuts, feeRatePerByte: feeRatePerByte });
    // filter normal UTXO and inscription UTXO to send
    const { cardinalUTXOs, inscriptionUTXOs } = filterAndSortCardinalUTXOs(utxos, inscriptions);
    normalUTXOs = cardinalUTXOs;
    // select inscription utxos
    const selectedInscUTXOs = [];
    for (const info of sendInscriptionInfos) {
        const res = selectInscriptionUTXO(inscriptionUTXOs, inscriptions, info.inscID);
        // NOTE: don't use inscription to pay network fee
        // // maxAmountInsTransfer = (inscriptionUTXO.value - inscriptionInfo.offset - 1) - MinSats;
        // maxAmountInsTransfer = inscriptionUTXO.value.
        //     minus(inscriptionInfo.offset).
        //     minus(1).minus(MinSats);
        // console.log("maxAmountInsTransfer: ", maxAmountInsTransfer.toNumber());
        selectedInscUTXOs.push(res.inscriptionUTXO);
    }
    resultUTXOs.push(...selectedInscUTXOs);
    // calculate total btc amount
    let totalSendAmount = new BigNumber(0);
    for (const info of sendBTCInfos) {
        totalSendAmount = totalSendAmount.plus(info.amount);
    }
    let totalPaymentAmount = totalSendAmount.plus(estFee);
    console.log("selectUTXOs totalPaymentAmount (include estimated fee): ", totalPaymentAmount);
    let feeRes = estFee;
    // select normal UTXOs
    if (totalPaymentAmount.gt(BNZero)) {
        const { selectedUTXOs, remainUTXOs, totalInputAmount: amt } = selectCardinalUTXOs(normalUTXOs, {}, totalPaymentAmount);
        resultUTXOs.push(...selectedUTXOs);
        totalInputAmount = amt;
        console.log("selectedUTXOs: ", selectedUTXOs);
        console.log("totalInputAmount: ", totalInputAmount.toNumber());
        // re-estimate fee with exact number of inputs and outputs
        feeRes = new BigNumber(estimateTxFee(resultUTXOs.length, numOuts, feeRatePerByte));
        console.log("feeRes: ", feeRes);
        if (totalSendAmount.plus(feeRes).gt(totalInputAmount)) {
            // need to select extra UTXOs
            const { selectedUTXOs: extraUTXOs, totalInputAmount: extraAmt } = selectCardinalUTXOs(remainUTXOs, {}, totalSendAmount.plus(feeRes).minus(totalInputAmount));
            resultUTXOs.push(...extraUTXOs);
            console.log("extraUTXOs: ", extraUTXOs);
            totalInputAmount = totalInputAmount.plus(extraAmt);
        }
    }
    // calculate output amount
    if (totalInputAmount.lt(totalSendAmount.plus(feeRes))) {
        feeRes = totalInputAmount.minus(totalSendAmount);
    }
    changeAmount = totalInputAmount.minus(totalSendAmount).minus(feeRes);
    return { selectedUTXOs: resultUTXOs, selectedInscUTXOs, changeAmount: changeAmount, fee: feeRes };
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
const bip32$3 = BIP32Factory__default["default"](ecc__namespace);
const ETHWalletDefaultPath = "m/44'/60'/0'/0/0";
const BTCSegwitWalletDefaultPath = "m/84'/0'/0'/0/0";
const randomTaprootWallet = () => {
    const keyPair = ECPair$1.makeRandom({ network: tcBTCNetwork });
    return {
        privateKey: convertPrivateKey$1(keyPair.privateKey),
        address: generateTaprootAddress(keyPair.privateKey),
    };
};
/**
* convertPrivateKey converts buffer private key to WIF private key string
* @param bytes buffer private key
* @returns the WIF private key string
*/
const convertPrivateKey$1 = (bytes) => {
    ECPair$1.makeRandom();
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
const generateP2WPKHKeyPair = (privateKey) => {
    // init key pair from senderPrivateKey
    const keyPair = ECPair$1.fromPrivateKey(privateKey, { network: tcBTCNetwork });
    // Generate an address from the tweaked public key
    const p2wpkh = bitcoinjsLib.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: tcBTCNetwork
    });
    const address = p2wpkh.address ? p2wpkh.address : "";
    if (address === "") {
        throw new Error("Can not get sender address from private key");
    }
    return { keyPair, address, p2wpkh, privateKey };
};
const generateP2WPKHKeyPairFromPubKey = (pubKey) => {
    // Generate an address from the tweaked public key
    const p2wpkh = bitcoinjsLib.payments.p2wpkh({
        pubkey: pubKey,
        network: tcBTCNetwork
    });
    const address = p2wpkh.address ? p2wpkh.address : "";
    if (address === "") {
        throw new Error("Can not get sender address from private key");
    }
    return { address, p2wpkh };
};
const getKeyPairInfo = ({ privateKey, address, }) => {
    // init key pair from senderPrivateKey
    const keyPair = ECPair$1.fromPrivateKey(privateKey, { network: tcBTCNetwork });
    // get address type 
    const addressType = getAddressType({ btcAddress: address, pubKey: keyPair.publicKey });
    // get payment and signer for each address type
    let payment;
    let signer;
    let sigHashTypeDefault;
    switch (addressType) {
        case BTCAddressType.P2TR: {
            // Tweak the original keypair
            const tweakedSigner = tweakSigner$1(keyPair, { network: tcBTCNetwork });
            signer = tweakedSigner;
            sigHashTypeDefault = bitcoinjsLib.Transaction.SIGHASH_DEFAULT;
            // Generate an address from the tweaked public key
            payment = bitcoinjsLib.payments.p2tr({
                pubkey: toXOnly$1(tweakedSigner.publicKey),
                network: tcBTCNetwork
            });
            break;
        }
        case BTCAddressType.P2WPKH: {
            signer = keyPair;
            sigHashTypeDefault = bitcoinjsLib.Transaction.SIGHASH_ALL;
            payment = bitcoinjsLib.payments.p2wpkh({
                pubkey: keyPair.publicKey,
                network: tcBTCNetwork
            });
            break;
        }
        default:
            throw new SDKError$1(ERROR_CODE$1.INVALID_BTC_ADDRESS_TYPE);
    }
    return { address, addressType, keyPair, payment, signer, sigHashTypeDefault };
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
    const root = bip32$3.fromSeed(Buffer.from(seedSegwit), tcBTCNetwork);
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
const BTCAddressType = {
    P2TR: 1,
    P2WPKH: 2,
};
/**
* getAddressType return the type of btc address.
* @param address Bitcoin address. Currently, only support Taproot and Segwit (P2WPKH)
* @returns the address type
*/
const getAddressType = ({ btcAddress, pubKey, }) => {
    const { address: taprootAddress } = generateTaprootAddressFromPubKey(toXOnly$1(pubKey));
    const { address: p2wpkhAddress } = generateP2WPKHKeyPairFromPubKey(pubKey);
    switch (btcAddress) {
        case taprootAddress:
            return BTCAddressType.P2TR;
        case p2wpkhAddress:
            return BTCAddressType.P2WPKH;
        default:
            throw new SDKError$1(ERROR_CODE$1.INVALID_BTC_ADDRESS_TYPE);
    }
};

// default is bitcoin mainnet
exports.Network = bitcoinjsLib.networks.bitcoin;
exports.BlockStreamURL = "https://blockstream.info/api";
const NetworkType$1 = {
    Mainnet: 1,
    Testnet: 2,
    Regtest: 3,
    Fractal: 4, // mainnet
};
const setBTCNetwork$1 = (netType) => {
    switch (netType) {
        case NetworkType$1.Mainnet: {
            exports.Network = bitcoinjsLib.networks.bitcoin;
            exports.BlockStreamURL = "https://blockstream.info/api";
            break;
        }
        case NetworkType$1.Testnet: {
            exports.Network = bitcoinjsLib.networks.testnet;
            exports.BlockStreamURL = "https://blockstream.info/testnet/api";
            break;
        }
        case NetworkType$1.Regtest: {
            exports.Network = bitcoinjsLib.networks.regtest;
            exports.BlockStreamURL = "https://blockstream.regtest.trustless.computer/regtest/api";
            break;
        }
        case NetworkType$1.Fractal: {
            exports.Network = bitcoinjsLib.networks.bitcoin;
            exports.BlockStreamURL = "https://mempool.fractalbitcoin.io/api";
            break;
        }
    }
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
const signPSBT = ({ keyPairInfo, psbtB64, indicesToSign, sigHashType = bitcoinjsLib.Transaction.SIGHASH_DEFAULT, }) => {
    // parse psbt string 
    const rawPsbt = bitcoinjsLib.Psbt.fromBase64(psbtB64);
    // sign inputs
    for (let i = 0; i < rawPsbt.txInputs.length; i++) {
        if (indicesToSign.findIndex(value => value === i) !== -1) {
            rawPsbt.signInput(i, keyPairInfo.signer, [sigHashType]);
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
// const createRawTxDummyUTXOForSale = ({
//     pubKey,
//     utxos,
//     inscriptions,
//     sellInscriptionID,
//     feeRatePerByte,
// }: {
//     pubKey: Buffer,
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
//     sellInscriptionID: string,
//     feeRatePerByte: number,
// }): { dummyUTXO: any, splitPsbtB64: string, indicesToSign: number[], selectedUTXOs: UTXO[], newValueInscription: BigNumber } => {
//     // select dummy UTXO 
//     // if there is no dummy UTXO, we have to create raw tx to split dummy UTXO
//     let dummyUTXORes: any;
//     let selectedUTXOs: UTXO[] = [];
//     let splitPsbtB64 = "";
//     let indicesToSign = [];
//     let newValueInscriptionRes = BNZero;
//     try {
//         // create dummy UTXO from cardinal UTXOs
//         const res = createRawTxDummyUTXOFromCardinal(pubKey, utxos, inscriptions, feeRatePerByte);
//         dummyUTXORes = res.dummyUTXO;
//         selectedUTXOs = res.selectedUTXOs;
//         splitPsbtB64 = res.splitPsbtB64;
//         indicesToSign = res.indicesToSign;
//     } catch (e) {
//         // select inscription UTXO
//         const { inscriptionUTXO, inscriptionInfo } = selectInscriptionUTXO(utxos, inscriptions, sellInscriptionID);
//         // create dummy UTXO from inscription UTXO
//         const { resRawTx, newValueInscription } = createRawTxSplitFundFromOrdinalUTXO({
//             pubKey, inscriptionUTXO, inscriptionInfo, sendAmount: new BigNumber(DummyUTXOValue), feeRatePerByte
//         });
//         selectedUTXOs = resRawTx.selectedUTXOs;
//         splitPsbtB64 = resRawTx.base64Psbt;
//         indicesToSign = resRawTx.indicesToSign;
//         newValueInscriptionRes = newValueInscription;
//         // TODO: 0xkraken
//         // newInscriptionUTXO = {
//         //     tx_hash: txID,
//         //     tx_output_n: 0,
//         //     value: newValueInscription,
//         // };
//         // dummyUTXORes = {
//         //     tx_hash: txID,
//         //     tx_output_n: 1,
//         //     value: new BigNumber(DummyUTXOValue),
//         // };
//     }
//     return {
//         dummyUTXO: dummyUTXORes,
//         splitPsbtB64,
//         indicesToSign,
//         selectedUTXOs,
//         newValueInscription: newValueInscriptionRes
//     };
// };
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
const createTx = ({ senderPrivateKey, senderAddress, utxos, inscriptions, sendInscriptionID = "", receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam = true, // default is true
sequence = DefaultSequenceRBF, }) => {
    console.log("createTx utxos: ", { utxos: utxos, inscriptions: inscriptions, feeRatePerByte: feeRatePerByte, sendAmount: sendAmount, isUseInscriptionPayFeeParam: isUseInscriptionPayFeeParam });
    // init key pair and tweakedSigner from senderPrivateKey
    const keyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { base64Psbt, fee, changeAmount, selectedUTXOs, indicesToSign } = createRawTx({
        keyPairInfo,
        utxos,
        inscriptions,
        sendInscriptionID,
        receiverInsAddress,
        sendAmount,
        feeRatePerByte,
        isUseInscriptionPayFeeParam,
        sequence,
    });
    const { signedBase64PSBT, msgTx, msgTxID, msgTxHex } = signPSBT({
        keyPairInfo,
        psbtB64: base64Psbt,
        indicesToSign,
        sigHashType: keyPairInfo.sigHashTypeDefault,
    });
    return { txID: msgTxID, txHex: msgTxHex, fee, selectedUTXOs, changeAmount, tx: msgTx };
};
const addInputs = ({ psbt, addressType, inputs, payment, sequence, keyPair, }) => {
    for (const input of inputs) {
        const inputData = {
            hash: input.tx_hash,
            index: input.tx_output_n,
            witnessUtxo: { value: input.value.toNumber(), script: payment.output },
            sequence,
        };
        if (addressType === BTCAddressType.P2TR) {
            inputData.tapInternalKey = toXOnly$1(keyPair.publicKey);
        }
        psbt.addInput(inputData);
    }
    return psbt;
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
const createRawTx = ({ keyPairInfo, utxos, inscriptions, sendInscriptionID = "", receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam = true, // default is true
sequence = DefaultSequenceRBF, }) => {
    const { keyPair, payment, address: senderAddress, addressType } = keyPairInfo;
    // validation
    if (sendAmount.gt(BNZero) && sendAmount.lt(MinSats2)) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats2) + " BTC.");
    }
    // select UTXOs
    const { selectedUTXOs, valueOutInscription, changeAmount, fee } = selectUTXOs(utxos, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam, true, 0);
    let feeRes = fee;
    let psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    // add inputs
    psbt = addInputs({ psbt, addressType, inputs: selectedUTXOs, payment, sequence, keyPair });
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
        if (changeAmount.gte(MinSats2)) {
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
const createTxFromAnyWallet = async ({ keyPairInfo, utxos, inscriptions, sendInscriptionID = "", receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam = true, // default is true,
walletType = bitcoinjsLib.Transaction.SIGHASH_DEFAULT, cancelFn, }) => {
    const { base64Psbt, indicesToSign, selectedUTXOs, fee, changeAmount } = createRawTx({
        keyPairInfo,
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
        address: keyPairInfo.address,
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
const createRawTxSendBTCFromMultisig = ({ senderPublicKey, senderAddress, utxos, inscriptions, paymentInfos, paymentScripts = [], feeRatePerByte, sequence = DefaultSequenceRBF, isSelectUTXOs = true, }) => {
    // const keyPairInfo: IKeyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    // const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;
    console.log("isSelectUTXOs createTxSendBTC: ", isSelectUTXOs);
    // validation
    let totalPaymentAmount = BNZero;
    for (const info of paymentInfos) {
        if (info.amount.gt(BNZero) && info.amount.lt(MinSats2)) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats2) + " BTC.");
        }
        totalPaymentAmount = totalPaymentAmount.plus(info.amount);
    }
    // select UTXOs
    const { selectedUTXOs, changeAmount, fee } = selectUTXOs(utxos, inscriptions, "", totalPaymentAmount, feeRatePerByte, false, isSelectUTXOs, paymentInfos.length);
    let feeRes = fee;
    let psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    // TODO:  2525
    for (const input of selectedUTXOs) {
        psbt.addInput({
            hash: input.tx_hash,
            index: input.tx_output_n,
            sequence: sequence,
            // witnessUtxo: { value: input.value.toNumber(), script: p2pktr.output as Buffer },
            // tapInternalKey: pubKey,
        });
    }
    // // add inputs
    // psbt = addInputs({
    //     psbt,
    //     addressType: addressType,
    //     inputs: selectedUTXOs,
    //     payment: payment,
    //     sequence,
    //     keyPair: keyPair,
    // });
    // add outputs send BTC
    for (const info of paymentInfos) {
        psbt.addOutput({
            address: info.address,
            value: info.amount.toNumber(),
        });
    }
    // add output script
    for (const info of paymentScripts) {
        psbt.addOutput({
            script: info.script,
            value: info.amount.toNumber(),
        });
    }
    // add change output
    let changeAmountRes = changeAmount;
    if (changeAmount.gt(BNZero)) {
        if (changeAmount.gte(MinSats2)) {
            psbt.addOutput({
                address: senderAddress,
                value: changeAmount.toNumber(),
            });
        }
        else {
            feeRes = feeRes.plus(changeAmount);
            changeAmountRes = BNZero;
        }
    }
    // sign tx
    // for (let i = 0; i < selectedUTXOs.length; i++) {
    //     psbt.signInput(i, signer, [sigHashTypeDefault]);
    // }
    // psbt.finalizeAllInputs();
    // get tx hex
    // const tx = psbt.extractTransaction();
    // console.log("Transaction : ", tx);
    // const txHex = tx.toHex();
    const indicesToSign = [];
    for (let i = 0; i < psbt.txInputs.length; i++) {
        indicesToSign.push(i);
    }
    return { base64Psbt: psbt.toBase64(), fee: feeRes, changeAmount: changeAmountRes, selectedUTXOs, indicesToSign };
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
const createTxSendBTC = ({ senderPrivateKey, senderAddress, utxos, inscriptions, paymentInfos, paymentScripts = [], feeRatePerByte, sequence = DefaultSequenceRBF, isSelectUTXOs = true, }) => {
    const keyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;
    console.log("isSelectUTXOs createTxSendBTC: ", isSelectUTXOs);
    // validation
    let totalPaymentAmount = BNZero;
    for (const info of paymentInfos) {
        if (info.amount.gt(BNZero) && info.amount.lt(MinSats2)) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats2) + " BTC.");
        }
        totalPaymentAmount = totalPaymentAmount.plus(info.amount);
    }
    // select UTXOs
    const { selectedUTXOs, changeAmount, fee } = selectUTXOs(utxos, inscriptions, "", totalPaymentAmount, feeRatePerByte, false, isSelectUTXOs, paymentInfos.length);
    let feeRes = fee;
    let psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    // add inputs
    psbt = addInputs({
        psbt,
        addressType: addressType,
        inputs: selectedUTXOs,
        payment: payment,
        sequence,
        keyPair: keyPair,
    });
    // add outputs send BTC
    for (const info of paymentInfos) {
        psbt.addOutput({
            address: info.address,
            value: info.amount.toNumber(),
        });
    }
    // add output script
    for (const info of paymentScripts) {
        psbt.addOutput({
            script: info.script,
            value: info.amount.toNumber(),
        });
    }
    // add change output
    if (changeAmount.gt(BNZero)) {
        if (changeAmount.gte(MinSats2)) {
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
        psbt.signInput(i, signer, [sigHashTypeDefault]);
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
const createTxSendBTC_MintRunes = ({ senderPrivateKey, senderAddress, utxos, inscriptions, paymentInfos, paymentScripts = [], feeRatePerByte, sequence = DefaultSequenceRBF, isSelectUTXOs = true, }) => {
    const keyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;
    console.log("isSelectUTXOs createTxSendBTC: ", isSelectUTXOs);
    // validation
    let totalPaymentAmount = BNZero;
    for (const info of paymentInfos) {
        if (info.amount.gt(BNZero) && info.amount.lt(MinSats2)) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats2) + " BTC.");
        }
        totalPaymentAmount = totalPaymentAmount.plus(info.amount);
    }
    // select UTXOs
    const { selectedUTXOs, changeAmount: cm, fee } = selectUTXOs(utxos, inscriptions, "", totalPaymentAmount, feeRatePerByte, false, isSelectUTXOs, paymentInfos.length);
    let extraFee = new BigNumber((20) * feeRatePerByte);
    let feeRes = BigNumber.sum(fee, extraFee); // op return data
    let changeAmount = new BigNumber(cm.toNumber() - extraFee.toNumber());
    console.log("createTxSendBTC_MintRunes feeRes: ", feeRes.toString(), changeAmount.toString(), extraFee.toString());
    let psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    // add inputs
    psbt = addInputs({
        psbt,
        addressType: addressType,
        inputs: selectedUTXOs,
        payment: payment,
        sequence,
        keyPair: keyPair,
    });
    // add output script
    for (const info of paymentScripts) {
        psbt.addOutput({
            script: info.script,
            value: info.amount.toNumber(),
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
        if (changeAmount.gte(MinSats2)) {
            psbt.addOutput({
                address: senderAddress,
                value: changeAmount.toNumber(),
            });
        }
        else {
            feeRes = feeRes.plus(changeAmount);
            changeAmount = BNZero;
        }
    }
    // sign tx
    for (let i = 0; i < selectedUTXOs.length; i++) {
        psbt.signInput(i, signer, [sigHashTypeDefault]);
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
        if (info.amount.gt(BNZero) && info.amount.lt(MinSats2)) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats2) + " BTC.");
        }
        totalPaymentAmount = totalPaymentAmount.plus(info.amount);
    }
    // select UTXOs
    const { selectedUTXOs, changeAmount, fee } = selectUTXOs(utxos, inscriptions, "", totalPaymentAmount, feeRatePerByte, false, true, paymentInfos.length);
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
        if (changeAmountRes.gte(MinSats2)) {
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
* createTxSendMultiReceivers creates the Bitcoin transaction that can both BTC and inscriptions to multiple receiver addresses.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param inscPaymentInfos list of inscription IDs and receiver addresses
* @param paymentInfos list of btc amount and receiver addresses
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createTxSendMultiReceivers = ({ senderPrivateKey, senderAddress, utxos, inscriptions, inscPaymentInfos = [], paymentInfos, feeRatePerByte, sequence = DefaultSequenceRBF, }) => {
    const keyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;
    // validation
    let totalPaymentAmount = BNZero;
    for (const info of paymentInfos) {
        if (info.amount.gt(BNZero) && info.amount.lt(MinSats2)) {
            throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats2) + " BTC.");
        }
        totalPaymentAmount = totalPaymentAmount.plus(info.amount);
    }
    // select UTXOs (include both inscriptions and btc)
    const { selectedUTXOs, selectedInscUTXOs, changeAmount, fee } = selectUTXOsV2(utxos, inscriptions, inscPaymentInfos, paymentInfos, feeRatePerByte);
    let feeRes = fee;
    if (selectedInscUTXOs.length != inscPaymentInfos.length) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS, "length of selected inscription UTXOS is different from length of payment infos");
    }
    let psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    // add inputs
    psbt = addInputs({
        psbt,
        addressType: addressType,
        inputs: selectedUTXOs,
        payment: payment,
        sequence,
        keyPair: keyPair,
    });
    // TODO: add output inscriptions
    for (let i = 0; i < inscPaymentInfos.length; i++) {
        psbt.addOutput({
            address: inscPaymentInfos[i].address,
            value: selectedInscUTXOs[i].value.toNumber(),
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
        if (changeAmount.gte(MinSats2)) {
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
        psbt.signInput(i, signer, [sigHashTypeDefault]);
    }
    psbt.finalizeAllInputs();
    // get tx hex
    const tx = psbt.extractTransaction();
    console.log("Transaction : ", tx);
    const txHex = tx.toHex();
    return { txID: tx.getId(), txHex, fee: feeRes, selectedUTXOs, changeAmount, tx };
};
const broadcastTx = async (txHex) => {
    const blockstream = new axios__default["default"].Axios({
        baseURL: exports.BlockStreamURL
    });
    const response = await blockstream.post("/tx", txHex);
    const { status, data } = response;
    if (status !== 200) {
        throw new SDKError$1(ERROR_CODE$1.ERR_BROADCAST_TX, data);
    }
    return response.data;
};

exports.StorageKeys = void 0;
(function (StorageKeys) {
    StorageKeys["HDWallet"] = "hd-wallet-cipher";
    StorageKeys["Masterless"] = "masterless-cipher";
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
    NOT_FOUND_TX_TO_RBF: "-30",
    COMMIT_TX_EMPTY: "-31",
    REVEAL_TX_EMPTY: "-32",
    OLD_VIN_EMPTY: "-33",
    INVALID_NEW_FEE_RBF: "-34",
    GET_UTXO_VALUE_ERR: "-35",
    IS_NOT_RBFABLE: "-36",
    INVALID_BTC_ADDRESS_TYPE: "-37",
    MNEMONIC_GEN_SEGWIT: "-38",
    SEGWIT_FROM_MNEMONIC: "-39",
    RESTORE_MASTERLESS_WALLET: "-40",
    CANNOT_CREATE_ACCOUNT: "-41",
    HEX_TX_IS_EMPTY: "-42",
    EXCEED_TX_SIZE: "-43",
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
        message: "Incorrect password.",
        desc: "Incorrect password.",
    },
    [ERROR_CODE.TAPROOT_FROM_MNEMONIC]: {
        message: "Generate private key by mnemonic error.",
        desc: "Generate private key by mnemonic error.",
    },
    [ERROR_CODE.CANNOT_FIND_ACCOUNT]: {
        message: "Can not find account.",
        desc: "an not find account.",
    },
    [ERROR_CODE.NOT_FOUND_TX_TO_RBF]: {
        message: "BTC transaction was not found from TC node.",
        desc: "BTC transaction was not found from TC node.",
    },
    [ERROR_CODE.COMMIT_TX_EMPTY]: {
        message: "Commit tx need to RBF is empty.",
        desc: "Commit tx need to RBF is empty.",
    },
    [ERROR_CODE.REVEAL_TX_EMPTY]: {
        message: "Reveal tx need to RBF is empty.",
        desc: "Reveal tx need to RBF is empty.",
    },
    [ERROR_CODE.OLD_VIN_EMPTY]: {
        message: "Can not get vin from inscribe tx to RBF.",
        desc: "Can not get vin from inscribe tx to RBF.",
    },
    [ERROR_CODE.INVALID_NEW_FEE_RBF]: {
        message: "New fee for RBF tx must be greater than the old one.",
        desc: "New fee for RBF tx must be greater than the old one.",
    },
    [ERROR_CODE.GET_UTXO_VALUE_ERR]: {
        message: "Get UTXO value from blockstream not found.",
        desc: "Get UTXO value from blockstream not found.",
    },
    [ERROR_CODE.IS_NOT_RBFABLE]: {
        message: "This transaction doesn't support to speed up.",
        desc: "This transaction doesn't support to speed up.",
    },
    [ERROR_CODE.INVALID_BTC_ADDRESS_TYPE]: {
        message: "Bitcoin address is invalid or not supported.",
        desc: "Bitcoin address is invalid or not supported.",
    },
    [ERROR_CODE.MNEMONIC_GEN_TAPROOT]: {
        message: "Gen taproot from mnemonic error.",
        desc: "Gen taproot from mnemonic error.",
    },
    [ERROR_CODE.MNEMONIC_GEN_SEGWIT]: {
        message: "Gen segwit from mnemonic error.",
        desc: "Gen segwit from mnemonic error.",
    },
    [ERROR_CODE.SEGWIT_FROM_MNEMONIC]: {
        message: "Generate private key by mnemonic error.",
        desc: "Generate private key by mnemonic error.",
    },
    [ERROR_CODE.RESTORE_MASTERLESS_WALLET]: {
        message: "Restore masterless wallet error.",
        desc: "Restore masterless wallet error.",
    },
    [ERROR_CODE.CANNOT_CREATE_ACCOUNT]: {
        message: "Create account error.",
        desc: "Create account error.",
    },
    [ERROR_CODE.HEX_TX_IS_EMPTY]: {
        message: "TC transaction hex is empty.",
        desc: "Create account error.",
    },
    [ERROR_CODE.EXCEED_TX_SIZE]: {
        message: "TC transaction size is exceed.",
        desc: "TC transaction size is exceed.",
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
    ECPair.makeRandom();
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

// default is bitcoin mainnet
bitcoinjsLib.networks.bitcoin;
const NetworkType = {
    Mainnet: 1,
    Testnet: 2,
    Regtest: 3,
    Fractal: 4, // mainnet
};
const setBTCNetwork = (netType) => {
    switch (netType) {
        case NetworkType.Mainnet: {
            bitcoinjsLib.networks.bitcoin;
            break;
        }
        case NetworkType.Testnet: {
            bitcoinjsLib.networks.testnet;
            break;
        }
        case NetworkType.Regtest: {
            bitcoinjsLib.networks.regtest;
            break;
        }
        case NetworkType.Fractal: {
            bitcoinjsLib.networks.bitcoin;
            break;
        }
    }
};

var StorageKeys;
(function (StorageKeys) {
    StorageKeys["HDWallet"] = "hd-wallet-cipher";
    StorageKeys["Masterless"] = "masterless-cipher";
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
        case NetworkType.Fractal: {
            network = bitcoinjsLib.networks.bitcoin;
            break;
        }
    }
    const _global = global || globalThis;
    if (storage) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _global.tcStorage = storage;
    }
    if (tcClient) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _global.tcClient = tcClient;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _global.tcBTCNetwork = network;
    setBTCNetwork(netType);
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

const createRawRevealTx$3 = ({ commitTxID, hashLockKeyPair, hashLockRedeem, script_p2tr, revealTxFee, sequence = 0, }) => {
    const tapLeafScript = {
        leafVersion: hashLockRedeem?.redeemVersion,
        script: hashLockRedeem?.output,
        controlBlock: script_p2tr.witness[script_p2tr.witness.length - 1],
    };
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    psbt.addInput({
        hash: commitTxID,
        index: 0,
        witnessUtxo: { value: revealTxFee, script: script_p2tr.output },
        tapLeafScript: [
            tapLeafScript
        ],
        sequence,
    });
    // output has OP_RETURN zero value
    const data = Buffer.from("https://trustless.computer", "utf-8");
    const scriptEmbed = bitcoinjsLib.script.compile([
        bitcoinjsLib.opcodes.OP_RETURN,
        data,
    ]);
    psbt.addOutput({
        value: 0,
        script: scriptEmbed,
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
function getRevealVirtualSize$3(hash_lock_redeem, script_p2tr, p2pktr_addr, hash_lock_keypair) {
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
    // output has OP_RETURN zero value
    const data = Buffer.from("https://trustless.computer", "utf-8");
    const scriptEmbed = bitcoinjsLib.script.compile([
        bitcoinjsLib.opcodes.OP_RETURN,
        data,
    ]);
    psbt.addOutput({
        value: 0,
        script: scriptEmbed,
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
const createInscribeTx$1 = async ({ senderPrivateKey, senderAddress, utxos, inscriptions, tcTxIDs, feeRatePerByte, sequence = DefaultSequenceRBF, isSelectUTXOs = true, }) => {
    getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    // const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    // const internalPubKey = toXOnly(keyPair.publicKey);
    // create lock script for commit tx
    const { hashLockKeyPair, hashLockRedeem, script_p2tr } = await createLockScript({
        // internalPubKey,
        tcTxIDs,
        tcClient
    });
    // estimate fee and select UTXOs
    const estCommitTxFee = estimateTxFee(1, 2, feeRatePerByte);
    const revealVByte = getRevealVirtualSize$3(hashLockRedeem, script_p2tr, senderAddress, hashLockKeyPair);
    const estRevealTxFee = revealVByte * feeRatePerByte;
    const totalFee = estCommitTxFee + estRevealTxFee;
    // const totalAmount = new BigNumber(totalFee + MinSats); // MinSats for new output in the reveal tx
    // const { selectedUTXOs, totalInputAmount } = selectCardinalUTXOs(utxos, inscriptions, totalAmount);
    if (script_p2tr.address === undefined || script_p2tr.address === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_TAPSCRIPT_ADDRESS, "");
    }
    const { txHex: commitTxHex, txID: commitTxID, fee: commitTxFee, changeAmount, selectedUTXOs, tx } = createTxSendBTC({
        senderPrivateKey,
        senderAddress,
        utxos,
        inscriptions,
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee) }],
        feeRatePerByte,
        sequence,
        isSelectUTXOs
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
    const { revealTxHex, revealTxID } = createRawRevealTx$3({
        commitTxID,
        hashLockKeyPair,
        hashLockRedeem,
        script_p2tr,
        revealTxFee: estRevealTxFee,
        sequence: 0,
    });
    console.log("commitTxHex: ", commitTxHex);
    console.log("revealTxHex: ", revealTxHex);
    console.log("commitTxID: ", commitTxID);
    console.log("revealTxID: ", revealTxID);
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
const splitBatchInscribeTx = async ({ tcTxDetails }) => {
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
    // split batch by tx size
    const result = [];
    for (const batch of batchInscribeTxIDs) {
        let batchSizeByte = 0;
        let splitBatch = [];
        for (let i = 0; i < batch.length; i++) {
            const txID = batch[i];
            const resp = await tcClient.getTCTxByHash(txID);
            if (resp.Hex === "") {
                throw new SDKError$1(ERROR_CODE$1.HEX_TX_IS_EMPTY);
            }
            if (resp.Hex.length / 2 > MaxTxSize) {
                throw new SDKError$1(ERROR_CODE$1.EXCEED_TX_SIZE);
            }
            batchSizeByte = batchSizeByte + resp.Hex.length / 2;
            if (batchSizeByte > MaxTxSize) {
                result.push([...splitBatch]);
                splitBatch = [];
                batchSizeByte = resp.Hex.length / 2;
            }
            splitBatch.push(txID);
            if (i == batch.length - 1) {
                result.push([...splitBatch]);
            }
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
* @param tcTxID TC txID need to be inscribed
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the hex commit transaction
* @returns the commit transaction id
* @returns the hex reveal transaction
* @returns the reveal transaction id
* @returns the total network fee
*/
const createBatchInscribeTxs = async ({ senderPrivateKey, senderAddress, utxos, inscriptions, tcTxDetails, feeRatePerByte, sequence = DefaultSequenceRBF, }) => {
    const batchInscribeTxIDs = await splitBatchInscribeTx({ tcTxDetails });
    const result = [];
    const newUTXOs = [...utxos];
    for (const batch of batchInscribeTxIDs) {
        console.log("[BatchInscribe] New UTXOs for creating new tx: ", newUTXOs);
        try {
            const { commitTxHex, commitTxID, revealTxHex, revealTxID, totalFee, newUTXOs: newUTXOsTmp, selectedUTXOs } = await createInscribeTx$1({
                senderPrivateKey,
                senderAddress,
                utxos: newUTXOs,
                inscriptions,
                tcTxIDs: batch,
                feeRatePerByte,
                sequence,
            });
            if (sequence < DefaultSequence) {
                sequence += 1;
            }
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
        // internalPubKey: pubKey,
        tcTxIDs,
        tcClient,
    });
    // estimate fee and select UTXOs
    const estCommitTxFee = estimateTxFee(1, 2, feeRatePerByte);
    const revealVByte = getRevealVirtualSize$3(hashLockRedeem, script_p2tr, senderAddress, hashLockKeyPair);
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
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee) }],
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
    const { revealTxHex, revealTxID } = createRawRevealTx$3({
        commitTxID,
        hashLockKeyPair,
        hashLockRedeem,
        script_p2tr,
        revealTxFee: estRevealTxFee,
        sequence: 0,
    });
    return {
        commitTxHex,
        commitTxID,
        revealTxHex,
        revealTxID,
        totalFee: new BigNumber(totalFee),
    };
};
const createLockScript = async ({ 
// privateKey,
// internalPubKey,
tcTxIDs, tcClient, }) => {
    // Create a tap tree with two spend paths
    // One path should allow spending using secret
    // The other path should pay to another pubkey
    // Make random key pair for hash_lock script
    const hashLockKeyPair = ECPair$1.makeRandom({ network: tcBTCNetwork });
    const internalPubKey = toXOnly$1(hashLockKeyPair.publicKey);
    // TODO:
    // const hashLockPrivateKey = hash256(privateKey);
    // const hashLockKeyPair = ECPair.fromPrivateKey(hashLockPrivateKey, { network: Network });
    // console.log("REMOVE hashLockPrivateKey: ", hashLockPrivateKey);
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
const aggregateUTXOs = async ({ tcAddress, utxos, }) => {
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
    // const newUTXOs: UTXO[] = [];
    // for (const tx of txs) {
    //     const btcTxID = tx.BTCHash;
    //     for (let i = 0; i < tx.Vout.length; i++) {
    //         const vout = tx.Vout[i];
    //         try {
    //             const receiverAddress = address.fromOutputScript(Buffer.from(vout.scriptPubKey?.hex, "hex"), Network);
    //             if (receiverAddress === btcAddress) {
    //                 newUTXOs.push({
    //                     tx_hash: btcTxID,
    //                     tx_output_n: i,
    //                     value: new BigNumber(toSat(vout.value))
    //                 });
    //             }
    //         } catch (e) {
    //             continue;
    //         }
    //     }
    // }
    // console.log("newUTXOs: ", newUTXOs);
    const tmpUTXOs = [...utxos];
    // console.log("tmpUTXOs: ", tmpUTXOs);
    // const ids: string[] = [];
    // const tmpUniqUTXOs: UTXO[] = [];
    // for (const utxo of tmpUTXOs) {
    //     const id = utxo.tx_hash + ":" + utxo.tx_output_n;
    //     console.log("id: ", id);
    //     if (ids.findIndex((idTmp) => idTmp === id) !== -1) {
    //         continue;
    //     } else {
    //         tmpUniqUTXOs.push(utxo);
    //         ids.push(id);
    //     }
    // }
    // console.log("tmpUniqUTXOs ", tmpUniqUTXOs);
    const result = [];
    for (const utxo of tmpUTXOs) {
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

const Mainnet = "mainnet";
const Testnet = "testnet";
const Regtest = "regtest";
const SupportedTCNetworkType = [Mainnet, Testnet, Regtest];
const DefaultEndpointTCNodeTestnet = "http://139.162.54.236:22225";
const DefaultEndpointTCNodeMainnet = "https://tc-node.trustless.computer";
const DefaultEndpointTCNodeRegtest = "https://tc-node-manual.regtest.trustless.computer";
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
            // console.log("Data req: ", dataReq);
            const response = await client.post("", JSON.stringify(dataReq), {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const { status, data } = response;
            // console.log("data from response: ", data);
            if (status !== 200) {
                console.log("status from response: ", status);
                throw new SDKError$1(ERROR_CODE$1.RPC_ERROR, typeof data.error === "string" ? data.error : data?.error?.message);
            }
            const dataResp = JSON.parse(data);
            // console.log("Data resp: ", dataResp);
            if (dataResp.error || !dataResp.result) {
                throw new SDKError$1(ERROR_CODE$1.RPC_ERROR, typeof dataResp.error === "string" ? dataResp.error : dataResp?.error?.message);
            }
            return dataResp.result;
        };
        // call to tc node to get inscribeable nonce and gas price (if need to replace previous orphan tx(s))
        this.getInscribeableNonce = async (tcAddress) => {
            const payload = [tcAddress];
            const resp = await this.callRequest(payload, MethodPost, "eth_getInscribeableNonce");
            console.log("Resp getInscribeableNonce: ", resp);
            if (resp === "") {
                throw new SDKError$1(ERROR_CODE$1.RPC_GET_INSCRIBEABLE_INFO_ERROR, "response is empty");
            }
            return resp;
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
        // getPendingInscribeTxs returns pending BTC inscribe txs in TC node (both broadcasted and holding)
        this.getPendingInscribeTxsDetail = async (tcAddress) => {
            const payload = [tcAddress];
            const resp = await this.callRequest(payload, MethodPost, "eth_getPendingInscribedUTXOByAddress");
            console.log("Resp eth_getPendingInscribedUTXOByAddress detail: ", resp);
            if (resp === "") {
                throw new SDKError$1(ERROR_CODE$1.RPC_GET_TAPSCRIPT_INFO, "response is empty");
            }
            return resp;
        };
        // get UTXO info from TC node by TC address
        this.getUTXOsInfoByTcAddress = async ({ tcAddress, btcAddress, tcClient, }) => {
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
            const incomingUTXOs = [];
            for (const tx of txs) {
                const btcTxID = tx.BTCHash;
                for (let i = 0; i < tx.Vout.length; i++) {
                    const vout = tx.Vout[i];
                    try {
                        const receiverAddress = bitcoinjsLib.address.fromOutputScript(Buffer.from(vout.scriptPubKey?.hex, "hex"), exports.Network);
                        if (receiverAddress === btcAddress) {
                            incomingUTXOs.push({
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
            console.log("newUTXOs: ", incomingUTXOs);
            return { pendingUTXOs, incomingUTXOs };
            // const tmpUTXOs = [...utxos];
            // // console.log("tmpUTXOs: ", tmpUTXOs);
            // // const ids: string[] = [];
            // // const tmpUniqUTXOs: UTXO[] = [];
            // // for (const utxo of tmpUTXOs) {
            // //     const id = utxo.tx_hash + ":" + utxo.tx_output_n;
            // //     console.log("id: ", id);
            // //     if (ids.findIndex((idTmp) => idTmp === id) !== -1) {
            // //         continue;
            // //     } else {
            // //         tmpUniqUTXOs.push(utxo);
            // //         ids.push(id);
            // //     }
            // // }
            // // console.log("tmpUniqUTXOs ", tmpUniqUTXOs);
            // const result: UTXO[] = [];
            // for (const utxo of tmpUTXOs) {
            //     const foundIndex = pendingUTXOs.findIndex((pendingUTXO) => {
            //         return pendingUTXO.tx_hash === utxo.tx_hash && pendingUTXO.tx_output_n === utxo.tx_output_n;
            //     });
            //     if (foundIndex === -1) {
            //         result.push(utxo);
            //     }
            // }
            // console.log("result: ", result);
            // return result;
        };
        // getTCTxReceipt get TC tx receipt
        this.getBalance = async (tcAddress) => {
            const payload = [tcAddress];
            const resp = await this.callRequest(payload, MethodPost, "eth_getBalance");
            console.log("Resp eth_getBalance: ", resp);
            if (resp === "") {
                throw new SDKError$1(ERROR_CODE$1.RPC_GET_TAPSCRIPT_INFO, "response is empty");
            }
            return resp;
        };
        // getTCTxReceipt get TC tx receipt
        this.getCountTx = async (tcAddress) => {
            const payload = [tcAddress, "pending"];
            const resp = await this.callRequest(payload, MethodPost, "eth_getTransactionCount");
            console.log("Resp eth_getBalance: ", resp);
            if (resp === "") {
                throw new SDKError$1(ERROR_CODE$1.RPC_GET_TAPSCRIPT_INFO, "response is empty");
            }
            return resp;
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

const increaseGasPrice = (wei) => {
    const res = wei.plus(new BigNumber(1000000000));
    return res;
};

/**
* getUTXOsFromBlockStream get UTXOs from Blockstream service.
* the result was filtered spending UTXOs in Bitcoin mempool.
* @param btcAddress bitcoin address
* @param isConfirmed filter UTXOs by confirmed or not
* @returns list of UTXOs
*/
const getUTXOsFromBlockStream = async (btcAddress, isConfirmed) => {
    // https://blockstream.regtest.trustless.computer/regtest/api/address/bcrt1p7vs2w9cyeqpc7ktzuqnm9qxmtng5cethgh66ykjz9uhdaz0arpfq93cr3a/txs
    const res = await axios__default["default"].get(`${exports.BlockStreamURL}/address/${btcAddress}/utxo`);
    const data = res.data;
    const utxos = [];
    for (const item of data) {
        if ((isConfirmed && !item.status?.confirmed) || (!isConfirmed && item.status?.confirmed)) {
            continue;
        }
        utxos.push({
            tx_hash: item.txid,
            tx_output_n: item.vout,
            value: new BigNumber(item.value)
        });
    }
    return utxos;
};
const getTxFromBlockStream = async (txID) => {
    // if (!txID) return [];
    // https://blockstream.regtest.trustless.computer/regtest/api/address/bcrt1p7vs2w9cyeqpc7ktzuqnm9qxmtng5cethgh66ykjz9uhdaz0arpfq93cr3a/txs
    const res = await axios__default["default"].get(`${exports.BlockStreamURL}/tx/${txID}`);
    return res.data;
};
const getOutputCoinValue = async (txID, voutIndex) => {
    const tx = await getTxFromBlockStream(txID);
    if (voutIndex >= tx.vout.length) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_PARAMS);
    }
    return new BigNumber(tx.vout[voutIndex].value);
};
// curl - X GET "https://api.hiro.so/runes/v1/addresses/string/balances?offset=0&limit=1"
const getRuneBalance = async (btcAddress) => {
    // https://blockstream.regtest.trustless.computer/regtest/api/address/bcrt1p7vs2w9cyeqpc7ktzuqnm9qxmtng5cethgh66ykjz9uhdaz0arpfq93cr3a/txs
    const res = await axios__default["default"].get(`https://api.hiro.so/runes/v1/addresses/${btcAddress}/balances?offset=0&limit=1`);
    const data = res.data;
    console.log("data: ", data);
    if (data?.results?.length > 0) {
        return new BigNumber(data?.results[0].balance, 10);
    }
    return new BigNumber(0);
};
const getRuneBalanceByRuneID = async (btcAddress, runeID) => {
    // https://blockstream.regtest.trustless.computer/regtest/api/address/bcrt1p7vs2w9cyeqpc7ktzuqnm9qxmtng5cethgh66ykjz9uhdaz0arpfq93cr3a/txs
    const res = await axios__default["default"].get(`https://open-api.unisat.io/v1/indexer/address/${btcAddress}/runes/${runeID}/balance`);
    const data = res.data;
    console.log("data: ", data);
    if (data?.results?.length > 0) {
        return new BigNumber(data?.amount, 10);
    }
    return new BigNumber(0);
};

const extractOldTxInfo = async ({ revealTxID, tcClient, tcAddress, btcAddress, }) => {
    const txs = await tcClient.getPendingInscribeTxsDetail(tcAddress);
    const needToRBFTxInfos = txs.filter((tx) => {
        return tx.Reveal.BTCHash === revealTxID;
    });
    if (needToRBFTxInfos.length == 0) {
        throw new SDKError$1(ERROR_CODE$1.NOT_FOUND_TX_TO_RBF, revealTxID);
    }
    const needToRBFTCTxIDs = [];
    for (const tx of needToRBFTxInfos) {
        needToRBFTCTxIDs.push(tx.TCHash);
    }
    if (needToRBFTxInfos.length == 0) {
        throw new SDKError$1(ERROR_CODE$1.NOT_FOUND_TX_TO_RBF, revealTxID);
    }
    // parse vin from old tx info
    const oldCommitUTXOs = [];
    const oldCommitTx = needToRBFTxInfos[0].Commit;
    const oldRevealTx = needToRBFTxInfos[0].Reveal;
    if (oldCommitTx === null || oldCommitTx === undefined) {
        throw new SDKError$1(ERROR_CODE$1.COMMIT_TX_EMPTY, revealTxID);
    }
    if (oldRevealTx === null || oldRevealTx === undefined) {
        throw new SDKError$1(ERROR_CODE$1.REVEAL_TX_EMPTY, revealTxID);
    }
    const oldCommitVins = oldCommitTx.Vin;
    const oldCommitVouts = oldCommitTx.Vout;
    if (oldCommitVins.length === 0) {
        throw new SDKError$1(ERROR_CODE$1.OLD_VIN_EMPTY, revealTxID);
    }
    let isRBFable = true;
    for (const vin of oldCommitVins) {
        oldCommitUTXOs.push({
            tx_hash: vin.txid,
            tx_output_n: vin.vout,
            value: BNZero, // TODO: 2525
        });
        if (vin.Sequence === DefaultSequence) {
            isRBFable = false;
        }
    }
    console.log("HHH  oldCommitUTXOs: ", oldCommitUTXOs);
    // const utxoFromBlockStream = await getUTXOsFromBlockStream(btcAddress);
    for (let i = 0; i < oldCommitUTXOs.length; i++) {
        const utxoValue = await getOutputCoinValue(oldCommitUTXOs[i].tx_hash, oldCommitUTXOs[i].tx_output_n);
        oldCommitUTXOs[i].value = utxoValue;
    }
    // get old fee rate, old fee of commit tx
    let totalCommitVin = BNZero;
    for (const vout of oldCommitUTXOs) {
        totalCommitVin = totalCommitVin.plus(new BigNumber(vout.value));
    }
    let totalCommitVOut = BNZero;
    for (const vout of oldCommitVouts) {
        totalCommitVOut = totalCommitVOut.plus(new BigNumber(toSat(vout.value)));
    }
    console.log("HHH oldCommitUTXOs: ", oldCommitUTXOs);
    console.log("HHH oldCommitVouts: ", oldCommitVouts);
    console.log("HHH totalCommitVin: ", totalCommitVin.toNumber());
    console.log("HHH totalCommitVOut: ", totalCommitVOut.toNumber());
    const oldCommitFee = totalCommitVin.minus(totalCommitVOut);
    const oldCommitTxSize = estimateTxSize(oldCommitUTXOs.length, oldCommitVouts.length);
    const oldCommitFeeRate = oldCommitFee.toNumber() / oldCommitTxSize;
    console.log("HHH oldCommitFee: ", oldCommitFee);
    console.log("HHH oldCommitTxSize: ", oldCommitTxSize);
    console.log("HHH oldCommitFeeRate: ", oldCommitFeeRate);
    // get old fee rate, old fee of reveal tx 
    const totalRevealVin = toSat(oldCommitVouts[0].value);
    const totalRevealVout = toSat(oldRevealTx.Vout[0].value);
    const oldRevealFee = totalRevealVin - totalRevealVout;
    const revealTxSize = oldRevealFee / oldCommitFeeRate;
    console.log("oldRevealFee: ", oldRevealFee);
    console.log("revealTxSize: ", revealTxSize);
    const totalOldFee = oldCommitFee.plus(new BigNumber(oldRevealFee));
    const newCommitFee = totalOldFee.plus(new BigNumber(1000)); // extra
    const minSat = Math.round(newCommitFee.toNumber() / oldCommitTxSize) + 1;
    return {
        oldCommitUTXOs,
        oldCommitVouts,
        oldCommitVins,
        oldCommitFee,
        oldCommitTxSize,
        oldCommitFeeRate,
        needToRBFTCTxIDs,
        needToRBFTxInfos,
        totalCommitVin,
        totalCommitVOut,
        oldRevealTx,
        revealTxSize,
        isRBFable,
        minSat,
    };
};
const replaceByFeeInscribeTx = async ({ senderPrivateKey, utxos, inscriptions, revealTxID, feeRatePerByte, tcAddress, btcAddress, sequence = DefaultSequenceRBF, }) => {
    const { oldCommitVouts, oldCommitUTXOs, oldCommitVins, oldCommitFee, oldCommitTxSize, oldCommitFeeRate, needToRBFTCTxIDs, needToRBFTxInfos, totalCommitVin, totalCommitVOut, isRBFable, oldRevealTx, minSat, revealTxSize, } = await extractOldTxInfo({
        revealTxID,
        tcClient,
        tcAddress,
        btcAddress,
    });
    if (!isRBFable) {
        throw new SDKError$1(ERROR_CODE$1.IS_NOT_RBFABLE, revealTxID);
    }
    console.log("HHH min sat: ", minSat);
    // estimate new fee with new fee rate
    if (feeRatePerByte < minSat) {
        throw new SDKError$1(ERROR_CODE$1.INVALID_NEW_FEE_RBF, "Require new fee: " + minSat + " New fee: " + feeRatePerByte);
    }
    const estCommitTxFee = estimateTxFee(oldCommitVins.length, oldCommitVouts.length, feeRatePerByte);
    const estRevealTxFee = revealTxSize * feeRatePerByte;
    const totalAmtNeedToInscribe = estCommitTxFee + estRevealTxFee;
    // select extra UTXO if needed
    let extraUTXOs = [];
    if (new BigNumber(totalAmtNeedToInscribe).gt(totalCommitVin)) {
        const extraAmt = new BigNumber(totalAmtNeedToInscribe).minus(totalCommitVin);
        const { selectedUTXOs } = selectCardinalUTXOs(utxos, inscriptions, extraAmt);
        extraUTXOs = selectedUTXOs;
    }
    const utxosForRBFTx = [...oldCommitUTXOs, ...extraUTXOs];
    console.log("utxosForRBFTx: ", utxosForRBFTx);
    console.log("createInscribeTx: ", createInscribeTx$1);
    const resp = await createInscribeTx$1({
        senderPrivateKey,
        senderAddress: btcAddress,
        utxos: utxosForRBFTx,
        inscriptions,
        tcTxIDs: needToRBFTCTxIDs,
        feeRatePerByte,
        sequence,
        isSelectUTXOs: false,
    });
    return resp;
};
const isRBFable = async ({ revealTxID, tcAddress, btcAddress, }) => {
    const { isRBFable, oldCommitFeeRate, minSat } = await extractOldTxInfo({
        revealTxID,
        tcClient,
        tcAddress,
        btcAddress
    });
    return {
        isRBFable,
        oldFeeRate: oldCommitFeeRate,
        minSat,
    };
};

const ServiceGetUTXOType = {
    BlockStream: 1,
    Mempool: 2,
};
/**
* getUTXOs get UTXOs to create txs.
* the result was filtered spending UTXOs in Bitcoin mempool and spending UTXOs was used for pending txs in TC node.
* dont include incomming UTXOs
* @param btcAddress bitcoin address
* @param serviceType service is used to get UTXOs, default is BlockStream
* @returns list of UTXOs
*/
const getUTXOs = async ({ btcAddress, tcAddress, serviceType = ServiceGetUTXOType.BlockStream, }) => {
    let availableUTXOs = [];
    const incomingUTXOs = [];
    let incomingUTXOsTmp = [];
    switch (serviceType) {
        case ServiceGetUTXOType.BlockStream: {
            availableUTXOs = await getUTXOsFromBlockStream(btcAddress, true);
            // get list incoming utxos
            incomingUTXOsTmp = await getUTXOsFromBlockStream(btcAddress, false);
            break;
            // utxos = await aggregateUTXOs({ tcAddress, btcAddress, utxos, tcClient });
            // let availableBalance = BNZero;
            // for (const utxo of utxos) {
            //     availableBalance = availableBalance.plus(utxo.value);
            // }
            // const incomingBalance = BNZero;
            // return { utxos, availableBalance, incomingBalance };
        }
        case ServiceGetUTXOType.Mempool: {
            // TODO: 2525
            availableUTXOs = await getUTXOsFromBlockStream(btcAddress, true);
            // get list incoming utxos
            incomingUTXOsTmp = await getUTXOsFromBlockStream(btcAddress, false);
            break;
            // utxos = await aggregateUTXOs({ tcAddress, btcAddress, utxos, tcClient });
            // let availableBalance = BNZero;
            // for (const utxo of utxos) {
            //     availableBalance = availableBalance.plus(utxo.value);
            // }
            // const incomingBalance = BNZero;
            // return { utxos, availableBalance, incomingBalance };
        }
        default: {
            throw new SDKError$1(ERROR_CODE$1.INVALID_CODE, "Invalid service type");
        }
    }
    // get utxo info from tc node of tc address
    const { pendingUTXOs, incomingUTXOs: incommingUTXOsFromTCNode } = await tcClient.getUTXOsInfoByTcAddress({ tcAddress, btcAddress, tcClient });
    // filter pending UTXOs from TC node
    for (const utxo of availableUTXOs) {
        const foundIndex = pendingUTXOs.findIndex((pendingUTXO) => {
            return pendingUTXO.tx_hash === utxo.tx_hash && pendingUTXO.tx_output_n === utxo.tx_output_n;
        });
        if (foundIndex !== -1) {
            availableUTXOs.splice(foundIndex, 1);
        }
    }
    incomingUTXOsTmp.push(...incommingUTXOsFromTCNode);
    const ids = [];
    for (const utxo of incomingUTXOsTmp) {
        const id = utxo.tx_hash + ":" + utxo.tx_output_n;
        if (
        // duplicate incoming utxos
        ids.findIndex((idTmp) => idTmp === id) !== -1 ||
            // found in pending UTXOs
            pendingUTXOs.findIndex((pendingUTXO) => {
                return pendingUTXO.tx_hash === utxo.tx_hash && pendingUTXO.tx_output_n === utxo.tx_output_n;
            }) !== -1) {
            continue;
        }
        else {
            incomingUTXOs.push(utxo);
            ids.push(id);
        }
    }
    // calculate balance
    let availableBalance = BNZero;
    for (const utxo of availableUTXOs) {
        availableBalance = availableBalance.plus(utxo.value);
    }
    let incomingBalance = BNZero;
    for (const utxo of incomingUTXOs) {
        incomingBalance = incomingBalance.plus(utxo.value);
    }
    return { availableUTXOs, incomingUTXOs, availableBalance, incomingBalance };
};

exports.RequestFunction = void 0;
(function (RequestFunction) {
    RequestFunction["sign"] = "sign";
    RequestFunction["request"] = "request";
})(exports.RequestFunction || (exports.RequestFunction = {}));
exports.RequestMethod = void 0;
(function (RequestMethod) {
    RequestMethod["account"] = "account";
})(exports.RequestMethod || (exports.RequestMethod = {}));

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

const URL_MAINNET = "https://trustlesswallet.io";
const URL_REGTEST = "https://dev.trustlesswallet.io";

const window = globalThis || global;
const openWindow = ({ url = URL_MAINNET, search, target }) => {
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
            url: payload.isMainnet ? URL_MAINNET : URL_REGTEST,
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
            url: payload.isMainnet ? URL_MAINNET : URL_REGTEST,
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

var K=0xffn,O=0xffffn,P=0xffff_ffffn,Q=0xffff_ffff_ffff_ffffn,k=0xffff_ffff_ffff_ffff_ffff_ffff_ffff_ffffn,x=19;function Y(w){if(w<0n)throw new Error("Value must be positive");if(w>k)throw new Error(`Can't encode value more than ${k}`);const h=Buffer.alloc(x);let s=0;while(w>>7n>0)h[s]=Number(w&0b1111_1111n|0b1000_0000n),w>>=7n,s+=1;return h[s]=Number(w),h.subarray(0,s+1)}function q(w){if(w.length>x||w.length===x&&w[w.length-1]>3)throw new Error(`Can't decode value more than ${k}, buffer overflow`);let h=BigInt(0);for(let s=0;s<w.length;s+=1){const W=w[s]&127;h=h|BigInt(W)<<7n*BigInt(s);}if(h<0n)throw new Error("Value is minus, something wrong");return h}class j{n;maxNumber;constructor(w,h){this.n=w,this.maxNumber=h,this.baseValidation();}baseValidation(){if(this.n<0n)throw new Error("Value must be positive");if(this.n>this.maxNumber)throw new Error(`Value must be less than ${this.maxNumber}`)}get MAX(){return this.maxNumber}toVaruint(){return Y(this.n)}toString(){return this.n.toString()}toJSON(){return this.n.toString()}toValue(){return this.n}}class z extends j{constructor(w){super(w,K);}static fromString(w){return new z(BigInt(w))}static fromNumber(w){return new z(BigInt(w))}static fromVaruint(w){return new z(q(w))}}class C extends j{constructor(w){super(w,O);}static fromString(w){return new C(BigInt(w))}static fromNumber(w){return new C(BigInt(w))}static fromVaruint(w){return new C(q(w))}}class D extends j{constructor(w){super(w,P);}static fromString(w){return new D(BigInt(w))}static fromNumber(w){return new D(BigInt(w))}static fromVaruint(w){return new D(q(w))}}class I extends j{constructor(w){super(w,Q);}static fromString(w){return new I(BigInt(w))}static fromVaruint(w){return new I(q(w))}}class J extends j{constructor(w){super(w,k);}static fromString(w){return new J(BigInt(w))}static fromVaruint(w){return new J(q(w))}}

var FlagEnum$1;
(function (FlagEnum) {
    FlagEnum[FlagEnum["Etching"] = 0] = "Etching";
    FlagEnum[FlagEnum["Terms"] = 1] = "Terms";
    FlagEnum[FlagEnum["Cenotaph"] = 127] = "Cenotaph";
})(FlagEnum$1 || (FlagEnum$1 = {}));

var Tag$1;
(function (Tag) {
    Tag[Tag["Body"] = 0] = "Body";
    Tag[Tag["Flags"] = 2] = "Flags";
    Tag[Tag["Rune"] = 4] = "Rune";
    Tag[Tag["Premine"] = 6] = "Premine";
    Tag[Tag["Cap"] = 8] = "Cap";
    Tag[Tag["Amount"] = 10] = "Amount";
    Tag[Tag["HeightStart"] = 12] = "HeightStart";
    Tag[Tag["HeightEnd"] = 14] = "HeightEnd";
    Tag[Tag["OffsetStart"] = 16] = "OffsetStart";
    Tag[Tag["OffsetEnd"] = 18] = "OffsetEnd";
    Tag[Tag["Mint"] = 20] = "Mint";
    Tag[Tag["Pointer"] = 22] = "Pointer";
    Tag[Tag["Cenotaph"] = 126] = "Cenotaph";
    Tag[Tag["Divisibility"] = 1] = "Divisibility";
    Tag[Tag["Spacers"] = 3] = "Spacers";
    Tag[Tag["Symbol"] = 5] = "Symbol";
    Tag[Tag["Nop"] = 127] = "Nop";
})(Tag$1 || (Tag$1 = {}));
var ValueType$1;
(function (ValueType) {
    ValueType[ValueType["U8"] = 0] = "U8";
    ValueType[ValueType["U16"] = 1] = "U16";
    ValueType[ValueType["U32"] = 2] = "U32";
    ValueType[ValueType["U64"] = 3] = "U64";
    ValueType[ValueType["U128"] = 4] = "U128";
})(ValueType$1 || (ValueType$1 = {}));

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
        this.createNewAccount = async ({ password, name, accounts }) => {
            const wallet = await getStorageHDWallet$1(password);
            validateHDWallet$1(wallet, "create-new-account");
            if (!wallet)
                return;
            const { mnemonic, nodes, deletedIndexs } = wallet;
            const isExistedName = nodes.some(node => node.name.toLowerCase() === name.toLowerCase());
            if (isExistedName) {
                throw new Error("This name has been existed.");
            }
            const latestNode = maxBy__default["default"](nodes, item => Number(item.index));
            let newNodeIndex = (latestNode?.index || 0) + 1;
            for (const deletedIndex of deletedIndexs) {
                if (newNodeIndex <= deletedIndex) {
                    newNodeIndex += 1;
                }
            }
            const validateExistNode = (newNode, nodes) => {
                const isExist = nodes.some(node => node.address.toLowerCase() === newNode.address.toLowerCase());
                return !isExist;
            };
            let newNode = undefined;
            let isBreak = false;
            while (!isBreak) {
                const childNode = deriveHDNodeByIndex$1({
                    mnemonic,
                    index: newNodeIndex,
                    name
                });
                const isValid = validateExistNode(childNode, accounts);
                if (isValid) {
                    newNode = childNode;
                    isBreak = true;
                }
                else {
                    isBreak = false;
                    ++newNodeIndex;
                }
            }
            if (newNode) {
                nodes.push(newNode);
                await this.saveWallet(wallet, password);
                return newNode;
            }
            throw new SDKError(ERROR_CODE.CANNOT_FIND_ACCOUNT);
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

class Masterless$1 {
    constructor() {
        this.set = (listMasterless) => {
            validateMasterless$1(listMasterless, "mlset");
            this.nodes = listMasterless;
        };
        this.saveWallet = async (listMasterless, password) => {
            this.set(listMasterless);
            await setStorageMasterless$1(listMasterless, password);
        };
        this.importNewAccount = async ({ password, name, privateKey, nodes }) => {
            const listMasterless = await getStorageMasterless$1(password);
            validateMasterless$1(listMasterless, "import-masterless");
            if (!listMasterless)
                return;
            const masterless = deriveMasterless$1({
                name,
                privateKey
            });
            for (const node of nodes) {
                if (node.address.toLowerCase() === masterless.address.toLowerCase()) {
                    throw new Error(`This account has existed with address ${masterless.address}`);
                }
                if (node.name.toLowerCase() === masterless.name.toLowerCase()) {
                    throw new Error("This account name has existed.");
                }
            }
            listMasterless.push(masterless);
            await this.saveWallet(listMasterless, password);
            return masterless;
        };
        this.deletedMasterless = async ({ password, address }) => {
            const listMasterless = await getStorageMasterless$1(password);
            validateMasterless$1(listMasterless, "delete-masterless");
            if (!listMasterless)
                return;
            const masterless = listMasterless.find(node => node.address.toLowerCase() === address.toLowerCase());
            if (!masterless) {
                throw new SDKError(ERROR_CODE.CANNOT_FIND_ACCOUNT);
            }
            const newListMasterless = listMasterless.filter(node => node.address.toLowerCase() !== address.toLowerCase());
            await this.saveWallet(newListMasterless, password);
        };
        this.restore = async (password) => {
            new Validator("restore-password: ", password).string().required();
            try {
                const wallet = await getStorageMasterless$1(password);
                this.set(wallet);
                return wallet;
            }
            catch (error) {
                let message = "";
                if (error instanceof Error) {
                    message = error.message;
                }
                throw new SDKError(ERROR_CODE.RESTORE_MASTERLESS_WALLET, message);
            }
        };
        this.nodes = undefined;
    }
}

const ETHDerivationPath$1 = "m/44'/60'/0'/0";
const BTCTaprootDerivationPath$1 = "m/86'/0'/0'/0/0";
const BTCSegwitDerivationPath$1 = "m/84'/0'/0'/0/0";

bitcoinjsLib.initEccLib(ecc__namespace);
BIP32Factory__default["default"](ecc__namespace);
const validateMnemonicBTC$1 = (mnemonic) => {
    return bip39__namespace.validateMnemonic(mnemonic);
};

bitcoinjsLib.initEccLib(ecc__namespace);
const bip32$2 = BIP32Factory__default["default"](ecc__namespace);
const generateSegwitHDNodeFromMnemonic$1 = async (mnemonic) => {
    const isValid = validateMnemonicBTC$1(mnemonic);
    if (!isValid) {
        throw new SDKError(ERROR_CODE.MNEMONIC_GEN_SEGWIT);
    }
    const seed = await bip39__namespace.mnemonicToSeed(mnemonic);
    const rootKey = bip32$2.fromSeed(seed);
    const childNode = rootKey.derivePath(BTCSegwitDerivationPath$1);
    const privateKeyBuffer = childNode.privateKey;
    if (!privateKeyBuffer) {
        throw new SDKError(ERROR_CODE.SEGWIT_FROM_MNEMONIC);
    }
    const privateKeyStr = convertPrivateKey(privateKeyBuffer);
    return privateKeyStr;
};

const validateMasterless$1 = (listMasterless, methodName) => {
    if (listMasterless) {
        for (const node of listMasterless) {
            new Validator(`${methodName}-` + "validate-derive-name", node.name).required();
            new Validator(`${methodName}-` + "validate-derive-index", node.index).required();
            new Validator(`${methodName}-` + "validate-derive-privateKey", node.privateKey).required();
            new Validator(`${methodName}-` + "validate-derive-address", node.address).required();
        }
    }
};
const deriveMasterless$1 = (payload) => {
    const newMasterless = new ethers.ethers.Wallet(payload.privateKey);
    return {
        name: payload.name,
        index: Number(new Date().getTime()),
        privateKey: newMasterless.privateKey,
        address: newMasterless.address,
    };
};
const getStorageMasterlessCipherText$1 = () => {
    return tcStorage.get(StorageKeys.Masterless);
};
const getStorageMasterless$1 = async (password) => {
    const cipherText = await getStorageMasterlessCipherText$1();
    if (!cipherText) {
        return [];
    }
    const rawText = decryptAES(cipherText, password);
    const listMasterless = JSON.parse(rawText);
    validateMasterless$1(listMasterless, "getStorageMasterless");
    return listMasterless;
};
const setStorageMasterless$1 = async (wallet, password) => {
    const cipherText = encryptAES(JSON.stringify(wallet), password);
    await tcStorage.set(StorageKeys.Masterless, cipherText);
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
        this.restoreMasterless = async (password) => {
            const masterlessIns = new Masterless$1();
            const masterless = await masterlessIns.restore(password);
            this._masterless = masterlessIns;
            return masterless;
        };
        this.load = async (password) => {
            new Validator("password", password).string().required();
            const hdWallet = await this.restoreHDWallet(password);
            const masterless = await this.restoreMasterless(password);
            return {
                hdWallet,
                masterless
            };
        };
        this.getHDWallet = () => {
            new Validator("Get HDWallet", this._hdWallet).required("Please restore wallet.");
            return this._hdWallet;
        };
        this.getMasterless = () => {
            new Validator("Get Masterless", this._masterless).required("Please restore wallet.");
            return this._masterless;
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
        this.createNewAccount = async ({ password, name, accounts }) => {
            const wallet = await getStorageHDWallet$1(password);
            validateHDWallet$1(wallet, "create-new-account");
            if (!wallet)
                return;
            const { mnemonic, nodes, deletedIndexs } = wallet;
            const isExistedName = nodes.some(node => node.name.toLowerCase() === name.toLowerCase());
            if (isExistedName) {
                throw new Error("This name has been existed.");
            }
            const latestNode = maxBy__default["default"](nodes, item => Number(item.index));
            let newNodeIndex = (latestNode?.index || 0) + 1;
            for (const deletedIndex of deletedIndexs) {
                if (newNodeIndex <= deletedIndex) {
                    newNodeIndex += 1;
                }
            }
            const validateExistNode = (newNode, nodes) => {
                const isExist = nodes.some(node => node.address.toLowerCase() === newNode.address.toLowerCase());
                return !isExist;
            };
            let newNode = undefined;
            let isBreak = false;
            while (!isBreak) {
                const childNode = deriveHDNodeByIndex$1({
                    mnemonic,
                    index: newNodeIndex,
                    name
                });
                const isValid = validateExistNode(childNode, accounts);
                if (isValid) {
                    newNode = childNode;
                    isBreak = true;
                }
                else {
                    isBreak = false;
                    ++newNodeIndex;
                }
            }
            if (newNode) {
                nodes.push(newNode);
                await this.saveWallet(wallet, password);
                return newNode;
            }
            throw new SDKError(ERROR_CODE.CANNOT_FIND_ACCOUNT);
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
        this.set = (listMasterless) => {
            validateMasterless$1(listMasterless, "mlset");
            this.nodes = listMasterless;
        };
        this.saveWallet = async (listMasterless, password) => {
            this.set(listMasterless);
            await setStorageMasterless$1(listMasterless, password);
        };
        this.importNewAccount = async ({ password, name, privateKey, nodes }) => {
            const listMasterless = await getStorageMasterless$1(password);
            validateMasterless$1(listMasterless, "import-masterless");
            if (!listMasterless)
                return;
            const masterless = deriveMasterless$1({
                name,
                privateKey
            });
            for (const node of nodes) {
                if (node.address.toLowerCase() === masterless.address.toLowerCase()) {
                    throw new Error(`This account has existed with address ${masterless.address}`);
                }
                if (node.name.toLowerCase() === masterless.name.toLowerCase()) {
                    throw new Error("This account name has existed.");
                }
            }
            listMasterless.push(masterless);
            await this.saveWallet(listMasterless, password);
            return masterless;
        };
        this.deletedMasterless = async ({ password, address }) => {
            const listMasterless = await getStorageMasterless$1(password);
            validateMasterless$1(listMasterless, "delete-masterless");
            if (!listMasterless)
                return;
            const masterless = listMasterless.find(node => node.address.toLowerCase() === address.toLowerCase());
            if (!masterless) {
                throw new SDKError(ERROR_CODE.CANNOT_FIND_ACCOUNT);
            }
            const newListMasterless = listMasterless.filter(node => node.address.toLowerCase() !== address.toLowerCase());
            await this.saveWallet(newListMasterless, password);
        };
        this.restore = async (password) => {
            new Validator("restore-password: ", password).string().required();
            try {
                const wallet = await getStorageMasterless$1(password);
                this.set(wallet);
                return wallet;
            }
            catch (error) {
                let message = "";
                if (error instanceof Error) {
                    message = error.message;
                }
                throw new SDKError(ERROR_CODE.RESTORE_MASTERLESS_WALLET, message);
            }
        };
        this.nodes = undefined;
    }
}

const ETHDerivationPath = "m/44'/60'/0'/0";
const BTCTaprootDerivationPath = "m/86'/0'/0'/0/0";
const BTCSegwitDerivationPath = "m/84'/0'/0'/0/0";

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
const generateHDWalletFromMnemonic = async (mnemonic) => {
    new Validator("Generate mnemonic", mnemonic).mnemonic().required();
    const btcPrivateKey = await generateSegwitHDNodeFromMnemonic$1(mnemonic);
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
const randomMnemonic = async () => {
    const wallet = ethers.ethers.Wallet.createRandom();
    const mnemonic = wallet.mnemonic.phrase;
    new Validator("Generate mnemonic", mnemonic).mnemonic().required();
    const hdWallet = await generateHDWalletFromMnemonic(mnemonic);
    return hdWallet;
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
const bip32$1 = BIP32Factory__default["default"](ecc__namespace);
const validateMnemonicBTC = (mnemonic) => {
    return bip39__namespace.validateMnemonic(mnemonic);
};
const generateTaprootHDNodeFromMnemonic = async (mnemonic) => {
    const isValid = validateMnemonicBTC(mnemonic);
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

bitcoinjsLib.initEccLib(ecc__namespace);
const bip32 = BIP32Factory__default["default"](ecc__namespace);
const generateSegwitHDNodeFromMnemonic = async (mnemonic) => {
    const isValid = validateMnemonicBTC$1(mnemonic);
    if (!isValid) {
        throw new SDKError(ERROR_CODE.MNEMONIC_GEN_SEGWIT);
    }
    const seed = await bip39__namespace.mnemonicToSeed(mnemonic);
    const rootKey = bip32.fromSeed(seed);
    const childNode = rootKey.derivePath(BTCSegwitDerivationPath$1);
    const privateKeyBuffer = childNode.privateKey;
    if (!privateKeyBuffer) {
        throw new SDKError(ERROR_CODE.SEGWIT_FROM_MNEMONIC);
    }
    const privateKeyStr = convertPrivateKey(privateKeyBuffer);
    return privateKeyStr;
};

const validateMasterless = (listMasterless, methodName) => {
    if (listMasterless) {
        for (const node of listMasterless) {
            new Validator(`${methodName}-` + "validate-derive-name", node.name).required();
            new Validator(`${methodName}-` + "validate-derive-index", node.index).required();
            new Validator(`${methodName}-` + "validate-derive-privateKey", node.privateKey).required();
            new Validator(`${methodName}-` + "validate-derive-address", node.address).required();
        }
    }
};
const deriveMasterless = (payload) => {
    const newMasterless = new ethers.ethers.Wallet(payload.privateKey);
    return {
        name: payload.name,
        index: Number(new Date().getTime()),
        privateKey: newMasterless.privateKey,
        address: newMasterless.address,
    };
};
const getStorageMasterlessCipherText = () => {
    return tcStorage.get(StorageKeys.Masterless);
};
const getStorageMasterless = async (password) => {
    const cipherText = await getStorageMasterlessCipherText();
    if (!cipherText) {
        return [];
    }
    const rawText = decryptAES(cipherText, password);
    const listMasterless = JSON.parse(rawText);
    validateMasterless(listMasterless, "getStorageMasterless");
    return listMasterless;
};
const setStorageMasterless = async (wallet, password) => {
    const cipherText = encryptAES(JSON.stringify(wallet), password);
    await tcStorage.set(StorageKeys.Masterless, cipherText);
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
const createInscribeTx = async ({ senderPrivateKey, senderAddress, utxos, inscriptions, feeRatePerByte, data, sequence = DefaultSequenceRBF, isSelectUTXOs = true, metaProtocol = "", }) => {
    const keyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;
    // const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    const internalPubKey = toXOnly$1(keyPair.publicKey);
    // create lock script for commit tx
    const { hashLockKeyPair, hashLockRedeem, script_p2tr } = createLockScriptWithCollection({
        internalPubKey,
        data,
        metaProtocol
    });
    console.log(`createInscribeTx ${hashLockKeyPair}, ${hashLockRedeem}`);
    // const arr = decompile(script_p2tr.output!);
    // console.log(`createInscribeTx ${arr}`);
    // estimate fee and select UTXOs
    const estCommitTxFee = estimateTxFee(1, 2, feeRatePerByte);
    const revealVByte = getRevealVirtualSize$2(hashLockRedeem, script_p2tr, senderAddress, hashLockKeyPair);
    const estRevealTxFee = revealVByte * feeRatePerByte;
    const totalFee = estCommitTxFee + estRevealTxFee;
    // const totalAmount = new BigNumber(totalFee + MinSats); // MinSats for new output in the reveal tx
    // const { selectedUTXOs, totalInputAmount } = selectCardinalUTXOs(utxos, inscriptions, totalAmount);
    if (script_p2tr.address === undefined || script_p2tr.address === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_TAPSCRIPT_ADDRESS, "");
    }
    const { txHex: commitTxHex, txID: commitTxID, fee: commitTxFee, changeAmount, selectedUTXOs, tx } = createTxSendBTC({
        senderPrivateKey,
        senderAddress,
        utxos,
        inscriptions,
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee + MinSats2) }],
        feeRatePerByte,
        sequence,
        isSelectUTXOs
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
    const { revealTxHex, revealTxID } = createRawRevealTx$2({
        commitTxID,
        hashLockKeyPair,
        hashLockRedeem,
        script_p2tr,
        revealTxFee: estRevealTxFee,
        address: senderAddress,
        sequence: 0,
    });
    console.log("commitTxHex: ", commitTxHex);
    console.log("revealTxHex: ", revealTxHex);
    console.log("commitTxID: ", commitTxID);
    console.log("revealTxID: ", revealTxID);
    // const { btcTxID } = await tcClient.submitInscribeTx([commitTxHex, revealTxHex]);
    // console.log("btcTxID: ", btcTxID);
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
const createRawRevealTx$2 = ({ commitTxID, hashLockKeyPair, hashLockRedeem, script_p2tr, revealTxFee, address, sequence = 0, }) => {
    const tapLeafScript = {
        leafVersion: hashLockRedeem?.redeemVersion,
        script: hashLockRedeem?.output,
        controlBlock: script_p2tr.witness[script_p2tr.witness.length - 1],
    };
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    psbt.addInput({
        hash: commitTxID,
        index: 0,
        witnessUtxo: { value: revealTxFee + MinSats2, script: script_p2tr.output },
        tapLeafScript: [
            tapLeafScript
        ],
        sequence,
    });
    // output has OP_RETURN zero value
    // const data = Buffer.from("https://trustless.computer", "utf-8");
    // const scriptEmbed = script.compile([
    //     opcodes.OP_RETURN,
    //     data,
    // ]);
    // psbt.addOutput({
    //     value: 0,
    //     script: scriptEmbed,
    // });
    psbt.addOutput({
        value: MinSats2,
        address: address,
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
const getNumberHex$1 = ({ n, expectedLen = 2, }) => {
    // Convert the number to a hexadecimal string
    const hex = n.toString(16);
    // Ensure it's at least 2 characters by padding with a leading zero
    return hex.padStart(expectedLen, '0');
    // return new BigNumber(n).toString(16);
};
const getMetaProtocolScript$1 = (metaProtocol) => {
    if (metaProtocol === "") {
        return "";
    }
    const metaProtocolHex = Buffer.from(metaProtocol, "utf-8").toString("hex");
    const lenMetaProtocolHex = getNumberHex$1({ n: metaProtocol.length });
    // tag meta protocol + len + metaprotocol
    return "0107" + lenMetaProtocolHex + metaProtocolHex;
};
const getParentInscriptionScript$1 = (parentInscTxID, parentInscTxIndex) => {
    if (parentInscTxID === "") {
        return "";
    }
    const txIDBytes = Buffer.from(parentInscTxID, "hex");
    const txIDBytesRev = txIDBytes.reverse();
    const txIDHex = txIDBytesRev.toString("hex");
    const txIndexHex = getNumberHex$1({ n: parentInscTxIndex });
    const lenParent = getNumberHex$1({ n: (txIDHex.length + txIndexHex.length) / 2 });
    // tag parent + len + parent id
    return "0103" + lenParent + txIDHex + txIndexHex;
};
const createLockScriptWithCollection = ({ internalPubKey, data, metaProtocol = "", parentInscTxID = "", parentInscTxIndex = 0, }) => {
    // Create a tap tree with two spend paths
    // One path should allow spending using secret
    // The other path should pay to another pubkey
    // Make random key pair for hash_lock script
    const hashLockKeyPair = ECPair$1.makeRandom({ network: exports.Network });
    // TODO: comment
    // const hashLockPrivKey = hashLockKeyPair.toWIF();
    // console.log("hashLockPrivKey wif : ", hashLockPrivKey);
    // Note: for debug and test
    // const hashLockPrivKey = "";
    // const hashLockKeyPair = ECPair.fromWIF(hashLockPrivKey);
    // console.log("newKeyPair: ", hashLockKeyPair.privateKey);
    const protocolID = "ord";
    const protocolIDHex = Buffer.from(protocolID, "utf-8").toString("hex");
    // const protocolIDHex = toHex(protocolID);
    // console.log("protocolIDHex: ", protocolIDHex);
    const contentType = "text/plain;charset=utf-8";
    const contentTypeHex = Buffer.from(contentType, "utf-8").toString("hex");
    const contentStrHex = Buffer.from(data, "utf-8").toString("hex");
    // const contentTypeHex = toHex(contentType);
    // const contentStrHex = toHex(data);
    // console.log("contentStrHex: ", contentStrHex);
    // Construct script to pay to hash_lock_keypair if the correct preimage/secret is provided
    // const hashScriptAsm = `${toXOnly(hashLockKeyPair.publicKey).toString("hex")} OP_CHECKSIG OP_0 OP_IF ${protocolIDHex} ${op1} ${contentTypeHex} OP_0 ${contentStrHex} OP_ENDIF`;
    // console.log("InscribeOrd hashScriptAsm: ", hashScriptAsm);
    // const hashLockScript = script.fromASM(hashScriptAsm);
    // const len = contentStrHex.length / 2;
    const lenHex = getNumberHex$1({ n: contentStrHex.length / 2 });
    console.log("lenHex: ", lenHex);
    console.log(`createLockScriptWithCollection ${contentStrHex} ${lenHex}`);
    let hexStr = "20"; // 32 - len public key
    hexStr += toXOnly$1(hashLockKeyPair.publicKey).toString("hex");
    hexStr += "ac0063"; // OP_CHECKSIG OP_0 OP_IF
    hexStr += "03"; // len protocol
    hexStr += protocolIDHex;
    hexStr += "0101";
    hexStr += "18"; // len content type
    hexStr += contentTypeHex;
    hexStr += getMetaProtocolScript$1(metaProtocol);
    hexStr += getParentInscriptionScript$1(parentInscTxID, parentInscTxIndex);
    hexStr += "00"; // op_0
    hexStr += lenHex;
    hexStr += contentStrHex;
    hexStr += "68"; // OP_ENDIF
    console.log("hexStr: ", hexStr);
    // const hexStr = "207022ae3ead9927479c920d24b29249e97ed905ad5865439f962ba765147ee038ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d3800367b2270223a226272632d3230222c226f70223a227472616e73666572222c227469636b223a227a626974222c22616d74223a2231227d68";
    const hashLockScript = Buffer.from(hexStr, "hex");
    console.log("hashLockScript: ", hashLockScript.toString("hex"));
    // const asm2 = script.toASM(hashLockScript);
    // console.log("asm2: ", asm2);
    const hashLockRedeem = {
        output: hashLockScript,
        redeemVersion: 192,
    };
    const scriptTree = hashLockRedeem;
    const script_p2tr = bitcoinjsLib.payments.p2tr({
        internalPubkey: internalPubKey,
        scriptTree,
        redeem: hashLockRedeem,
        network: exports.Network
    });
    console.log("InscribeOrd script_p2tr: ", script_p2tr.address);
    return {
        hashLockKeyPair,
        hashScriptAsm: "",
        hashLockScript,
        hashLockRedeem,
        script_p2tr
    };
};
function getRevealVirtualSize$2(hash_lock_redeem, script_p2tr, p2pktr_addr, hash_lock_keypair) {
    const tapLeafScript = {
        leafVersion: hash_lock_redeem.redeemVersion,
        script: hash_lock_redeem.output,
        controlBlock: script_p2tr.witness[script_p2tr.witness.length - 1]
    };
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    psbt.addInput({
        hash: "00".repeat(32),
        index: 0,
        witnessUtxo: { value: MinSats2 * 2, script: script_p2tr.output },
        tapLeafScript: [
            tapLeafScript
        ]
    });
    // output has OP_RETURN zero value
    // const data = Buffer.from("https://trustless.computer", "utf-8");
    // const scriptEmbed = script.compile([
    //     opcodes.OP_RETURN,
    //     data,
    // ]);
    // psbt.addOutput({
    //     value: 0,
    //     script: scriptEmbed,
    // });
    psbt.addOutput({
        value: MinSats2,
        address: p2pktr_addr,
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
const createInscribeImgTx = async ({ senderPrivateKey, senderAddress, utxos, inscriptions, feeRatePerByte, data, contentType, receiverAddress, sequence = DefaultSequenceRBF, isSelectUTXOs = true, }) => {
    const keyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;
    // const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    const internalPubKey = toXOnly$1(keyPair.publicKey);
    // create lock script for commit tx
    const { hashLockKeyPair, hashLockRedeem, script_p2tr } = await createLockScriptForImageInsc({
        internalPubKey,
        data,
        contentType,
    });
    // estimate fee and select UTXOs
    const estCommitTxFee = estimateTxFee(1, 2, feeRatePerByte);
    const revealVByte = getRevealVirtualSize$1(hashLockRedeem, script_p2tr, senderAddress, hashLockKeyPair);
    const estRevealTxFee = revealVByte * feeRatePerByte;
    const totalFee = estCommitTxFee + estRevealTxFee;
    // const totalAmount = new BigNumber(totalFee + MinSats); // MinSats for new output in the reveal tx
    // const { selectedUTXOs, totalInputAmount } = selectCardinalUTXOs(utxos, inscriptions, totalAmount);
    if (script_p2tr.address === undefined || script_p2tr.address === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_TAPSCRIPT_ADDRESS, "");
    }
    const { txHex: commitTxHex, txID: commitTxID, fee: commitTxFee, changeAmount, selectedUTXOs, tx } = createTxSendBTC({
        senderPrivateKey,
        senderAddress,
        utxos,
        inscriptions,
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee + MinSats2) }],
        feeRatePerByte,
        sequence,
        isSelectUTXOs
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
    const { revealTxHex, revealTxID } = createRawRevealTx$1({
        commitTxID,
        hashLockKeyPair,
        hashLockRedeem,
        script_p2tr,
        revealTxFee: estRevealTxFee,
        address: receiverAddress,
        sequence: 0,
    });
    console.log("commitTxHex: ", commitTxHex);
    console.log("revealTxHex: ", revealTxHex);
    console.log("commitTxID: ", commitTxID);
    console.log("revealTxID: ", revealTxID);
    // const { btcTxID } = await tcClient.submitInscribeTx([commitTxHex, revealTxHex]);
    // console.log("btcTxID: ", btcTxID);
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
const createRawRevealTx$1 = ({ commitTxID, hashLockKeyPair, hashLockRedeem, script_p2tr, revealTxFee, address, sequence = 0, }) => {
    const tapLeafScript = {
        leafVersion: hashLockRedeem?.redeemVersion,
        script: hashLockRedeem?.output,
        controlBlock: script_p2tr.witness[script_p2tr.witness.length - 1],
    };
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    psbt.addInput({
        hash: commitTxID,
        index: 0,
        witnessUtxo: { value: revealTxFee + MinSats2, script: script_p2tr.output },
        tapLeafScript: [
            tapLeafScript
        ],
        sequence,
    });
    // output has OP_RETURN zero value
    // const data = Buffer.from("https://trustless.computer", "utf-8");
    // const scriptEmbed = script.compile([
    //     opcodes.OP_RETURN,
    //     data,
    // ]);
    // psbt.addOutput({
    //     value: 0,
    //     script: scriptEmbed,
    // });
    psbt.addOutput({
        value: MinSats2,
        address: address,
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
// chunkSlice splits input slice into slices
const chunkSlice = (version, slice) => {
    // console.log({ "Len:": slice.length });
    let chunkSize = 520;
    if (slice.length % 520 == 0) {
        chunkSize = 519;
    }
    const chunks = [];
    for (let i = 0; i < slice.length; i += chunkSize) {
        let end = i + chunkSize;
        let sliceCopy = [...slice];
        // necessary check to avoid slicing beyond
        // slice capacity
        if (end > slice.length) {
            end = slice.length;
        }
        let tmp = sliceCopy.slice(i, end);
        // console.log({ i, end, tmp: tmp.length, chunks, "Slice copy leng: ": sliceCopy.length }, sliceCopy);
        if (version >= 3) {
            if (i == slice.length - tmp.length) {
                let newSlice = [];
                newSlice.push(...tmp);
                newSlice.push(0);
                // let originSlice  tmp;
                // let newSlice = Buffer.concat(originSlice. , [0]);
                // originSlice.
                chunks.push(Buffer.from(newSlice));
                break;
            }
        }
        chunks.push(Buffer.from(tmp));
    }
    return chunks;
};
const createLockScriptForImageInsc = ({ internalPubKey, data, contentType, }) => {
    // Create a tap tree with two spend paths
    // One path should allow spending using secret
    // The other path should pay to another pubkey
    // Make random key pair for hash_lock script
    const hashLockKeyPair = ECPair$1.makeRandom({ network: exports.Network });
    // TODO: comment
    // const hashLockPrivKey = hashLockKeyPair.toWIF();
    // console.log("hashLockPrivKey wif : ", hashLockPrivKey);
    // Note: for debug and test
    // const hashLockPrivKey = "";
    // const hashLockKeyPair = ECPair.fromWIF(hashLockPrivKey);
    // console.log("newKeyPair: ", hashLockKeyPair.privateKey);
    const protocolID = "ord";
    const protocolIDHex = Buffer.from(protocolID, "utf-8").toString("hex");
    // const protocolIDHex = toHex(protocolID);
    // console.log("protocolIDHex: ", protocolIDHex);
    // const contentType = "image/png";  // TODO: update to image
    const contentTypeHex = Buffer.from(contentType, "utf-8").toString("hex");
    contentType.length.toString(16);
    // const contentTypeHex = toHex(contentType);
    // console.log("contentTypeHex0: ", contentTypeHex0);
    // console.log("contentTypeHex: ", contentTypeHex);
    // P    string`json:"p"`
    // Op   string`json:"op"`
    // Tick string`json:"tick"`
    // Amt  string`json:"amt"`
    data.toString("hex");
    // const contentStrHex = toHex(data);
    // console.log("contentStrHex: ", contentStrHex);
    // Construct script to pay to hash_lock_keypair if the correct preimage/secret is provided
    const dataChunks = chunkSlice(0, data);
    console.log({ dataChunks });
    // let hashScriptAsm = `${toXOnly(hashLockKeyPair.publicKey).toString("hex")} OP_CHECKSIG OP_0 OP_IF ${protocolIDHex} OP_1 ${contentTypeHex} OP_0 ${contentStrHex} OP_ENDIF`;
    let hashScriptAsm = `${toXOnly$1(hashLockKeyPair.publicKey).toString("hex")} OP_CHECKSIG OP_0 OP_IF ${protocolIDHex} OP_1 ${contentTypeHex} OP_0`;
    for (const chunk of dataChunks) {
        const chunkHex = chunk.toString("hex");
        hashScriptAsm += ` ${chunkHex}`;
    }
    hashScriptAsm += ` OP_ENDIF`;
    console.log("InscribeOrd hashScriptAsm: ", hashScriptAsm);
    const hashLockScript = bitcoinjsLib.script.fromASM(hashScriptAsm);
    console.log({ hashLockScript });
    // const len = contentStrHex.length / 2;
    // const lenHex = len.toString(16);
    // console.log("lenHex: ", lenHex);
    // let hexStr = "20"; // 32 - len public key
    // hexStr += toXOnly(hashLockKeyPair.publicKey).toString("hex");
    // hexStr += "ac0063";  // OP_CHECKSIG OP_0 OP_IF
    // hexStr += "03";  // len protocol
    // hexStr += protocolIDHex;
    // hexStr += "0101";
    // hexStr += contentTypeLenHex;  // len content type = 9
    // hexStr += contentTypeHex;
    // hexStr += "00"; // op_0
    // hexStr += lenHex;
    // hexStr += contentStrHex;
    // hexStr += "68"; // OP_ENDIF
    // console.log("hexStr: ", hexStr);
    // const hashLockScript = Buffer.from(hexStr, "hex");
    console.log("hashLockScript: ", hashLockScript.toString("hex"));
    // const asm2 = script.toASM(hashLockScript);
    // console.log("script asm2 form : ", asm2);
    const hashLockRedeem = {
        output: hashLockScript,
        redeemVersion: 192,
    };
    const scriptTree = hashLockRedeem;
    const script_p2tr = bitcoinjsLib.payments.p2tr({
        internalPubkey: internalPubKey,
        scriptTree,
        redeem: hashLockRedeem,
        network: exports.Network
    });
    console.log("InscribeOrd script_p2tr: ", script_p2tr.address);
    return {
        hashLockKeyPair,
        hashScriptAsm: "",
        hashLockScript,
        hashLockRedeem,
        script_p2tr
    };
};
function getRevealVirtualSize$1(hash_lock_redeem, script_p2tr, p2pktr_addr, hash_lock_keypair) {
    const tapLeafScript = {
        leafVersion: hash_lock_redeem.redeemVersion,
        script: hash_lock_redeem.output,
        controlBlock: script_p2tr.witness[script_p2tr.witness.length - 1]
    };
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    psbt.addInput({
        hash: "00".repeat(32),
        index: 0,
        witnessUtxo: { value: MinSats2 * 2, script: script_p2tr.output },
        tapLeafScript: [
            tapLeafScript
        ]
    });
    const decompliledPubKey = bitcoinjsLib.script.decompile(hash_lock_redeem.output);
    console.log({ script: hash_lock_redeem.output, decompliledPubKey });
    // output has OP_RETURN zero value
    // const data = Buffer.from("https://trustless.computer", "utf-8");
    // const scriptEmbed = script.compile([
    //     opcodes.OP_RETURN,
    //     data,
    // ]);
    // psbt.addOutput({
    //     value: 0,
    //     script: scriptEmbed,
    // });
    psbt.addOutput({
        value: MinSats2,
        address: p2pktr_addr,
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

const getMetaProtocolScript = (metaProtocol) => {
    if (metaProtocol === "") {
        return "";
    }
    const metaProtocolHex = Buffer.from(metaProtocol, "utf-8").toString("hex");
    const lenMetaProtocolHex = getNumberHex$1({ n: metaProtocol.length });
    // tag meta protocol + len + metaprotocol
    return "0107" + lenMetaProtocolHex + metaProtocolHex;
};
const getParentInscriptionScript = (parentInscTxID, parentInscTxIndex) => {
    if (parentInscTxID === "") {
        return "";
    }
    const txIDBytes = Buffer.from(parentInscTxID, "hex");
    const txIDBytesRev = txIDBytes.reverse();
    const txIDHex = txIDBytesRev.toString("hex");
    let txIndexHex = "";
    if (parentInscTxIndex > 0) {
        txIndexHex = getNumberHex$1({ n: parentInscTxIndex });
    }
    const lenParent = getNumberHex$1({ n: (txIDHex.length + txIndexHex.length) / 2 });
    // tag parent + len + parent id
    return "0103" + lenParent + txIDHex + txIndexHex;
};
const toLittleEndianHexStr = (n, byteLength) => {
    const buffer = Buffer.alloc(byteLength); // Allocate a buffer of the desired byte length
    buffer.writeUIntLE(n, 0, byteLength); // Write the number in little-endian format
    return buffer.toString("hex");
};
const getContentScript = (data) => {
    if (data.length <= 75) {
        // use OP_PUSHBYTES
        const contentStrHex = data.toString("hex");
        const lenContentHex = getNumberHex$1({ n: data.length });
        console.log("getContentScript lenContentHex: ", lenContentHex, "contentStrHex: ", contentStrHex);
        const script = lenContentHex + contentStrHex; // len + content
        return script;
    }
    // use OP_PUSHDATA2
    // content 
    const dataChunks = chunkSlice(0, data);
    console.log({ dataChunks });
    let script = "";
    for (const chunk of dataChunks) {
        const chunkLenHex = toLittleEndianHexStr(chunk.length, 2);
        const chunkHex = chunk.toString("hex");
        script = script + "4d" + chunkLenHex + chunkHex; // OP_PUSHDATA2
        console.log(`getContentScript push data ${chunkLenHex} - ${chunkHex}`);
    }
    return script;
};
const createLockScriptGeneral = ({ internalPubKey, data, contentType, metaProtocol = "", parentInscTxID = "", parentInscTxIndex = 0, }) => {
    // Create a tap tree with two spend paths
    // One path should allow spending using secret
    // The other path should pay to another pubkey
    // Make random key pair for hash_lock script
    const hashLockKeyPair = ECPair$1.makeRandom({ network: exports.Network });
    // TODO: comment
    // const hashLockPrivKey = hashLockKeyPair.toWIF();
    // console.log("hashLockPrivKey wif : ", hashLockPrivKey);
    // Note: for debug and test
    // const hashLockPrivKey = "";
    // const hashLockKeyPair = ECPair.fromWIF(hashLockPrivKey);
    // console.log("newKeyPair: ", hashLockKeyPair.privateKey);
    const protocolID = "ord";
    const protocolIDHex = Buffer.from(protocolID, "utf-8").toString("hex");
    // const protocolIDHex = toHex(protocolID);
    // console.log("protocolIDHex: ", protocolIDHex);
    const contentTypeHex = Buffer.from(contentType, "utf-8").toString("hex");
    const contentStrHex = data.toString("hex");
    const lenContentTypeHex = getNumberHex$1({ n: contentType.length });
    const lenContentHex = getNumberHex$1({ n: data.length });
    console.log("createLockScriptGeneral lenContentHex: ", lenContentHex);
    const metaProtocolScript = getMetaProtocolScript(metaProtocol);
    const parentInscScript = getParentInscriptionScript(parentInscTxID, parentInscTxIndex);
    console.log(`createLockScriptGeneral ${metaProtocolScript} ${parentInscScript}`);
    const contentScript = getContentScript(data);
    console.log(`createLockScriptGeneral content ${contentTypeHex} ${contentStrHex}`);
    console.log(`createLockScriptGeneral contentScript ${contentScript}`);
    let hexStr = "20"; // 32 - len public key
    hexStr += toXOnly$1(hashLockKeyPair.publicKey).toString("hex");
    hexStr += "ac0063"; // OP_CHECKSIG OP_0 OP_IF
    hexStr += "03"; // len protocol
    hexStr += protocolIDHex;
    hexStr += "0101";
    hexStr += lenContentTypeHex; // len content type
    hexStr += contentTypeHex; // content type
    hexStr += metaProtocolScript; // meta protocol script (if any)
    hexStr += parentInscScript; // parent insc script (if any)
    hexStr += "00"; // OP_0
    hexStr += getContentScript(data);
    // if (data.length < 520) {
    // }
    // // content 
    // const dataChunks = chunkSlice(0, data);
    // console.log({ dataChunks });
    // for (const chunk of dataChunks) {
    //     hexStr += getNumberHex(chunk.length);
    //     hexStr += chunk.toString("hex")
    // }
    // hexStr += lenContentHex;  // len content
    // hexStr += contentStrHex; // content
    hexStr += "68"; // OP_ENDIF
    console.log("hexStr: ", hexStr);
    // const hexStr = "207022ae3ead9927479c920d24b29249e97ed905ad5865439f962ba765147ee038ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d3800367b2270223a226272632d3230222c226f70223a227472616e73666572222c227469636b223a227a626974222c22616d74223a2231227d68";
    const hashLockScript = Buffer.from(hexStr, "hex");
    console.log("hashLockScript: ", hashLockScript.toString("hex"));
    // const asm2 = script.toASM(hashLockScript);
    // console.log("asm2: ", asm2);
    const hashLockRedeem = {
        output: hashLockScript,
        redeemVersion: 192,
    };
    const scriptTree = hashLockRedeem;
    const script_p2tr = bitcoinjsLib.payments.p2tr({
        internalPubkey: internalPubKey,
        scriptTree,
        redeem: hashLockRedeem,
        network: exports.Network
    });
    console.log("InscribeOrd script_p2tr: ", script_p2tr.address);
    return {
        hashLockKeyPair,
        hashScriptAsm: "",
        hashLockScript,
        hashLockRedeem,
        script_p2tr
    };
};
// make sure the sender of tx create parent insc must be same as the sender of tx create child inscs
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
const createInscribeTxGeneral = async ({ senderPrivateKey, senderAddress, utxos, inscriptions, feeRatePerByte, data, contentType, sequence = DefaultSequenceRBF, isSelectUTXOs = true, metaProtocol = "", parentInscTxID = "", parentInscTxIndex = 0, parentUTXO = undefined, }) => {
    // validate inputs
    if (parentInscTxID !== "") {
        if (!parentUTXO) {
            throw new Error(`Required parent UTXO with parent inscription id: ${parentInscTxID}:${parentInscTxIndex}`);
        }
    }
    const keyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;
    // const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    const internalPubKey = toXOnly$1(keyPair.publicKey);
    // create lock script for commit tx
    const { hashLockKeyPair, hashLockRedeem, script_p2tr } = createLockScriptGeneral({
        internalPubKey,
        data,
        contentType,
        metaProtocol,
        parentInscTxID,
        parentInscTxIndex,
    });
    console.log(`createInscribeTx ${hashLockKeyPair}, ${hashLockRedeem}`);
    // const arr = decompile(script_p2tr.output!);
    // console.log(`createInscribeTx ${arr}`);
    // estimate fee and select UTXOs
    const estCommitTxFee = estimateTxFee(1, 2, feeRatePerByte);
    let revealVByte = getRevealVirtualSize$2(hashLockRedeem, script_p2tr, senderAddress, hashLockKeyPair);
    if (parentUTXO) {
        // extra fee
        revealVByte = revealVByte + 68 + 43; // add more one in, one out
    }
    const estRevealTxFee = revealVByte * feeRatePerByte;
    const totalFee = estCommitTxFee + estRevealTxFee;
    // const totalAmount = new BigNumber(totalFee + MinSats); // MinSats for new output in the reveal tx
    // const { selectedUTXOs, totalInputAmount } = selectCardinalUTXOs(utxos, inscriptions, totalAmount);
    if (script_p2tr.address === undefined || script_p2tr.address === "") {
        throw new SDKError$1(ERROR_CODE$1.INVALID_TAPSCRIPT_ADDRESS, "");
    }
    const { txHex: commitTxHex, txID: commitTxID, fee: commitTxFee, changeAmount, selectedUTXOs, tx } = createTxSendBTC({
        senderPrivateKey,
        senderAddress,
        utxos,
        inscriptions,
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee + MinSats2) }],
        feeRatePerByte,
        sequence,
        isSelectUTXOs
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
    let res;
    if (parentUTXO) {
        console.log("Create tx reveal with parent uxto");
        res = createRawRevealTxWithParentUTXO({
            commitTxID,
            hashLockKeyPair,
            hashLockRedeem,
            script_p2tr,
            revealTxFee: estRevealTxFee,
            receiverAddress: senderAddress,
            parentUTXO: parentUTXO,
            parentAddress: senderAddress,
            parentPrivateKey: senderPrivateKey,
            sequence: 0,
        });
    }
    else {
        // create and sign reveal tx
        res = createRawRevealTx$2({
            commitTxID,
            hashLockKeyPair,
            hashLockRedeem,
            script_p2tr,
            revealTxFee: estRevealTxFee,
            address: senderAddress,
            sequence: 0,
        });
    }
    const revealTxHex = res.revealTxHex;
    const revealTxID = res.revealTxID;
    console.log("commitTxHex: ", commitTxHex);
    console.log("revealTxHex: ", revealTxHex);
    console.log("commitTxID: ", commitTxID);
    console.log("revealTxID: ", revealTxID);
    // const { btcTxID } = await tcClient.submitInscribeTx([commitTxHex, revealTxHex]);
    // console.log("btcTxID: ", btcTxID);
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
const createRawRevealTxWithParentUTXO = ({ commitTxID, hashLockKeyPair, hashLockRedeem, script_p2tr, revealTxFee, receiverAddress, parentUTXO, parentPrivateKey, parentAddress, sequence = 0, }) => {
    // get key info iof parent utxo to sign
    const keyPairInfo = getKeyPairInfo({ privateKey: parentPrivateKey, address: parentAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;
    const tapLeafScript = {
        leafVersion: hashLockRedeem?.redeemVersion,
        script: hashLockRedeem?.output,
        controlBlock: script_p2tr.witness[script_p2tr.witness.length - 1],
    };
    let psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    // the first input is parent utxos
    psbt = addInputs({
        psbt,
        addressType: addressType,
        inputs: [parentUTXO],
        payment: payment,
        sequence,
        keyPair: keyPair,
    });
    // add input to reveal
    psbt.addInput({
        hash: commitTxID,
        index: 0,
        witnessUtxo: { value: revealTxFee + MinSats2, script: script_p2tr.output },
        tapLeafScript: [
            tapLeafScript
        ],
        sequence,
    });
    // the first output: return to parent
    psbt.addOutput({
        value: parentUTXO.value.toNumber(),
        address: parentAddress,
    });
    // the second output: receiver child inscription
    psbt.addOutput({
        value: MinSats2,
        address: receiverAddress,
    });
    // const hash_lock_keypair = ECPair.fromWIF(hashLockPriKey);
    psbt.signInput(0, signer, [sigHashTypeDefault]);
    psbt.signInput(1, hashLockKeyPair);
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
    psbt.finalizeInput(0);
    psbt.finalizeInput(1, customFinalizer);
    const revealTX = psbt.extractTransaction();
    console.log("revealTX: ", revealTX);
    return { revealTxHex: revealTX.toHex(), revealTxID: revealTX.getId() };
};

/**
* createTransferSRC20RawTx creates raw tx to transfer src20 (don't include signing)
* sender address is P2WSH
* @param senderPubKey buffer public key of the inscriber
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the raw transaction
* @returns the total network fee
*/
const createTransferSRC20RawTx = async ({ senderPubKey, senderAddress, utxos, inscriptions, feeRatePerByte, receiverAddress, data, sequence = DefaultSequenceRBF, }) => {
    /* NOTE:
    TX structure:
        Input: cardinal utxos for network fee
        Output:
            0: destination address
            1: multisig address : ScriptPubKeys : 1 encodedJsonData encodedJsonData burnPubkey 3 OP_CHECKMULTISIG
            2: additional multisig address for remain data (if then)
            3: change utxo
    */
    // const keyPairInfo: IKeyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    // const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;
    // const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    // const internalPubKey = toXOnly(senderPubKey);
    // estimate fee and select UTXOs
    const estTxFee = estimateTxFee(1, 4, feeRatePerByte);
    // TODO: adjust amount
    const totalBTC = 333 + MinSats3 * 2 + estTxFee;
    const { selectedUTXOs, totalInputAmount } = selectCardinalUTXOs(utxos, inscriptions, new BigNumber(totalBTC));
    // create multisig scripts for  tx
    const scripts = await createTransferSRC20Script({
        secretKey: selectedUTXOs[0].tx_hash,
        data: data,
    });
    // only btc
    const paymentInfos = [];
    paymentInfos.push({
        address: receiverAddress,
        amount: new BigNumber(333)
    });
    // multisigs
    const paymentScripts = [];
    for (const m of scripts) {
        paymentScripts.push({
            script: m,
            amount: new BigNumber(MinSats3)
        });
    }
    const res = createRawTxSendBTCFromMultisig({
        senderPublicKey: senderPubKey,
        senderAddress,
        utxos: selectedUTXOs,
        inscriptions: {},
        paymentInfos: paymentInfos,
        paymentScripts: paymentScripts,
        feeRatePerByte,
        sequence,
        isSelectUTXOs: false
    });
    console.log("createTransferSRC20Tx tx : ", { res });
    return res;
};
/**
* createTransferSRC20Tx creates commit and reveal tx to inscribe data on Bitcoin netword.
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
const createTransferSRC20Tx = async ({ senderPrivateKey, senderAddress, utxos, inscriptions, feeRatePerByte, receiverAddress, data, sequence = DefaultSequenceRBF, isSelectUTXOs = true, }) => {
    /* NOTE:
    TX structure:
        Input: cardinal utxos for network fee
        Output:
            0: destination address
            1: multisig address : ScriptPubKeys : 1 encodedJsonData encodedJsonData burnPubkey 3 OP_CHECKMULTISIG
            2: additional multisig address for remain data (if then)
            3: change utxo
    */
    const keyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;
    // const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    toXOnly$1(keyPair.publicKey);
    // estimate fee and select UTXOs
    const estTxFee = estimateTxTransferSRC20Fee(1, 2, feeRatePerByte);
    console.log({ estTxFee, feeRatePerByte });
    // TODO: adjust amount
    const totalBTC = 333 + MinSats3 * 2 + estTxFee;
    const { selectedUTXOs, totalInputAmount } = selectCardinalUTXOs(utxos, inscriptions, new BigNumber(totalBTC));
    // create multisig scripts for  tx
    const scripts = await createTransferSRC20Script({
        secretKey: selectedUTXOs[0].tx_hash,
        data: data,
    });
    // only btc
    const paymentInfos = [];
    paymentInfos.push({
        address: receiverAddress,
        amount: new BigNumber(333)
    });
    // multisigs
    const paymentScripts = [];
    for (const m of scripts) {
        paymentScripts.push({
            script: m,
            amount: new BigNumber(MinSats3)
        });
    }
    const { txHex, txID, fee, changeAmount, tx } = createTxSendBTC({
        senderPrivateKey,
        senderAddress,
        utxos: selectedUTXOs,
        inscriptions: {},
        paymentInfos: paymentInfos,
        paymentScripts: paymentScripts,
        feeRatePerByte,
        sequence,
        isSelectUTXOs: false
    });
    console.log("createTransferSRC20Tx tx : ", { txHex, txID, fee, changeAmount, tx });
    return {
        txHex, txID, totalFee: fee, changeAmount, selectedUTXOs
    };
};
// make sure length of multiple of 124 = 62 * 2 (31*2 * 2)
const addZeroTrail = (hexStr) => {
    const lenStr = hexStr.length;
    const r = lenStr % 124;
    console.log({ lenStr });
    let addStr = "";
    if (r > 0) {
        const numAdd = (Math.floor(lenStr / 124) + 1) * 124 - lenStr;
        addStr = addStr.padEnd(numAdd, "0");
        console.log({ numAdd, addStr });
    }
    return hexStr + addStr;
};
/**
* createTransferSRC20Script creates multisig for transfer src20.
* @param secretKey tx ID of vin[0]
* @returns scripts
*/
const createTransferSRC20Script = ({ secretKey, data, }) => {
    /*
        Script structure:
            2 bytes: length of decoded data in hex
            7374616d703a: `stamp:` in lowercase
            remain: SRC-20 JSON data
    */
    const str = "stamp:" + data;
    const len = str.length; //NOTE: len include `stamp:`
    const contentStrHex = Buffer.from(str, "utf-8").toString("hex");
    // const contentStrHex = Buffer.from(data, "utf-8").toString("hex");
    // get length of decode data in hex
    // let len = contentStrHex.length / 2;
    // len += 6 //NOTE: len include `stamp:`
    let lenHex = len.toString(16);
    console.log("lenHex: ", lenHex);
    if (lenHex.length === 2) {
        lenHex = "00" + lenHex;
    }
    const rawDataHex = lenHex + contentStrHex;
    // add zero trailing (if then)
    const rawDataHexWithTrail = addZeroTrail(rawDataHex);
    // arc4 encode rawDataHexWithTrail
    const cipherParams = ARC4Encrypt(secretKey, rawDataHexWithTrail);
    const cipherTextHex = cipherParams.toString(CryptoJS__namespace.format.Hex);
    console.log({ cipherTextHex, len: cipherTextHex.length });
    // split batch 31-byte (62 chars) into script pubkey, append the sign and nonce byte for each batch
    const pubkeyHex = [];
    for (let i = 0; i <= cipherTextHex.length - 62;) {
        const str = cipherTextHex.slice(i, i + 62);
        pubkeyHex.push(str);
        i = i + 62;
    }
    console.log({ pubkeyHex });
    const sign = "02";
    const nonce = "dd";
    let scripts = [];
    for (let i = 0; i <= pubkeyHex.length - 2; i = i + 2) {
        const pubkeys = [
            sign + pubkeyHex[i] + nonce,
            sign + pubkeyHex[i + 1] + nonce,
            '020202020202020202020202020202020202020202020202020202020202020202',
        ];
        let script = "51"; // OP_PUSHNUM_1
        script = script + "21" + pubkeys[0]; // OP_PUSHBYTES_33 + pubkey[0]
        script = script + "21" + pubkeys[1]; // OP_PUSHBYTES_33 + pubkey[1]
        script = script + "21" + pubkeys[2]; // OP_PUSHBYTES_33 + pubkey[2]
        script = script + "53ae"; // OP_PUSHNUM_3 OP_CHECKMULTISIG
        const scriptBytes = Buffer.from(script, "hex");
        // const scriptAsm = `OP_PUSHNUM_1 OP_PUSHBYTES_33 ${pubkeys[0]} OP_PUSHBYTES_33 ${pubkeys[1]} OP_PUSHBYTES_33 ${pubkeys[2]} OP_PUSHNUM_3 OP_CHECKMULTISIG`;
        // console.log("InscribeOrd hashScriptAsm: ", scriptAsm);
        // const scriptBytes = script.fromASM(scriptAsm);
        scripts.push(scriptBytes);
    }
    console.log({ scripts });
    return scripts;
};

const ARC4Encrypt = (secretKey, msg) => {
    const msgBuff = CryptoJS__namespace.enc.Hex.parse(msg);
    const secretKeyBuff = CryptoJS__namespace.enc.Hex.parse(secretKey);
    const res = CryptoJS__namespace.RC4.encrypt(msgBuff, secretKeyBuff);
    return res;
};
const ARC4Decrypt = (secretKey, ciphertext) => {
    const secretKeyBuff = CryptoJS__namespace.enc.Hex.parse(secretKey);
    const res = CryptoJS__namespace.RC4.decrypt(ciphertext, secretKeyBuff);
    return res.toString(CryptoJS__namespace.enc.Hex);
};

var FlagEnum;
(function (FlagEnum) {
    FlagEnum[FlagEnum["Etching"] = 0] = "Etching";
    FlagEnum[FlagEnum["Terms"] = 1] = "Terms";
    FlagEnum[FlagEnum["Cenotaph"] = 127] = "Cenotaph";
})(FlagEnum || (FlagEnum = {}));
class Flag {
    constructor(value) {
        this.flag = value;
    }
    set(flag) {
        const mask = 1n << BigInt(flag);
        this.flag = new z(this.flag.toValue() | mask);
    }
    hasFlag(flag) {
        const mask = 1n << BigInt(flag);
        return (this.flag.toValue() & mask) !== 0n;
    }
    toValue() {
        return this.flag;
    }
}

class Rune {
    constructor(rune) {
        this.rune = rune;
    }
    static fromString(str) {
        let number = 0n;
        for (let i = 0; i < str.length; i += 1) {
            const c = str.charAt(i);
            if (i > 0) {
                number += 1n;
            }
            number *= 26n;
            if (c >= "A" && c <= "Z") {
                number += BigInt(c.charCodeAt(0) - "A".charCodeAt(0));
            }
            else {
                throw new Error(`Invalid character in rune name: ${c}`);
            }
        }
        return new Rune(new J(number));
    }
    commitBuffer() {
        let number = this.rune.toValue();
        const arr = [];
        while (number >> 8n > 0) {
            arr.push(Number(number & 255n));
            number >>= 8n;
        }
        arr.push(Number(number));
        return Buffer.from(arr);
    }
    toString() {
        let n = this.rune.toValue();
        n += 1n;
        let str = "";
        while (n > 0n) {
            str += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Number((n - 1n) % 26n)];
            n = (n - 1n) / 26n;
        }
        return str.split("").reverse().join("");
    }
    toJSON() {
        return this.toString();
    }
}

class RuneId {
    constructor(block, tx) {
        this.block = block;
        this.tx = tx;
    }
    delta(next) {
        const block = next.block.toValue() - this.block.toValue();
        let tx = next.tx.toValue();
        if (block === 0n) {
            tx -= this.tx.toValue();
        }
        return new RuneId(new I(block), new D(tx));
    }
    next(next) {
        const block = this.block.toValue() + next.block.toValue();
        const tx = next.block.toValue() === 0n
            ? this.tx.toValue() + next.tx.toValue()
            : next.tx.toValue();
        return new RuneId(new I(block), new D(tx));
    }
    toJSON() {
        return {
            block: this.block.toString(),
            tx: this.tx.toString(),
        };
    }
}

var Tag;
(function (Tag) {
    Tag[Tag["Body"] = 0] = "Body";
    Tag[Tag["Flags"] = 2] = "Flags";
    Tag[Tag["Rune"] = 4] = "Rune";
    Tag[Tag["Premine"] = 6] = "Premine";
    Tag[Tag["Cap"] = 8] = "Cap";
    Tag[Tag["Amount"] = 10] = "Amount";
    Tag[Tag["HeightStart"] = 12] = "HeightStart";
    Tag[Tag["HeightEnd"] = 14] = "HeightEnd";
    Tag[Tag["OffsetStart"] = 16] = "OffsetStart";
    Tag[Tag["OffsetEnd"] = 18] = "OffsetEnd";
    Tag[Tag["Mint"] = 20] = "Mint";
    Tag[Tag["Pointer"] = 22] = "Pointer";
    Tag[Tag["Cenotaph"] = 126] = "Cenotaph";
    Tag[Tag["Divisibility"] = 1] = "Divisibility";
    Tag[Tag["Spacers"] = 3] = "Spacers";
    Tag[Tag["Symbol"] = 5] = "Symbol";
    Tag[Tag["Nop"] = 127] = "Nop";
})(Tag || (Tag = {}));
var ValueType;
(function (ValueType) {
    ValueType[ValueType["U8"] = 0] = "U8";
    ValueType[ValueType["U16"] = 1] = "U16";
    ValueType[ValueType["U32"] = 2] = "U32";
    ValueType[ValueType["U64"] = 3] = "U64";
    ValueType[ValueType["U128"] = 4] = "U128";
})(ValueType || (ValueType = {}));
class TagPayload {
    constructor(buff) {
        this.payloads = [];
        this.edicts = [];
        this.tagMap = new Map();
        if (!buff) {
            return;
        }
        this.payloads.push(...buff);
    }
    decode() {
        const arr = [];
        let startI = -1;
        for (let i = 0; i < this.payloads.length; i += 1) {
            const byte = this.payloads[i];
            // maximum varuint per byte value is 127
            if ((byte & 128) === 0) {
                if (startI !== -1) {
                    arr.push(q(Buffer.from(this.payloads.slice(startI, i + 1))));
                    startI = -1;
                }
                else {
                    arr.push(BigInt(byte));
                }
                continue;
            }
            if (startI === -1) {
                startI = i;
            }
        }
        for (let i = 0; i < arr.length / 2; i++) {
            const keyI = i * 2;
            const key = arr[keyI];
            // split the edicts data, edict has different data format
            if (Number(key) === Tag.Body) {
                this.edicts = arr.slice(keyI + 1);
                break;
            }
            const valueI = i * 2 + 1;
            if (valueI >= arr.length) {
                throw new Error("Buffer length is not valid");
            }
            const value = arr[valueI];
            const mapValue = this.tagMap.get(Number(key));
            if (mapValue) {
                this.tagMap.set(Number(key), mapValue.concat(value));
                continue;
            }
            this.tagMap.set(Number(key), [value]);
        }
    }
    getValue(tag, valueType, index = 0) {
        const valueArr = this.tagMap.get(tag);
        if (!valueArr) {
            return undefined;
        }
        const value = valueArr[index];
        switch (valueType) {
            case ValueType.U8:
                return new z(value);
            case ValueType.U16:
                return new C(value);
            case ValueType.U32:
                return new D(value);
            case ValueType.U64:
                return new I(value);
            case ValueType.U128:
                return new J(value);
        }
    }
    pushVaruint(varuint) {
        const bytes = varuint.toVaruint();
        for (let i = 0; i < bytes.length; i += 1) {
            this.payloads.push(bytes[i]);
        }
    }
    encodeTagPush(tag, ...ns) {
        for (let i = 0; i < ns.length; i++) {
            const n = ns[i];
            if (n === undefined) {
                continue;
            }
            this.payloads.push(tag);
            this.pushVaruint(n);
        }
    }
    encodeMultiplePush(ns) {
        if (!ns.length) {
            return;
        }
        for (let i = 0; i < ns.length; i++) {
            const n = ns[i];
            if (n === undefined) {
                continue;
            }
            this.pushVaruint(n);
        }
    }
    toBuffer() {
        return Buffer.from(this.payloads);
    }
}

class Symbol$1 {
    constructor(symbol) {
        this.symbol = symbol;
    }
    static fromString(symbolStr) {
        if (symbolStr.length !== 1) {
            throw new Error("Symbol must be 1 character");
        }
        return new Symbol$1(new z(BigInt(Buffer.from(symbolStr, "utf8")[0])));
    }
    toString() {
        return Buffer.from([Number(this.symbol.toValue())]).toString("utf8");
    }
    toJSON() {
        return this.toString();
    }
}

class Runestone {
    constructor(runestone) {
        this.edicts = runestone.edicts;
        this.etching = runestone.etching;
        this.mint = runestone.mint;
        this.pointer = runestone.pointer;
    }
    static dechiper(buff) {
        const tagPayload = new TagPayload(buff);
        tagPayload.decode();
        let etching;
        const flagP = tagPayload.getValue(Tag.Flags, ValueType.U8);
        if (flagP) {
            const flag = new Flag(flagP);
            if (flag.hasFlag(FlagEnum.Etching)) {
                etching = {
                    divisibility: tagPayload.getValue(Tag.Divisibility, ValueType.U8),
                    premine: tagPayload.getValue(Tag.Premine, ValueType.U128),
                    rune: new Rune(tagPayload.getValue(Tag.Rune, ValueType.U128)),
                    spacers: tagPayload.getValue(Tag.Spacers, ValueType.U32),
                    symbol: tagPayload.getValue(Tag.Symbol, ValueType.U8)
                        ? new Symbol$1(tagPayload.getValue(Tag.Symbol, ValueType.U8))
                        : undefined,
                    terms: flag.hasFlag(FlagEnum.Terms)
                        ? {
                            amount: tagPayload.getValue(Tag.Amount, ValueType.U128),
                            cap: tagPayload.getValue(Tag.Cap, ValueType.U128),
                            height: {
                                start: tagPayload.getValue(Tag.HeightStart, ValueType.U64),
                                end: tagPayload.getValue(Tag.HeightEnd, ValueType.U64),
                            },
                            offset: {
                                start: tagPayload.getValue(Tag.OffsetStart, ValueType.U64),
                                end: tagPayload.getValue(Tag.OffsetEnd, ValueType.U64),
                            },
                        }
                        : undefined,
                };
            }
        }
        const pointer = tagPayload.getValue(Tag.Pointer, ValueType.U32);
        const runeIdBlock = tagPayload.getValue(Tag.Mint, ValueType.U64, 0);
        const runeIdTx = tagPayload.getValue(Tag.Mint, ValueType.U64, 1);
        let mint;
        if (runeIdBlock && runeIdTx) {
            mint = new RuneId(runeIdBlock, runeIdTx);
        }
        const edicts = [];
        const edictsP = tagPayload.edicts;
        if (edictsP.length) {
            if (edictsP.length && edictsP.length % 4) {
                throw new Error("Edict data length is not valid");
            }
            let next = new RuneId(new I(0n), new D(0n));
            for (let i = 0; i < edictsP.length / 4; i++) {
                const eI = i * 4;
                const runeId = next.next(new RuneId(new I(edictsP[eI]), new D(edictsP[eI + 1])));
                const amount = edictsP[eI + 2];
                const output = edictsP[eI + 3];
                edicts.push({
                    id: runeId,
                    amount: new J(amount),
                    output: new D(output),
                });
                next = runeId;
            }
        }
        return new Runestone({
            etching: etching,
            edicts,
            pointer,
            mint,
        });
    }
    enchiper() {
        const tag = new TagPayload();
        if (this.etching !== undefined) {
            const etching = this.etching;
            const flag = new Flag(new z(0n));
            flag.set(FlagEnum.Etching);
            if (etching.terms) {
                flag.set(FlagEnum.Terms);
            }
            tag.encodeTagPush(Tag.Flags, flag.toValue());
            tag.encodeTagPush(Tag.Rune, etching.rune?.rune);
            tag.encodeTagPush(Tag.Divisibility, etching.divisibility);
            tag.encodeTagPush(Tag.Spacers, etching.spacers);
            tag.encodeTagPush(Tag.Premine, etching.premine);
            tag.encodeTagPush(Tag.Symbol, etching.symbol?.symbol);
            if (etching.terms) {
                const terms = etching.terms;
                tag.encodeTagPush(Tag.Amount, terms.amount);
                tag.encodeTagPush(Tag.Cap, terms.cap);
                if (terms.height) {
                    tag.encodeTagPush(Tag.HeightStart, terms.height.start);
                    tag.encodeTagPush(Tag.HeightEnd, terms.height.end);
                }
                if (terms.offset) {
                    tag.encodeTagPush(Tag.OffsetStart, terms.offset.start);
                    tag.encodeTagPush(Tag.OffsetEnd, terms.offset.end);
                }
            }
        }
        tag.encodeTagPush(Tag.Pointer, this.pointer);
        if (this.mint !== undefined) {
            tag.encodeTagPush(Tag.Mint, this.mint.block, this.mint.tx);
        }
        if (this.edicts.length) {
            tag.payloads.push(Tag.Body);
            this.edicts.sort((a, b) => {
                return Number(a.id.block.toValue() - b.id.block.toValue() ||
                    a.id.tx.toValue() - b.id.tx.toValue());
            });
            let delta = new RuneId(new I(0n), new D(0n));
            for (let i = 0; i < this.edicts.length; i += 1) {
                const edict = this.edicts[i];
                const runeId = delta.delta(edict.id);
                tag.encodeMultiplePush([
                    runeId.block,
                    runeId.tx,
                    edict.amount,
                    edict.output,
                ]);
                delta = edict.id;
            }
        }
        return tag.toBuffer();
    }
}

class SpacedRune {
    constructor(rune, spacers) {
        this.rune = rune;
        this.spacers = spacers;
    }
    static fromString(str) {
        let runeStr = "";
        let spacers = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            // valid character
            if (/[A-Z]/.test(char)) {
                runeStr += char;
            }
            else if (char === "." || char === "•") {
                const flag = 1 << (runeStr.length - 1);
                if ((spacers & flag) !== 0) {
                    throw new Error("Double spacer");
                }
                spacers |= flag;
            }
            else {
                throw new Error("Invalid spacer character");
            }
        }
        if (32 - Math.clz32(spacers) >= runeStr.length) {
            throw new Error("Trailing spacer");
        }
        return new SpacedRune(Rune.fromString(runeStr), new D(BigInt(spacers)));
    }
    toString() {
        const runeStr = this.rune.toString();
        let result = "";
        for (let i = 0; i < runeStr.length; i += 1) {
            const str = runeStr[i];
            result += str;
            if (this.spacers.toValue() & (1n << BigInt(i))) {
                result += "•";
            }
        }
        return result;
    }
    toJSON() {
        return this.toString();
    }
}

const createRune = ({ runeIDBlockHeight, runeIDTxIndex, runeName, }) => {
    const spacedRune = SpacedRune.fromString(runeName);
    const runestone = new Runestone({
        edicts: [],
        pointer: new D(0n),
        // etching: {
        //     rune: spacedRune.rune,
        //     // spacers: spacedRune.spacers,
        //     // premine: new U128(1000_000n),
        //     // symbol: Symbol.fromString("R"),
        //     // terms: {
        //     //     amount: new U128(1000n),
        //     //     cap: new U128(100n),
        //     // },
        // },
        mint: new RuneId(new I(runeIDBlockHeight), new D(runeIDTxIndex))
    });
    let buffer = runestone.enchiper(); // remove first 2-byte 
    buffer = buffer.slice(2);
    return { buffer, commitBuffer: spacedRune?.rune?.commitBuffer() };
};
const createRuneToEtch = ({ runeName, symbol, }) => {
    console.log("createRuneToEtch symbol: ", symbol, symbol.length);
    const spacedRune = SpacedRune.fromString(runeName);
    // 100000000
    // 10000
    const runestone = new Runestone({
        edicts: [],
        pointer: new D(0n),
        etching: {
            rune: spacedRune.rune,
            spacers: spacedRune.spacers,
            premine: new J(0n),
            symbol: Symbol$1.fromString(symbol),
            terms: {
                amount: new J(10000n),
                cap: new J(10000n), // number mints
            },
        },
        // mint: new RuneId(new U64(runeIDBlockHeight), new U32(runeIDTxIndex))
    });
    let buffer = runestone.enchiper(); // remove first 2-byte 
    // buffer = buffer.slice(2)
    return { buffer, commitBuffer: spacedRune?.rune?.commitBuffer() };
};
const getNumberHex = (n) => {
    // Convert the number to a hexadecimal string
    const hex = n.toString(16);
    // Ensure it's at least 2 characters by padding with a leading zero
    return hex.padStart(2, '0');
};
const createEtchLockScript = (commitBuffer, pubKeyXonly) => {
    // example witness + text inscription
    // *commit buffer is required
    // const ordinalStacks = [
    //     pubKeyXonly,
    //     opcodes.OP_CHECKSIG,
    //     opcodes.OP_FALSE,
    //     opcodes.OP_IF,
    //     Buffer.from("ord", "utf8"),
    //     1,
    //     1,
    //     Buffer.concat([Buffer.from("text/plain;charset=utf-8", "utf8")]),
    //     1,
    //     2,
    //     opcodes.OP_0,
    //     1,
    //     13,
    //     commitBuffer,
    //     // opcodes.OP_0,
    //     // Buffer.concat([Buffer.from("Chainwave", "utf8")]),
    //     opcodes.OP_ENDIF,
    // ];
    const protocolID = "ord";
    const protocolIDHex = Buffer.from(protocolID, "utf-8").toString("hex");
    // const contentType = "text/plain;charset=utf-8";
    // const contentTypeHex = Buffer.from(contentType, "utf-8").toString("hex");
    const contentStrHex = commitBuffer.toString("hex");
    const lenHex = getNumberHex(commitBuffer.length);
    console.log("lenHex: ", lenHex);
    console.log("contentStrHex: ", contentStrHex);
    let hexStr = "20"; // 32 - len public key
    hexStr += pubKeyXonly.toString("hex");
    hexStr += "ac0063"; // OP_CHECKSIG OP_0 OP_IF
    hexStr += "03"; // len protocol
    hexStr += protocolIDHex;
    hexStr += "0102";
    // hexStr += "18";  // len content type
    // hexStr += contentTypeHex;
    hexStr += "00"; // op_0
    hexStr += "010d"; // 
    hexStr += lenHex;
    hexStr += contentStrHex;
    hexStr += "68"; // OP_ENDIF
    console.log("hexStr: ", hexStr);
    // const hexStr = "207022ae3ead9927479c920d24b29249e97ed905ad5865439f962ba765147ee038ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d3800367b2270223a226272632d3230222c226f70223a227472616e73666572222c227469636b223a227a626974222c22616d74223a2231227d68";
    const hashLockScript = Buffer.from(hexStr, "hex");
    const scriptTree = {
        output: hashLockScript,
    };
    const redeem = {
        output: hashLockScript,
        redeemVersion: 192,
    };
    const payment = bitcoinjsLib.payments.p2tr({
        internalPubkey: pubKeyXonly,
        network: tcBTCNetwork,
        scriptTree,
        redeem,
    });
    return {
        hashLockScript: hashLockScript,
        hashLockRedeem: redeem,
        script_p2tr: payment
    };
};
/**
* createInscribeTxEtchRunes creates commit and reveal tx to inscribe data on Bitcoin netword.
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
const createInscribeTxEtchRunes = async ({ senderPrivateKey, senderAddress, utxos, inscriptions, feeRatePerByte, runeName, symbol, receiverInsc, receiverRune, sequence = DefaultSequenceRBF, isSelectUTXOs = true, }) => {
    const keyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;
    // const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    const internalPubKey = toXOnly$1(keyPair.publicKey);
    // create lock script for commit tx
    const rune = createRuneToEtch({ runeName, symbol });
    console.log("Rune commit buffer: ", rune.commitBuffer?.toString("hex"));
    console.log("Rune buffer: ", rune.buffer?.toString("hex"));
    const { hashLockRedeem, script_p2tr } = createEtchLockScript(rune.commitBuffer, internalPubKey);
    const hashLockKeyPair = keyPair; // use the same key pair
    console.log(`createInscribeTxEtchRunes ${hashLockKeyPair}, ${hashLockRedeem}`);
    // const arr = decompile(script_p2tr.output!);
    // console.log(`createInscribeTx ${arr}`);
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
        senderAddress,
        utxos,
        inscriptions,
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee + MinSats2 * 2) }],
        feeRatePerByte,
        sequence,
        isSelectUTXOs
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
        commitTxID,
        hashLockKeyPair,
        hashLockRedeem,
        script_p2tr,
        revealTxFee: estRevealTxFee,
        runeBuffer: rune.buffer,
        receiverInsc,
        receiverRune,
        sequence: 0,
    });
    console.log("commitTxHex: ", commitTxHex);
    console.log("revealTxHex: ", revealTxHex);
    console.log("commitTxID: ", commitTxID);
    console.log("revealTxID: ", revealTxID);
    // const { btcTxID } = await tcClient.submitInscribeTx([commitTxHex, revealTxHex]);
    // console.log("btcTxID: ", btcTxID);
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
const createInscribeTxMintRunes = async ({ senderPrivateKey, senderAddress, utxos, inscriptions, feeRatePerByte, runeIDBlockHeight, runeIDTxIndex, runeName, sequence = DefaultSequenceRBF, isSelectUTXOs = true, }) => {
    const keyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;
    toXOnly$1(keyPair.publicKey);
    // create lock script for commit tx
    const rune = createRune({ runeIDBlockHeight, runeIDTxIndex, runeName });
    console.log("Rune commit buffer: ", rune.commitBuffer?.toString("hex"));
    console.log("Rune buffer: ", rune.buffer?.toString("hex"));
    // the second output: OP_RETURN
    const runeScript = bitcoinjsLib.script.compile([
        bitcoinjsLib.opcodes.OP_RETURN,
        bitcoinjsLib.opcodes.OP_13,
        rune.buffer,
    ]);
    const { txHex, txID, fee, changeAmount, selectedUTXOs, tx } = createTxSendBTC_MintRunes({
        senderPrivateKey,
        senderAddress,
        utxos,
        inscriptions,
        // paymentInfos: [{ address: senderAddress || "", amount: new BigNumber(MinSats2) }],
        paymentInfos: [],
        paymentScripts: [{ amount: new BigNumber(0), script: runeScript }],
        feeRatePerByte,
        sequence,
        isSelectUTXOs
    });
    console.log("mintTxHex: ", txHex);
    console.log("mintTxID: ", txID);
    return {
        txHex,
        txID,
        totalFee: fee,
        selectedUTXOs: selectedUTXOs,
        changeAmount: changeAmount,
    };
};
const createRawRevealTx = ({ commitTxID, hashLockKeyPair, hashLockRedeem, script_p2tr, revealTxFee, runeBuffer, receiverInsc, receiverRune, sequence = 0, }) => {
    const tapLeafScript = {
        leafVersion: hashLockRedeem?.redeemVersion,
        script: hashLockRedeem?.output,
        controlBlock: script_p2tr.witness[script_p2tr.witness.length - 1],
    };
    const psbt = new bitcoinjsLib.Psbt({ network: tcBTCNetwork });
    psbt.addInput({
        hash: commitTxID,
        index: 0,
        witnessUtxo: { value: revealTxFee + MinSats2 * 2, script: script_p2tr.output },
        tapLeafScript: [
            tapLeafScript
        ],
        sequence,
    });
    // output has OP_RETURN zero value
    // const data = Buffer.from("https://trustless.computer", "utf-8");
    // const scriptEmbed = script.compile([
    //     opcodes.OP_RETURN,
    //     data,
    // ]);
    // psbt.addOutput({
    //     value: 0,
    //     script: scriptEmbed,
    // });
    // the first output: runes receiver address
    psbt.addOutput({
        value: MinSats2,
        address: receiverInsc,
    });
    psbt.addOutput({
        value: MinSats2,
        address: receiverRune,
    });
    // the second output: OP_RETURN
    const runeScript = bitcoinjsLib.script.compile([
        bitcoinjsLib.opcodes.OP_RETURN,
        bitcoinjsLib.opcodes.OP_13,
        runeBuffer,
    ]);
    psbt.addOutput({
        script: runeScript,
        value: 0,
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
        witnessUtxo: { value: MinSats2 * 2, script: script_p2tr.output },
        tapLeafScript: [
            tapLeafScript
        ]
    });
    // output has OP_RETURN zero value
    // const data = Buffer.from("https://trustless.computer", "utf-8");
    // const scriptEmbed = script.compile([
    //     opcodes.OP_RETURN,
    //     data,
    // ]);
    // psbt.addOutput({
    //     value: 0,
    //     script: scriptEmbed,
    // });
    psbt.addOutput({
        value: MinSats2,
        address: p2pktr_addr,
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

exports.ARC4Decrypt = ARC4Decrypt;
exports.ARC4Encrypt = ARC4Encrypt;
exports.BNZero = BNZero;
exports.BTCAddressType = BTCAddressType;
exports.BTCSegwitDerivationPath = BTCSegwitDerivationPath;
exports.BTCTaprootDerivationPath = BTCTaprootDerivationPath;
exports.DefaultEndpointTCNodeMainnet = DefaultEndpointTCNodeMainnet;
exports.DefaultSequence = DefaultSequence;
exports.DefaultSequenceRBF = DefaultSequenceRBF;
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
exports.MaxTxSize = MaxTxSize;
exports.MinSats = MinSats;
exports.MinSats2 = MinSats2;
exports.MinSats3 = MinSats3;
exports.NetworkType = NetworkType$1;
exports.OutputSize = OutputSize;
exports.Regtest = Regtest;
exports.SDKError = SDKError$1;
exports.ServiceGetUTXOType = ServiceGetUTXOType;
exports.StorageService = StorageService;
exports.TcClient = TcClient;
exports.Testnet = Testnet;
exports.URL_MAINNET = URL_MAINNET;
exports.URL_REGTEST = URL_REGTEST;
exports.Validator = Validator$1;
exports.WalletType = WalletType;
exports.actionRequest = actionRequest;
exports.addInputs = addInputs;
exports.addZeroTrail = addZeroTrail;
exports.aggregateUTXOs = aggregateUTXOs;
exports.broadcastTx = broadcastTx;
exports.convertPrivateKey = convertPrivateKey$1;
exports.convertPrivateKeyFromStr = convertPrivateKeyFromStr;
exports.createBatchInscribeTxs = createBatchInscribeTxs;
exports.createInscribeImgTx = createInscribeImgTx;
exports.createInscribeTx = createInscribeTx$1;
exports.createInscribeTxEtchRunes = createInscribeTxEtchRunes;
exports.createInscribeTxFromAnyWallet = createInscribeTxFromAnyWallet;
exports.createInscribeTxGeneral = createInscribeTxGeneral;
exports.createInscribeTxMintRunes = createInscribeTxMintRunes;
exports.createLockScript = createLockScript;
exports.createRawRevealTx = createRawRevealTx$3;
exports.createRawTx = createRawTx;
exports.createRawTxSendBTC = createRawTxSendBTC;
exports.createRawTxSendBTCFromMultisig = createRawTxSendBTCFromMultisig;
exports.createTransferSRC20RawTx = createTransferSRC20RawTx;
exports.createTransferSRC20Script = createTransferSRC20Script;
exports.createTransferSRC20Tx = createTransferSRC20Tx;
exports.createTx = createTx;
exports.createTxFromAnyWallet = createTxFromAnyWallet;
exports.createTxSendBTC = createTxSendBTC;
exports.createTxSendBTC_MintRunes = createTxSendBTC_MintRunes;
exports.createTxSendMultiReceivers = createTxSendMultiReceivers;
exports.createTxWithSpecificUTXOs = createTxWithSpecificUTXOs;
exports.decryptAES = decryptAES$1;
exports.decryptWallet = decryptWallet;
exports.deriveETHWallet = deriveETHWallet;
exports.deriveHDNodeByIndex = deriveHDNodeByIndex;
exports.deriveMasterless = deriveMasterless;
exports.derivePasswordWallet = derivePasswordWallet;
exports.deriveSegwitWallet = deriveSegwitWallet;
exports.encryptAES = encryptAES$1;
exports.encryptWallet = encryptWallet;
exports.estimateInscribeFee = estimateInscribeFee;
exports.estimateNumInOutputs = estimateNumInOutputs;
exports.estimateNumInOutputsForBuyInscription = estimateNumInOutputsForBuyInscription;
exports.estimateTxFee = estimateTxFee;
exports.estimateTxSize = estimateTxSize;
exports.estimateTxTransferSRC20Fee = estimateTxTransferSRC20Fee;
exports.filterAndSortCardinalUTXOs = filterAndSortCardinalUTXOs;
exports.findExactValueUTXO = findExactValueUTXO;
exports.fromSat = fromSat;
exports.generateHDWalletFromMnemonic = generateHDWalletFromMnemonic;
exports.generateP2PKHKeyFromRoot = generateP2PKHKeyFromRoot;
exports.generateP2PKHKeyPair = generateP2PKHKeyPair;
exports.generateP2WPKHKeyPair = generateP2WPKHKeyPair;
exports.generateP2WPKHKeyPairFromPubKey = generateP2WPKHKeyPairFromPubKey;
exports.generateSegwitHDNodeFromMnemonic = generateSegwitHDNodeFromMnemonic;
exports.generateTaprootAddress = generateTaprootAddress;
exports.generateTaprootAddressFromPubKey = generateTaprootAddressFromPubKey;
exports.generateTaprootHDNodeFromMnemonic = generateTaprootHDNodeFromMnemonic;
exports.generateTaprootKeyPair = generateTaprootKeyPair;
exports.getAddressType = getAddressType;
exports.getBTCBalance = getBTCBalance;
exports.getBitcoinKeySignContent = getBitcoinKeySignContent;
exports.getKeyPairInfo = getKeyPairInfo;
exports.getNumberHex = getNumberHex$1;
exports.getOutputCoinValue = getOutputCoinValue;
exports.getRuneBalance = getRuneBalance;
exports.getRuneBalanceByRuneID = getRuneBalanceByRuneID;
exports.getStorageHDWallet = getStorageHDWallet;
exports.getStorageHDWalletCipherText = getStorageHDWalletCipherText;
exports.getStorageMasterless = getStorageMasterless;
exports.getStorageMasterlessCipherText = getStorageMasterlessCipherText;
exports.getTxFromBlockStream = getTxFromBlockStream;
exports.getUTXOs = getUTXOs;
exports.getUTXOsFromBlockStream = getUTXOsFromBlockStream;
exports.handleSignPsbtWithSpecificWallet = handleSignPsbtWithSpecificWallet;
exports.importBTCPrivateKey = importBTCPrivateKey;
exports.increaseGasPrice = increaseGasPrice;
exports.isRBFable = isRBFable;
exports.ordCreateInscribeTx = createInscribeTx;
exports.randomMnemonic = randomMnemonic;
exports.randomTaprootWallet = randomTaprootWallet;
exports.replaceByFeeInscribeTx = replaceByFeeInscribeTx;
exports.requestAccountResponse = requestAccountResponse;
exports.selectCardinalUTXOs = selectCardinalUTXOs;
exports.selectInscriptionUTXO = selectInscriptionUTXO;
exports.selectTheSmallestUTXO = selectTheSmallestUTXO;
exports.selectUTXOs = selectUTXOs;
exports.selectUTXOsToCreateBuyTx = selectUTXOsToCreateBuyTx;
exports.selectUTXOsV2 = selectUTXOsV2;
exports.setBTCNetwork = setBTCNetwork$1;
exports.setStorageHDWallet = setStorageHDWallet;
exports.setStorageMasterless = setStorageMasterless;
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
exports.validateMasterless = validateMasterless;
exports.validateMnemonicBTC = validateMnemonicBTC;
//# sourceMappingURL=index.js.map
