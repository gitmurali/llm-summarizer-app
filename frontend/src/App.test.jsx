import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import * as api from "./api";

afterEach(() => {
  jest.clearAllMocks();
});

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe("App component", () => {
  it("renders correctly", () => {
    render(<App />);
    expect(screen.getByText(/llm content summarizer/i)).toBeInTheDocument();
  });

  it("shows error when submitting empty text", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /summarize/i }));
    expect(
      await screen.findByText(/please enter text to summarize/i)
    ).toBeInTheDocument();
  });

  it("shows summary after successful API call", async () => {
    jest
      .spyOn(api, "summarizeText")
      .mockResolvedValue({ summary: "Mock summary text" });
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/paste or enter text here/i), {
      target: { value: "Some text" },
    });
    fireEvent.click(screen.getByRole("button", { name: /summarize/i }));

    expect(await screen.findByText(/mock summary text/i)).toBeInTheDocument();
    expect(api.summarizeText).toHaveBeenCalledWith("Some text");
  });

  it("shows error message on API failure", async () => {
    jest
      .spyOn(api, "summarizeText")
      .mockRejectedValue(new Error("API failure"));
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/paste or enter text here/i), {
      target: { value: "Some text" },
    });
    fireEvent.click(screen.getByRole("button", { name: /summarize/i }));

    expect(
      await screen.findByText(
        /failed to fetch summary\. please check your input or try again later\./i
      )
    ).toBeInTheDocument();
    expect(api.summarizeText).toHaveBeenCalledWith("Some text");
  });
});
