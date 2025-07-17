const PasswordInput = ({
  id,
  label,
  onInputChange,
  placeholder = 'Enter your password',
}) => {
  const [password, setPassword] = useState('');
  const [showRequirements, setShowRequirements] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validatePassword = useCallback((pwd) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(pwd);
  }, []);

  useEffect(() => {
    const valid = validatePassword(password);
    setIsValid(valid);
    onInputChange({ id, value: password, isValid: valid });
  }, [password, validatePassword, onInputChange, id]);

  const handleChange = (e) => {
    setPassword(e.target.value);
  };

  const handleFocus = () => {
    setShowRequirements(true);
  };

  const handleBlur = () => {
    // Keep requirements visible if password is not valid
    if (isValid) {
      setShowRequirements(false);
    }
  };

  return (
    <div className="mb-4">
      <label
        className="block text-sm font-medium text-gray-700 mb-2"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        id={id}
        type="password"
        value={password}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          password.length > 0
            ? isValid
              ? 'border-green-500'
              : 'border-red-500'
            : 'border-gray-300'
        }`}
      />
      <PasswordRequirements password={password} isVisible={showRequirements} />
    </div>
  );
};
