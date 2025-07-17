const Input = ({ id, label, type = 'text', onInputChange, placeholder }) => {
  const [value, setValue] = useState('');
  const [isValid, setIsValid] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    const valid = type === 'email' ? validateEmail(value) : value.length > 0;
    setIsValid(valid);
    onInputChange({ id, value, isValid: valid });
  }, [value, type, onInputChange, id]);

  const handleChange = (e) => {
    setValue(e.target.value);
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
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          value.length > 0
            ? isValid
              ? 'border-green-500'
              : 'border-red-500'
            : 'border-gray-300'
        }`}
      />
      {value.length > 0 && !isValid && (
        <span className="text-red-500 text-sm mt-1 block">
          {type === 'email'
            ? 'Please enter a valid email address'
            : 'This field is required'}
        </span>
      )}
    </div>
  );
};
