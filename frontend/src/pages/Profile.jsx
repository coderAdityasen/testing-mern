import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Avatar = ({ name }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-white/20">
      {initials}
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-300 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-white/40 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-white font-medium text-sm truncate mt-0.5">{value}</p>
    </div>
  </div>
);

const Profile = () => {
  const { user: ctxUser, token, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(data.user);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const user = profile || ctxUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background blobs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">AuthApp</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl p-6 text-center">
            <p className="font-medium">{error}</p>
            <button onClick={handleLogout} className="mt-3 text-sm text-red-400 hover:text-red-200 underline">
              Sign in again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left — Profile card */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center">
                <Avatar name={user?.fullName || "U"} />
                <h2 className="text-white text-xl font-bold mt-4">{user?.fullName}</h2>
                <p className="text-white/50 text-sm mt-1">{user?.email}</p>

                <div className="w-full mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">Status</span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Active
                    </span>
                  </div>
                  {profile?.createdAt && (
                    <div className="flex items-center justify-between text-sm mt-3">
                      <span className="text-white/40">Member since</span>
                      <span className="text-white/70">{formatDate(profile.createdAt)}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="mt-6 w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>

            {/* Right — Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Welcome banner */}
              <div className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-white text-lg font-semibold">
                  Welcome back, {user?.fullName?.split(" ")[0]}! 👋
                </h3>
                <p className="text-white/60 text-sm mt-1">
                  Your account is active and all systems are operational.
                </p>
              </div>

              {/* Account info */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                <h3 className="text-white font-semibold text-base mb-4">Account Information</h3>
                <div className="space-y-3">
                  <StatCard
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                    label="Full Name"
                    value={user?.fullName}
                  />
                  <StatCard
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                    label="Email Address"
                    value={user?.email}
                  />
                  <StatCard
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" /></svg>}
                    label="User ID"
                    value={user?.id}
                  />
                  {profile?.createdAt && (
                    <StatCard
                      icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                      label="Joined"
                      value={formatDate(profile.createdAt)}
                    />
                  )}
                  {profile?.updatedAt && (
                    <StatCard
                      icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      label="Last Updated"
                      value={formatDate(profile.updatedAt)}
                    />
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
