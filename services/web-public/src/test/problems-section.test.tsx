import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProblemsSection } from "@/components/sections/problems-cta";

describe("ProblemsSection", () => {
  it("renders the current service-stack framing and three-layer cards", () => {
    render(<ProblemsSection />);

    expect(screen.getByRole("link", { name: /see the service stack/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /three layers\.\s*one operating system\./i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/we do not lead with disconnected tactics/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/clear scope/i)).toBeInTheDocument();
    expect(screen.getByText(/structured delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/compounding value/i)).toBeInTheDocument();
    expect(screen.getByText(/build the operating layer/i)).toBeInTheDocument();
    expect(screen.getByText(/drive demand with structure/i)).toBeInTheDocument();
    expect(screen.getByText(/align the growth model/i)).toBeInTheDocument();
  });
});
