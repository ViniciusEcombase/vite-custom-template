import React, { useState, useCallback, useEffect, useMemo } from 'react';

const usePasswordRequirements = (password) => {
  const requirements = useMemo(
    () => [
      {
        id: 'length',
        text: 'At least 8 characters',
        test: (pwd) => pwd.length >= 8,
      },
      {
        id: 'lowercase',
        text: 'One lowercase letter',
        test: (pwd) => /[a-z]/.test(pwd),
      },
      {
        id: 'uppercase',
        text: 'One uppercase letter',
        test: (pwd) => /[A-Z]/.test(pwd),
      },
      {
        id: 'number',
        text: 'One number',
        test: (pwd) => /\d/.test(pwd),
      },
      {
        id: 'special',
        text: 'One special character (@$!%*?&)',
        test: (pwd) => /[@$!%*?&]/.test(pwd),
      },
    ],
    []
  );

  const validCount = useMemo(
    () => requirements.filter((req) => req.test(password)).length,
    [requirements, password]
  );

  const strengthClass = useMemo(() => {
    const strengthClasses = ['weak', 'fair', 'good', 'strong', 'very-strong'];
    return strengthClasses[Math.min(validCount, 4)];
  }, [validCount]);

  return { requirements, validCount, strengthClass };
};

export default usePasswordRequirements;
