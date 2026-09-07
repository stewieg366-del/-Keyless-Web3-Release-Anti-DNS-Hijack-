// @ts-nocheck
import * as nodeUtilPolyfill from 'real-util';
import isEqual from 'fast-deep-equal';

module.exports = {
  ...nodeUtilPolyfill,
  isDeepStrictEqual: isEqual,
};
