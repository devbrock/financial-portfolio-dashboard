import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
import { Card, CardBody } from "../Card/Card";

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardBody>Overview content</CardBody>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="pt-4">
          <Card>
            <CardBody>Performance content</CardBody>
          </Card>
        </TabsContent>
        <TabsContent value="risk" className="pt-4">
          <Card>
            <CardBody>Risk content</CardBody>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ),
};


