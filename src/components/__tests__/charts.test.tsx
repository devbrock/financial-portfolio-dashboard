import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AreaChart } from "../AreaChart/AreaChart";
import { BarChart } from "../BarChart/BarChart";
import { LineChart } from "../LineChart/LineChart";
import { RadarChart } from "../RadarChart/RadarChart";
import { StackedBarChart } from "../StackedBarChart/StackedBarChart";
import { Treemap } from "../Treemap/Treemap";

describe("chart components", () => {
  it("renders BarChart", () => {
    const { container } = render(
      <BarChart
        data={[{ name: "Jan", total: 120 }]}
        xKey="name"
        series={[{ key: "total", name: "Total" }]}
      />
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(wrapper).toHaveClass("w-full");
  });

  it("renders BarChart with custom formatters and legend", () => {
    const { container } = render(
      <BarChart
        data={[{ name: "Jan", total: 120 }]}
        xKey="name"
        series={[{ key: "total", name: "Total" }]}
        grid={false}
        legend
        xTickFormatter={(value) => `X-${value}`}
        yTickFormatter={(value) => `Y-${value}`}
      />
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(wrapper).toHaveClass("w-full");
  });

  it("renders LineChart", () => {
    const { container } = render(
      <LineChart
        data={[{ name: "Jan", total: 120 }]}
        xKey="name"
        series={[{ key: "total", name: "Total" }]}
      />
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(wrapper).toHaveClass("w-full");
  });

  it("renders LineChart with custom formatters and legend", () => {
    const { container } = render(
      <LineChart
        data={[{ name: "Jan", total: 120 }]}
        xKey="name"
        series={[{ key: "total", name: "Total" }]}
        grid={false}
        legend
        xTickFormatter={(value) => `X-${value}`}
        yTickFormatter={(value) => `Y-${value}`}
      />
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(wrapper).toHaveClass("w-full");
  });

  it("renders AreaChart with default options", () => {
    const { container } = render(
      <AreaChart
        data={[{ name: "Jan", total: 120 }]}
        xKey="name"
        series={[{ key: "total", name: "Total" }]}
      />
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(wrapper).toHaveClass("w-full");
  });

  it("renders AreaChart with custom formatters and legend", () => {
    const { container } = render(
      <AreaChart
        data={[{ name: "Jan", total: 120 }]}
        xKey="name"
        series={[{ key: "total", name: "Total" }]}
        grid={false}
        legend
        xTickFormatter={(value) => `X-${value}`}
        yTickFormatter={(value) => `Y-${value}`}
      />
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(wrapper).toHaveClass("w-full");
  });

  it("renders RadarChart", () => {
    const { container } = render(
      <RadarChart
        data={[{ metric: "Risk", value: 60 }]}
        angleKey="metric"
        series={[{ key: "value", name: "Score" }]}
      />
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(wrapper).toHaveClass("w-full");
  });

  it("renders RadarChart with custom formatters and legend", () => {
    const { container } = render(
      <RadarChart
        data={[{ metric: "Risk", value: 60 }]}
        angleKey="metric"
        series={[{ key: "value", name: "Score" }]}
        grid={false}
        legend
        angleTickFormatter={(value) => `A-${value}`}
        radiusTickFormatter={(value) => `R-${value}`}
      />
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(wrapper).toHaveClass("w-full");
  });

  it("renders StackedBarChart", () => {
    const { container } = render(
      <StackedBarChart
        data={[{ name: "Jan", invested: 40, returns: 10 }]}
        xKey="name"
        series={[
          { key: "invested", name: "Invested" },
          { key: "returns", name: "Returns" },
        ]}
      />
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(wrapper).toHaveClass("w-full");
  });

  it("renders StackedBarChart with custom formatters and legend", () => {
    const { container } = render(
      <StackedBarChart
        data={[{ name: "Jan", invested: 40, returns: 10 }]}
        xKey="name"
        series={[
          { key: "invested", name: "Invested" },
          { key: "returns", name: "Returns" },
        ]}
        grid={false}
        legend
        xTickFormatter={(value) => `X-${value}`}
        yTickFormatter={(value) => `Y-${value}`}
      />
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(wrapper).toHaveClass("w-full");
  });

  it("renders Treemap", () => {
    const { container } = render(
      <Treemap data={[{ name: "Tech", value: 200 }]} />
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(wrapper).toHaveClass("w-full");
  });
});
