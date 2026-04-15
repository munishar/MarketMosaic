import React, { useMemo, useCallback } from 'react';
import type { FieldRendererProps } from './TextFieldRenderer';
import { Input } from '@/components/ui/Input';

interface AddressValue {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

/** Multi-field renderer for address type */
export const AddressFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  const address: AddressValue = useMemo(() => {
    if (value && typeof value === 'object') return value as AddressValue;
    return {};
  }, [value]);

  const handleFieldChange = useCallback(
    (key: keyof AddressValue, fieldValue: string) => {
      onChange({ ...address, [key]: fieldValue });
    },
    [address, onChange],
  );

  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-medium text-gray-700">{field.label}</label>
      <Input
        placeholder="Street Address"
        value={address.street ?? ''}
        onChange={(e) => handleFieldChange('street', e.target.value)}
        disabled={disabled}
      />
      <div className="grid grid-cols-3 gap-2">
        <Input
          placeholder="City"
          value={address.city ?? ''}
          onChange={(e) => handleFieldChange('city', e.target.value)}
          disabled={disabled}
        />
        <Input
          placeholder="State"
          value={address.state ?? ''}
          onChange={(e) => handleFieldChange('state', e.target.value)}
          disabled={disabled}
        />
        <Input
          placeholder="ZIP Code"
          value={address.zip ?? ''}
          onChange={(e) => handleFieldChange('zip', e.target.value)}
          disabled={disabled}
        />
      </div>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
};
