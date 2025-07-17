const FormComponent = () => {
  const [formData, setFormData] = useState({
    email: { value: '', isValid: false },
    password: { value: '', isValid: false },
  });

  const handleInputChange = useCallback(({ id, value, isValid }) => {
    setFormData((prev) => ({
      ...prev,
      [id]: { value, isValid },
    }));
  }, []);

  const handleSubmit = () => {
    const allValid = Object.values(formData).every((field) => field.isValid);

    if (allValid) {
      const values = Object.keys(formData).reduce((acc, key) => {
        acc[key] = formData[key].value;
        return acc;
      }, {});

      console.log('Form submitted:', values);
      alert('Account created successfully!');
    } else {
      alert('Please complete all fields correctly');
    }
  };

  const isFormValid = Object.values(formData).every((field) => field.isValid);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create Account
          </h1>

          <div className="space-y-4">
            <Input
              id="email"
              label="Email Address"
              type="email"
              onInputChange={handleInputChange}
              placeholder="Enter your email"
            />

            <PasswordInput
              id="password"
              label="Password"
              onInputChange={handleInputChange}
              placeholder="Create a secure password"
            />

            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                isFormValid
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form State Display */}
          <div className="mt-6 p-3 bg-gray-100 rounded-md">
            <h3 className="text-sm font-semibold mb-2">Form Status:</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Email:</span>
                <span
                  className={
                    formData.email.isValid ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {formData.email.isValid ? '✓ Valid' : '✗ Invalid'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <span
                  className={
                    formData.password.isValid
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {formData.password.isValid ? '✓ Valid' : '✗ Invalid'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
