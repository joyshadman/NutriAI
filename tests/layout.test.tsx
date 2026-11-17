import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import { Spinner } from '@/components/ui/spinner';
import { Stack } from '@/components/ui/stack';
import { expectAccessible, setTheme } from './helpers';

describe('Layout primitives', () => {
  it('builds Container, Stack, and Grid from spacing and breakpoint tokens', async () => {
    const { container } = render(
      <Container size="sm">
        <Stack direction="row" gap="section" align="center">
          <Grid columns={1} smColumns={2} lgColumns={4} gap="4">
            <div>One</div>
            <div>Two</div>
          </Grid>
        </Stack>
      </Container>,
    );

    expect(container.querySelector('.mx-auto')).toHaveClass(
      'max-w-3xl',
      'px-4',
    );
    expect(container.querySelector('.flex')).toHaveClass(
      'flex-row',
      'gap-section',
      'items-center',
    );
    expect(container.querySelector('.grid')).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-4',
      'gap-4',
    );
    for (const theme of ['light', 'dark'] as const) {
      setTheme(theme);
      await expectAccessible(container);
    }
  });
});

describe('Card', () => {
  it('renders compound parts with a real heading and passes axe in both themes', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent>1,840 calories</CardContent>
        <CardFooter>
          <Badge variant="accent">On track</Badge>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByRole('heading', { name: 'Today' })).toBeVisible();
    expect(screen.getByText('On track')).toHaveClass('bg-accent');
    expect(container.querySelector('.shadow-card')).toBeInTheDocument();
    for (const theme of ['light', 'dark'] as const) {
      setTheme(theme);
      await expectAccessible(container);
    }
  });
});

describe('Badge', () => {
  it('applies every variant from tokens', () => {
    const { container } = render(
      <>
        <Badge>Neutral</Badge>
        <Badge variant="accent">Accent</Badge>
        <Badge variant="danger">Danger</Badge>
      </>,
    );

    expect(screen.getByText('Neutral')).toHaveClass('border-border');
    expect(screen.getByText('Accent')).toHaveClass('bg-accent');
    expect(screen.getByText('Danger')).toHaveClass('bg-danger');
    return expectAccessible(container);
  });
});

describe('Spinner', () => {
  it('has a default accessible label and can be hidden when decorative', () => {
    const { container } = render(
      <>
        <Spinner />
        <Spinner aria-hidden />
      </>,
    );

    expect(screen.getByText('Loading')).toBeVisible();
    expect(container.querySelectorAll('svg')).toHaveLength(2);
    return expectAccessible(container);
  });
});
