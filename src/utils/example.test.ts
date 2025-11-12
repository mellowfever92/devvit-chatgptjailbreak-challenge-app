import { describe, it, expect } from 'vitest';

/**
 * Example test suite
 * This file demonstrates how to write tests for your Devvit app
 */

describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4);
  });
});

// Example of testing utility functions
describe('String utilities', () => {
  it('should concatenate strings', () => {
    const result = 'Hello' + ' ' + 'World';
    expect(result).toBe('Hello World');
  });
});
