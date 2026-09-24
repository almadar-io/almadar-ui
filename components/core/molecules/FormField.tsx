/**
 * FormField Molecule Component
 * 
 * A form field wrapper with label, hint, and error message support.
 * **Atomic Design**: Composed using Label and Typography atoms.
 */

import React from 'react';
import { cn } from '../../../lib/cn';
import { Label } from '../atoms/Label';
import { Typography } from '../atoms/Typography';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  hint,
  className,
  children,
}) => {
  // A single field child is named by the label (its own id kept when given).
  const generatedId = React.useId();
  const field = React.Children.count(children) === 1 && React.isValidElement<{ id?: string }>(children)
    ? children
    : null;
  const fieldId = field ? field.props.id ?? generatedId : undefined;
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label required={required} htmlFor={fieldId}>{label}</Label>
      {field ? React.cloneElement(field, { id: fieldId }) : children}
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
      {hint && !error && (
        <Typography variant="caption" color="muted">
          {hint}
        </Typography>
      )}
    </div>
  );
};

FormField.displayName = 'FormField';
