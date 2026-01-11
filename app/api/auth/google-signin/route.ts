import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Access token is required" },
        { status: 400 }
      );
    }

    // Verify the token with Google and get user info
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );

    const { email, name, picture, sub: googleId } = googleResponse.data;

    // Now forward this to your actual backend API
    // Replace this URL with your actual backend endpoint
    const backendResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}auth/google-signin`,
      {
        email,
        name,
        googleId,
        profilePicture: picture,
      }
    );

    return NextResponse.json(backendResponse.data);
  } catch (error: any) {
    console.error(
      "Google sign-in error:",
      error.response?.data || error.message
    );

    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || "Google sign-in failed",
      },
      { status: error.response?.status || 500 }
    );
  }
}
