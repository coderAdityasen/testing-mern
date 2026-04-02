// Simple test to verify backend setup
describe('Backend Setup', () => {
  test('should load environment variables correctly', () => {
    expect(process.env).toBeDefined();
  });

  test('should have required dependencies', () => {
    const express = require('express');
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    
    expect(express).toBeDefined();
    expect(mongoose).toBeDefined();
    expect(dotenv).toBeDefined();
  });

  test('should have required packages installed', () => {
    // Check if all dependencies are loadable
    const packages = ['cors', 'bcryptjs', 'jsonwebtoken'];
    
    packages.forEach(pkg => {
      expect(() => require(pkg)).not.toThrow();
    });
  });

  test('basic arithmetic should work', () => {
    expect(2 + 2).toBe(4);
  });
});
