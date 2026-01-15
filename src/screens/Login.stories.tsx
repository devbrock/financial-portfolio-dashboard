import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  Heading,
  Inline,
  Input,
  Stack,
  Text,
} from "@components";

type LoginMode = "default" | "loading" | "error";

type LoginDemoProps = {
  mode: LoginMode;
};

const meta: Meta<typeof LoginDemo> = {
  title: "Screens/Login",
  component: LoginDemo,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

type Story = StoryObj<typeof LoginDemo>;

export const Default: Story = {
  args: { mode: "default" },
};

export const Loading: Story = {
  args: { mode: "loading" },
};

export const ErrorState: Story = {
  args: { mode: "error" },
};

/**
 * Join class names without `clsx` to keep this file self-contained (mirrors `Dashboard.stories.tsx`).
 */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function LoginDemo(props: LoginDemoProps) {
  const { mode } = props;

  const emailId = React.useId();
  const passwordId = React.useId();
  const emailHintId = React.useId();
  const passwordHintId = React.useId();
  const passwordErrorId = React.useId();

  const [email, setEmail] = React.useState("exec@orion.example");
  const [password, setPassword] = React.useState("");

  const isSubmitting = mode === "loading";
  const showError = mode === "error";

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className={cx("overflow-auto")}>
      <Container className="relative h-full w-full sm:py-14">
        {/* Center content when there's room; gracefully scroll when there isn't */}
        <div className="flex h-full items-center">
          <div className="grid w-full items-start gap-6 lg:grid-cols-2 lg:gap-10">
            {/* Left: brand / reassurance */}
            <Card
              tone="inverse"
              elevation="md"
              className={cx("relative overflow-hidden", "p-6 sm:p-4")}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-(--ui-primary) opacity-20 blur-3xl"
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
                    Sign in with your organization’s credentials. Orion keeps
                    your portfolio views calm, clean, and executive-ready—like a
                    tidy desk where everything has a place.
                  </Text>
                </Stack>

                <Stack
                  gap="sm"
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <Text as="div" className="font-semibold text-white">
                    Security highlights
                  </Text>
                  <Stack gap="sm">
                    <Inline align="center" className="gap-3 text-white/85">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full bg-(--ui-primary)"
                      />
                      <Text
                        as="span"
                        tone="inverse"
                        className="text-sm text-white/85"
                      >
                        SSO-ready (SAML/OIDC)
                      </Text>
                    </Inline>
                    <Inline align="center" className="gap-3 text-white/85">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full bg-(--ui-primary)"
                      />
                      <Text
                        as="span"
                        tone="inverse"
                        className="text-sm text-white/85"
                      >
                        Session protections + device checks
                      </Text>
                    </Inline>
                    <Inline align="center" className="gap-3 text-white/85">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full bg-(--ui-primary)"
                      />
                      <Text
                        as="span"
                        tone="inverse"
                        className="text-sm text-white/85"
                      >
                        Your data is encrypted and always private
                      </Text>
                    </Inline>
                  </Stack>
                </Stack>
              </Stack>
            </Card>

            {/* Right: form */}
            <Card elevation="md" className="p-6 sm:p-8">
              <CardHeader className="pb-5">
                <Stack gap="sm">
                  <Heading as="h2">Sign in</Heading>
                  <Text tone="muted">
                    Use email + password, or continue with your organization’s
                    SSO.
                  </Text>
                </Stack>
              </CardHeader>

              <CardBody className="space-y-5">
                {showError && (
                  <Alert tone="danger">
                    <Stack gap="sm">
                      <Text as="div" className="font-semibold">
                        We couldn’t sign you in
                      </Text>
                      <Text as="div" tone="subtle">
                        Check your email and password, then try again.
                      </Text>
                    </Stack>
                  </Alert>
                )}

                <Button
                  variant="secondary"
                  className="w-full mb-4"
                  onClick={(e) => e.preventDefault()}
                  disabled={isSubmitting}
                >
                  Continue with SSO
                </Button>

                <Divider />

                <form onSubmit={onSubmit} className="space-y-4">
                  <Stack gap="sm">
                    <Text
                      as="label"
                      htmlFor={emailId}
                      className="font-semibold"
                    >
                      Email
                    </Text>
                    <Input
                      id={emailId}
                      name="email"
                      type="email"
                      autoComplete="username"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.currentTarget.value)}
                      aria-describedby={emailHintId}
                      disabled={isSubmitting}
                    />
                    <Text id={emailHintId} size="caption" tone="muted">
                      Use the address associated with your organization.
                    </Text>
                  </Stack>

                  <Stack gap="sm">
                    <Inline align="center" justify="between" className="gap-3">
                      <Text
                        as="label"
                        htmlFor={passwordId}
                        className="font-semibold"
                      >
                        Password
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-1 text-(--ui-text-muted)"
                        type="button"
                      >
                        Forgot?
                      </Button>
                    </Inline>

                    <Input
                      id={passwordId}
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.currentTarget.value)}
                      aria-describedby={cx(
                        passwordHintId,
                        showError && passwordErrorId
                      )}
                      aria-invalid={showError || undefined}
                      disabled={isSubmitting}
                    />

                    <Text id={passwordHintId} size="caption" tone="muted">
                      Use your standard corporate password.
                    </Text>

                    {showError && (
                      <Text
                        id={passwordErrorId}
                        size="caption"
                        className="text-red-700 dark:text-red-200"
                      >
                        Invalid email or password.
                      </Text>
                    )}
                  </Stack>

                  <Button
                    className="w-full"
                    loading={isSubmitting}
                    type="submit"
                  >
                    Sign in
                  </Button>

                  <Text size="caption" tone="muted" className="text-center">
                    Need access? Contact your administrator to be provisioned.
                  </Text>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
