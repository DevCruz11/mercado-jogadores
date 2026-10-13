import { ReactNode, useId } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: (inputProps: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
  }) => ReactNode;
}

export function FormField({ label, error, hint, children }: FormFieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error || hint ? messageId : undefined,
      })}
      {(error || hint) && (
        <span id={messageId} className={error ? 'field__error' : 'field__hint'}>
          {error ?? hint}
        </span>
      )}
    </div>
  );
}
