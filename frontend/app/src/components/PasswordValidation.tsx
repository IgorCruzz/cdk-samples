import { Check, X } from 'lucide-react';

const PasswordValidation = ({ password }: { password: string }) => {
  const validations = [
    { label: 'Mínimo 8 caracteres', valid: password.length >= 8 },
    { label: 'Letra minúscula', valid: /[a-z]/.test(password) },
    { label: 'Letra maiúscula', valid: /[A-Z]/.test(password) },
    { label: 'Número', valid: /[0-9]/.test(password) },
  ];

  return (
    <ul className="mt-2 text-sm space-y-1">
      {validations.map(({ label, valid }) => (
        <li key={label} className={`flex items-center gap-2 ${valid ? 'text-green-600' : 'text-red-600'}`}>
          {valid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {label}
        </li>
      ))}
    </ul>
  );
};

export default PasswordValidation;
