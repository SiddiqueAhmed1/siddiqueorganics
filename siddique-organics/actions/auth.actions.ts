"use server";

import { SignJWT } from "jose";
import { cookies } from "next/headers";

interface ActionResponse {
  success: boolean;
  message: string;
}

const EMPLOYEES = [
  {
    email: process.env.EMPLOYEE_1_EMAIL,
    password: process.env.EMPLOYEE_1_PASSWORD,
    name: "Employee 1",
    role: "EMPLOYEE",
  },
  {
    email: process.env.EMPLOYEE_2_EMAIL,
    password: process.env.EMPLOYEE_2_PASSWORD,
    name: "Employee 2",
    role: "EMPLOYEE",
  },
  {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: "Super Admin",
    role: "SUPER_ADMIN",
  },
];

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "siddique_organics_fallback_secret_key_2026",
);

/**
 * Validates employee credentials against .env scopes and provisions a secure HTTP-Only Cookie session.
 */
export async function loginEmployee(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return {
        success: false,
        message: "Email and password are required fields.",
      };
    }

    const matchedUser = EMPLOYEES.find(
      (emp) => emp.email === email && emp.password === password,
    );

    if (!matchedUser || !matchedUser.email) {
      return {
        success: false,
        message: "Invalid email or password credentials.",
      };
    }

    const token = await new SignJWT({
      email: matchedUser.email,
      name: matchedUser.name,
      role: matchedUser.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(SECRET_KEY);

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return {
      success: true,
      message: "Authentication successful! Redirecting...",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Internal server validation failure.";
    console.error("Employee authentication failure:", errorMessage);
    return { success: false, message: errorMessage };
  }
}

/**
 * Destroys the active authentication token instance to sign out the user.
 */
export async function logoutEmployee(): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return { success: true, message: "Logged out successfully." };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Logout failed.";
    return { success: false, message: errorMessage };
  }
}
