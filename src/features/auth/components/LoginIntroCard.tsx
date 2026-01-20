import { Card, Heading, Inline, Stack, Text } from '@components';

export function LoginIntroCard() {
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
          <Heading as="h2" tone="inverse">
            Welcome back
          </Heading>
          <Text tone="inverse" className="text-white/80">
            Sign in to continue managing your portfolio and performance insights.
          </Text>
        </Stack>

        <Stack gap="sm" className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <Text as="div" className="font-semibold text-white">
            Security highlights
          </Text>
          <Stack gap="sm">
            <Inline align="center" className="gap-3 text-white/85">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-(--ui-primary)" />
              <Text as="span" tone="inverse" className="text-sm text-white/85">
                Session protections + device checks
              </Text>
            </Inline>
            <Inline align="center" className="gap-3 text-white/85">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-(--ui-primary)" />
              <Text as="span" tone="inverse" className="text-sm text-white/85">
                Your data stays local and private
              </Text>
            </Inline>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
