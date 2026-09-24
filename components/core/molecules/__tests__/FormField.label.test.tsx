import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FormField } from '../FormField';
import { Input } from '../../atoms/Input';
import { EventBusProvider } from '../../../../providers/EventBusProvider';

const wrap = (node: React.ReactNode) => render(<EventBusProvider debug={false}>{node}</EventBusProvider>);

describe('FormField label', () => {
    it('names its field', () => {
        const { getByLabelText } = wrap(<FormField label="Company"><Input name="company" /></FormField>);
        expect(getByLabelText('Company').getAttribute('name')).toBe('company');
    });

    it('keeps the field id the caller gave', () => {
        const { getByLabelText } = wrap(<FormField label="Seats"><Input id="seats" name="seats" /></FormField>);
        expect(getByLabelText('Seats').id).toBe('seats');
    });

    it('control: several children are left as they are', () => {
        const { container } = wrap(
            <FormField label="Range"><Input name="from" /><Input name="to" /></FormField>,
        );
        expect(container.querySelector('label')?.getAttribute('for')).toBeNull();
    });
});
