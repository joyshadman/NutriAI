import { render } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

describe('accessibility gate', () => {
  it('fails on a control without an accessible name', async () => {
    const { container } = render(<button />);
    const results = await axe.run(container);
    expect(results.violations.map((violation) => violation.id)).toContain(
      'button-name',
    );
  });
});
