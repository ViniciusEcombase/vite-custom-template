import React, { useState, useCallback, useEffect, useMemo } from 'react';

const DEFAULT_REQUIREMENTS = [
  {
    id: 'length',
    text: 'At least 8 characters',
    ariaLabel: 'Password must be at least 8 characters long',
    test: (pwd) => pwd.length >= 8,
    weight: 1,
  },
  {
    id: 'lowercase',
    text: 'One lowercase letter',
    ariaLabel: 'Password must contain at least one lowercase letter',
    test: (pwd) => /[a-z]/.test(pwd),
    weight: 1,
  },
  {
    id: 'uppercase',
    text: 'One uppercase letter',
    ariaLabel: 'Password must contain at least one uppercase letter',
    test: (pwd) => /[A-Z]/.test(pwd),
    weight: 1,
  },
  {
    id: 'number',
    text: 'One number',
    ariaLabel: 'Password must contain at least one number',
    test: (pwd) => /\d/.test(pwd),
    weight: 1,
  },
  {
    id: 'special',
    text: 'One special character',
    ariaLabel: 'Password must contain at least one special character',
    test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd),
    weight: 1,
  },
];

const STRENGTH_LEVELS = [
  { id: 'very-weak', label: 'Very Weak', score: 0, color: '#ff4444' },
  { id: 'weak', label: 'Weak', score: 1, color: '#ff8800' },
  { id: 'fair', label: 'Fair', score: 2, color: '#ffaa00' },
  { id: 'good', label: 'Good', score: 3, color: '#88bb00' },
  { id: 'strong', label: 'Strong', score: 4, color: '#44aa44' },
  { id: 'very-strong', label: 'Very Strong', score: 5, color: '#00aa44' },
];

/**
 * Custom hook for password strength validation and requirements checking
 * @param {string} password - The password to validate
 * @param {Object} options - Configuration options
 * @param {Array} options.customRequirements - Custom requirements array to override defaults
 * @param {boolean} options.enableScoring - Whether to enable advanced scoring (default: true)
 * @param {number} options.debounceMs - Debounce delay for validation (default: 0)
 * @returns {Object} Password validation results and utilities
 */
const usePasswordRequirements = (password = '', options = {}) => {
  const { customRequirements, enableScoring = true, debounceMs = 0 } = options;

  const [debouncedPassword, setDebouncedPassword] = useState(password);

  // Debounce password input for performance
  useEffect(() => {
    if (debounceMs > 0) {
      const timer = setTimeout(() => {
        setDebouncedPassword(password);
      }, debounceMs);
      return () => clearTimeout(timer);
    } else {
      setDebouncedPassword(password);
    }
  }, [password, debounceMs]);

  const requirements = useMemo(
    () => customRequirements || DEFAULT_REQUIREMENTS,
    [customRequirements]
  );

  // Memoize requirement results to avoid recalculating
  const requirementResults = useMemo(() => {
    return requirements.map((req) => ({
      ...req,
      passed: req.test(debouncedPassword),
    }));
  }, [requirements, debouncedPassword]);

  const validCount = useMemo(
    () => requirementResults.filter((req) => req.passed).length,
    [requirementResults]
  );

  const totalRequirements = requirements.length;
  const passedPercentage = Math.round((validCount / totalRequirements) * 100);

  // Advanced scoring system
  const score = useMemo(() => {
    if (!enableScoring) return validCount;

    let calculatedScore = 0;

    // Base score from requirements
    requirementResults.forEach((req) => {
      if (req.passed) {
        calculatedScore += req.weight || 1;
      }
    });

    // Bonus points for longer passwords
    if (debouncedPassword.length >= 12) calculatedScore += 0.5;
    if (debouncedPassword.length >= 16) calculatedScore += 0.5;

    // Bonus for character diversity
    const uniqueChars = new Set(debouncedPassword.toLowerCase()).size;
    if (uniqueChars >= 8) calculatedScore += 0.3;

    // Penalty for common patterns
    if (/(.)\1{2,}/.test(debouncedPassword)) calculatedScore -= 0.5; // Repeated characters
    if (/123|abc|qwe/i.test(debouncedPassword)) calculatedScore -= 0.3; // Sequential patterns

    return Math.max(0, Math.min(calculatedScore, totalRequirements + 1));
  }, [requirementResults, debouncedPassword, enableScoring, totalRequirements]);

  const strengthLevel = useMemo(() => {
    const normalizedScore =
      (score / totalRequirements) * (STRENGTH_LEVELS.length - 1);
    const levelIndex = Math.min(
      Math.floor(normalizedScore),
      STRENGTH_LEVELS.length - 1
    );
    return STRENGTH_LEVELS[levelIndex];
  }, [score, totalRequirements]);

  const isStrong = useMemo(
    () => validCount >= totalRequirements && score >= totalRequirements * 0.8,
    [validCount, totalRequirements, score]
  );

  const isValid = useMemo(
    () => validCount >= totalRequirements,
    [validCount, totalRequirements]
  );

  // Accessibility helpers
  const getAriaDescription = useCallback(() => {
    const failedRequirements = requirementResults
      .filter((req) => !req.passed)
      .map((req) => req.ariaLabel || req.text);

    if (failedRequirements.length === 0) {
      return 'Password meets all requirements';
    }

    return `Password missing: ${failedRequirements.join(', ')}`;
  }, [requirementResults]);

  const getStrengthAriaLabel = useCallback(() => {
    return `Password strength: ${strengthLevel.label}. ${validCount} of ${totalRequirements} requirements met.`;
  }, [strengthLevel.label, validCount, totalRequirements]);

  // Utility functions
  const getFailedRequirements = useCallback(() => {
    return requirementResults.filter((req) => !req.passed);
  }, [requirementResults]);

  const getPassedRequirements = useCallback(() => {
    return requirementResults.filter((req) => req.passed);
  }, [requirementResults]);

  const reset = useCallback(() => {
    setDebouncedPassword('');
  }, []);

  return {
    // Core validation data
    requirements: requirementResults,
    validCount,
    totalRequirements,
    passedPercentage,
    score,

    // Strength assessment
    strengthLevel,
    strengthClass: strengthLevel.id, // For backward compatibility
    isStrong,
    isValid,

    // Accessibility
    ariaDescription: getAriaDescription(),
    strengthAriaLabel: getStrengthAriaLabel(),

    // Utility functions
    getFailedRequirements,
    getPassedRequirements,
    reset,

    // Configuration
    enableScoring,
    debounceMs,
  };
};

export default usePasswordRequirements;
