import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "./Tabs";

beforeEach(resetAllMocks);

function TestTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Tabs value={value} onChange={onChange}>
      <TabList aria-label="Test tabs">
        <Tab value="one">Tab One</Tab>
        <Tab value="two">Tab Two</Tab>
        <Tab value="three" disabled>Tab Three</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="one">Content One</TabPanel>
        <TabPanel value="two">Content Two</TabPanel>
        <TabPanel value="three">Content Three</TabPanel>
      </TabPanels>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("renders tab list and active panel", () => {
    renderWithProviders(<TestTabs value="one" onChange={vi.fn()} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab One" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab Two" })).toBeInTheDocument();
    expect(screen.getByText("Content One")).toBeInTheDocument();
    expect(screen.queryByText("Content Two")).not.toBeInTheDocument();
  });

  it("shows correct panel for selected tab", () => {
    renderWithProviders(<TestTabs value="two" onChange={vi.fn()} />);
    expect(screen.getByText("Content Two")).toBeInTheDocument();
    expect(screen.queryByText("Content One")).not.toBeInTheDocument();
  });

  it("calls onChange when a tab is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<TestTabs value="one" onChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: "Tab Two" }));
    expect(onChange).toHaveBeenCalledWith("two");
  });

  it("does not call onChange when active tab is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<TestTabs value="one" onChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: "Tab One" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("sets aria-selected on active tab", () => {
    renderWithProviders(<TestTabs value="one" onChange={vi.fn()} />);
    expect(screen.getByRole("tab", { name: "Tab One" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Tab Two" })).toHaveAttribute("aria-selected", "false");
  });

  it("renders tabpanel with correct role", () => {
    renderWithProviders(<TestTabs value="one" onChange={vi.fn()} />);
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("disabled tab does not fire onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<TestTabs value="one" onChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: "Tab Three" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
