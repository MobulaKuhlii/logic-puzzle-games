import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../src/user-interface/app";


test("quick maths", () => {
    expect(2 * 2).toBe(4);
    expect(4 - 1).toBe(3);
});

test("dummy react test", () => {
    render(<App />);
    expect(screen.getByText("Logic Puzzle Games!")).toBeVisible();
});