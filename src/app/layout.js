import { Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Book Store - Cybersecurity Knowledge Library",
  description: "Your Cybersecurity Knowledge Library - Build to help you discover What truly matters. Empowering professionals and learners alike",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.variable}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
