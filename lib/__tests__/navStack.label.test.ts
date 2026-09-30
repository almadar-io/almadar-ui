import { describe, it, expect } from 'vitest';
import { syncNavStack, pageEntryLabel } from '../navStack';

describe('nav stack entry labels', () => {
  it('uses the declared page label', () => {
    expect(pageEntryLabel({ path: '/contacts', name: 'ContactsPage', orbital: 'Crm', label: 'جهات الاتصال' })).toBe('جهات الاتصال');
  });

  it('control: without a label, the page name as written', () => {
    expect(pageEntryLabel({ path: '/contacts', name: 'ContactDetailPage', orbital: 'Crm' })).toBe('ContactDetailPage');
  });

  it('seeded ancestors use declared labels too', () => {
    const pages = [
      { path: '/contacts', name: 'ContactsPage', orbital: 'Crm', label: 'Contacts' },
      { path: '/contacts/:id', name: 'ContactDetailPage', orbital: 'Crm', label: 'Contact' },
    ];
    const { state } = syncNavStack({}, pages, '/contacts/7', null);
    expect(state.Crm.map((e) => e.label)).toEqual(['Contacts', 'Contact']);
  });
});
