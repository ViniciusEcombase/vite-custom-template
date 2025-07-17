const PasswordRequirements = ({ password, isVisible }) => {
  const requirements = [
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
  ];

  if (!isVisible) return null;

  return (
    <div className="mt-2 p-3 bg-gray-50 border rounded-md transition-all duration-300">
      <p className="text-sm font-medium text-gray-700 mb-2">
        Password requirements:
      </p>
      <div className="space-y-1">
        {requirements.map((req) => {
          const isValid = req.test(password);
          return (
            <div key={req.id} className="flex items-center space-x-2">
              <div
                className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                  isValid ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {isValid ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <X className="w-3 h-3 text-white" />
                )}
              </div>
              <span
                className={`text-sm ${
                  isValid ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {req.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
