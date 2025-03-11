import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "../../../store";
import { logout } from "../../../store/slices/authSlice";
import { AppLayout } from "../AppLayout";

// Mock the Next.js router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock the Redux store hooks
jest.mock("../../../store", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

// Mock the logout action
jest.mock("../../../store/slices/authSlice", () => ({
  logout: jest.fn(),
}));

describe("AppLayout Component", () => {
  // Set up common mocks before each test
  const pushMock = jest.fn();
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });
    (useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);
  });

  test("redirects to login if user is not authenticated", () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(<AppLayout>Test Content</AppLayout>);
    expect(pushMock).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("Test Content")).not.toBeInTheDocument();
  });

  test("renders children when authenticated", () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { email: "test@example.com" },
    });

    render(<AppLayout>Test Content</AppLayout>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("displays user email when authenticated", () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { email: "test@example.com" },
    });

    render(<AppLayout>Test Content</AppLayout>);
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  test("logs out user when logout button is clicked", () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { email: "test@example.com" },
    });

    render(<AppLayout>Test Content</AppLayout>);

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(dispatchMock).toHaveBeenCalledWith(logout());
    expect(pushMock).toHaveBeenCalledWith("/login");
  });
});
