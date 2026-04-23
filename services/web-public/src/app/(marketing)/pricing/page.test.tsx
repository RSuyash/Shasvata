import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PricingPage from "./page";

describe("PricingPage", () => {
  it("renders the finalized landing-system package stack and recommendation", () => {
    render(<PricingPage />);

    expect(
      screen.getByRole("heading", {
        name: /premium landing systems built for conversion, clarity, and launch readiness/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Naya Launch Page Core/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Naya Campaign Landing System/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Shasvata Landing \+ Lead Ops Setup/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹9,999").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹17,999").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹34,999").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Recommended Option: Naya Campaign Landing System/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Premium Copywriting/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Launch Support/i)).toBeInTheDocument();
  });
});
