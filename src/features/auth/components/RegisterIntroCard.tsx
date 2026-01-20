import { Card, Heading, Inline, Stack, Text } from '@components';
import OrionLogoLight from '@/assets/orion_logo_light.svg';

export function RegisterIntroCard() {
  return (
    <Card tone="inverse" elevation="md" className="relative overflow-hidden p-6 sm:p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-(--ui-primary) opacity-20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-(--ui-accent) opacity-20 blur-3xl"
      />

      <Stack gap="lg" className="relative">
        <Stack gap="sm" className="p-6">
          <img src={OrionLogoLight} alt="Orion" className="mb-4! h-16" />
          <Heading as="h2" tone="inverse">
            Join Orion Wealth
          </Heading>
          <Text tone="inverse" className="text-white/80">
            Create your account to track portfolio performance and market insights.
          </Text>
        </Stack>

        <Stack gap="sm" className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <Text as="div" className="font-semibold text-white">
            What you get
          </Text>
          <Stack gap="sm">
            <Inline align="center" className="gap-3 text-white/85">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-(--ui-primary)" />
              <Text as="span" tone="inverse" className="text-sm text-white/85">
                Personalized portfolio insights
              </Text>
            </Inline>
            <Inline align="center" className="gap-3 text-white/85">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-(--ui-primary)" />
              <Text as="span" tone="inverse" className="text-sm text-white/85">
                Watchlists, alerts, and reports
              </Text>
            </Inline>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
