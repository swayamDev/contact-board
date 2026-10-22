import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

// Each test starts from the sample data, never from a previous test's saved state.
beforeEach(() => window.localStorage.clear());
afterEach(() => cleanup());
