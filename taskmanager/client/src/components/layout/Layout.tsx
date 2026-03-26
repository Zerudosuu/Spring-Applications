import Navbar from "./Navbar";

// wraps all protected pages with Navbar
// any page inside ProtectedRoute will have the Navbar automatically
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}

export default Layout;
