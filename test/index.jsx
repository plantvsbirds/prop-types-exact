import { expect } from 'chai';
import React from 'react';
import ownKeys from 'reflect.ownkeys';

import exact from '../';

import callValidator from './helpers/callValidator';

function stringSort(a, b) {
  if (typeof a !== 'string') {
    return 1;
  }
  if (typeof b !== 'string') {
    return -1;
  }
  return b.localeCompare(a);
}

describe('exact', () => {
  let specialProperty;
  before(() => {
    [specialProperty] = ownKeys(exact({}));
  });

  function assertPasses(validator, element, propName, componentName) {
    expect(callValidator(validator, element, propName, componentName)).to.equal(null);
  }

  function assertFails(validator, element, propName, componentName) {
    expect(callValidator(validator, element, propName, componentName)).to.be.instanceOf(Error);
  }

  it('throws when the given propTypes is not an object', () => {
    expect(() => exact()).to.throw(TypeError);
    expect(() => exact(undefined)).to.throw(TypeError);
    expect(() => exact(null)).to.throw(TypeError);
    expect(() => exact('')).to.throw(TypeError);
    expect(() => exact(42)).to.throw(TypeError);
    expect(() => exact(true)).to.throw(TypeError);
    expect(() => exact(false)).to.throw(TypeError);
    expect(() => exact(() => {})).to.throw(TypeError);
  });

  it('throws when the given propTypes has the magic property', () => {
    expect(() => exact({ [specialProperty]: true })).to.throw(TypeError);
  });

  it('returns an object', () => {
    expect(typeof exact({})).to.equal('object');
  });

  it('adds one extra key', () => {
    const propTypes = { a: 1, b: 2, c: 3 };
    const result = exact(propTypes);
    const resultOwnKeys = ownKeys(result).sort(stringSort);
    const propTypesOwnKeys = ownKeys(propTypes).concat(specialProperty).sort(stringSort);
    expect(resultOwnKeys).to.eql(propTypesOwnKeys);
  });

  it('allows for merging of propTypes that have been processed', () => {
    expect(() => exact(exact({}))).not.to.throw();
  });

  describe('forbid()', () => {
    const knownProp = 'a';

    let validator;
    beforeEach(() => {
      validator = exact({ [knownProp]() {} })[specialProperty];
    });

    it('adds a function', () => {
      expect(typeof validator).to.equal('function');
    });

    it('passes when given no props', () => {
      assertPasses(validator, <div />, specialProperty, 'Foo');
    });

    it('passes when given only known props', () => {
      assertPasses(validator, <div {...{ [knownProp]: true }} />, specialProperty, 'Foo');
    });

    it('fails when given an unknown prop', () => {
      assertFails(validator, <div unknown {...{ [knownProp]: true }} />, specialProperty, 'Foo');
    });
  });
});
