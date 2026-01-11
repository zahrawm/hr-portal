import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import router from "next/router";

// Inside your component:
export const googleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try {
      console.log("Google token:", tokenResponse);

      // Send the token to your backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}auth/google-signin`,
        {
          accessToken: tokenResponse.access_token,
        }
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem(
          "userId",
          response.data.user._id || response.data.user.id
        );

        // Navigate based on role
        const userRole = response.data.user?.role;
        const role = Array.isArray(userRole) ? userRole[0] : userRole;

        if (role === "EMPLOYEE" || role === "employee") {
          router.push("/leaveRequests");
        } else if (role === "MANAGER" || role === "manager") {
          router.push("/department");
        } else if (role === "ADMIN" || role === "admin") {
          router.push("/department");
        } else {
          router.push("/leaveRequests");
        }
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setPasswordError("Google sign-in failed. Please try again.");
    }
  },
  onError: () => {
    console.log("Login Failed");
    setPasswordError("Google sign-in failed. Please try again.");
  },
  flow: "implicit", // or 'auth-code' for more security
});

function setPasswordError(arg0: string) {
  throw new Error("Function not implemented.");
}
// Replace the GoogleLogin component with:
