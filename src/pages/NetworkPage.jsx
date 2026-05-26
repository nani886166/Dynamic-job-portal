import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../config/api";
import {
  extractList,
  getErrorMessage,
  normalizeUser,
} from "../utils/backendAdapters";
import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  Building2,
  MapPin,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router";

const NetworkPage = () => {
  const navigate = useNavigate();

  const [networkUsers, setNetworkUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("discover");

  const getProfileData = (networkUser) => {
    return (
      networkUser.profile ||
      networkUser.candidate_profile ||
      networkUser.candidateProfile ||
      networkUser.hr_profile ||
      networkUser.hrProfile ||
      networkUser
    );
  };

  const normalizeNetworkUser = (networkUser) => {
    const baseUser = networkUser.user || networkUser;
    const user = normalizeUser(baseUser);
    const profile = getProfileData(networkUser);

    const firstName =
      user.firstName ||
      user.first_name ||
      baseUser.first_name ||
      networkUser.first_name ||
      "";

    const lastName =
      user.lastName ||
      user.last_name ||
      baseUser.last_name ||
      networkUser.last_name ||
      "";

    const name =
      networkUser.full_name ||
      profile.full_name ||
      user.name ||
      `${firstName} ${lastName}`.trim() ||
      user.email ||
      "User";

    const role = user.role || baseUser.role || networkUser.role || "Professional";

    const roleLabel =
      role === "seeker"
        ? "Candidate"
        : role === "hr"
          ? "HR / Recruiter"
          : role;

    return {
      id: user.id || baseUser.id || networkUser.id || networkUser._id,
      name,
      email: user.email || baseUser.email || networkUser.email,
      role,
      roleLabel,
      headline:
        profile.headline ||
        profile.bio ||
        profile.title ||
        profile.designation ||
        roleLabel,
      company:
        profile.company ||
        profile.company_name ||
        profile.companyName ||
        networkUser.company ||
        networkUser.companyName ||
        "Company unavailable",
      location:
        profile.location ||
        networkUser.location ||
        user.location ||
        "Location unavailable",
      avatar:
        profile.profile_picture ||
        profile.profilePicture ||
        profile.avatar ||
        networkUser.profile_picture ||
        networkUser.profilePicture ||
        "",
      mutual: networkUser.mutual || profile.mutual || 0,
      isFollowing: Boolean(
        networkUser.isFollowing ||
          networkUser.is_following ||
          profile.isFollowing ||
          profile.is_following,
      ),
      isFollower: Boolean(
        networkUser.isFollower ||
          networkUser.is_follower ||
          profile.isFollower ||
          profile.is_follower,
      ),
    };
  };

  const mergeUsers = (users) => {
    const byId = new Map();

    users.forEach((user) => {
      if (!user.id) return;

      const id = String(user.id);

      byId.set(id, {
        ...(byId.get(id) || {}),
        ...user,
        isFollowing: Boolean(byId.get(id)?.isFollowing || user.isFollowing),
        isFollower: Boolean(byId.get(id)?.isFollower || user.isFollower),
      });
    });

    return Array.from(byId.values());
  };

  const refreshFollowStatus = async (users) => {
    const ids = users.map((item) => item.id).filter(Boolean);

    if (!ids.length) return users;

    try {
      const statusRes = await api.get(
        `/network/follow-status/?user_ids=${ids.join(",")}`,
      );

      return users.map((item) => ({
        ...item,
        isFollowing: Boolean(statusRes.data?.[String(item.id)]),
      }));
    } catch {
      return users;
    }
  };

  useEffect(() => {
    const fetchNetwork = async () => {
      setIsLoading(true);

      try {
        const [suggestedRes, followingRes, followersRes] =
          await Promise.allSettled([
            api.get("/network/suggested/"),
            api.get("/network/my/following/"),
            api.get("/network/my/followers/"),
          ]);

        const suggested =
          suggestedRes.status === "fulfilled"
            ? extractList(suggestedRes.value.data, ["users", "results"])
            : [];

        const following =
          followingRes.status === "fulfilled"
            ? extractList(followingRes.value.data, ["users", "results"])
            : [];

        const followers =
          followersRes.status === "fulfilled"
            ? extractList(followersRes.value.data, ["users", "results"])
            : [];

        const merged = mergeUsers([
          ...suggested.map((item) => ({
            ...normalizeNetworkUser(item),
            isFollowing: false,
          })),
          ...following.map((item) => ({
            ...normalizeNetworkUser(item),
            isFollowing: true,
          })),
          ...followers.map((item) => ({
            ...normalizeNetworkUser(item),
            isFollower: true,
          })),
        ]);

        setNetworkUsers(await refreshFollowStatus(merged));
      } catch (error) {
        toast.error(
          getErrorMessage(error, "Network suggestions are not available yet."),
        );
        setNetworkUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetwork();
  }, []);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);

      try {
        let res;

        try {
          res = await api.get(
            `/network/search/?p=${encodeURIComponent(trimmedQuery)}`,
          );
        } catch {
          res = await api.get(
            `/network/search/?q=${encodeURIComponent(trimmedQuery)}`,
          );
        }

        const results = extractList(res.data, ["users", "results"]).map(
          (item) => ({
            ...normalizeNetworkUser(item),
            isSearchResult: true,
          }),
        );

        const resultsWithStatus = await refreshFollowStatus(results);

        setSearchResults(resultsWithStatus);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleFollow = async (userId, userName, currentState) => {
    const normalizedId = String(userId);

    const updateUserState = (users, followed) =>
      users.map((user) =>
        String(user.id || user._id) === normalizedId
          ? { ...user, isFollowing: followed }
          : user,
      );

    try {
      setNetworkUsers((prev) => updateUserState(prev, !currentState));
      setSearchResults((prev) => updateUserState(prev, !currentState));

      const response = await api.post(`/network/follow/${userId}/`);
      const followed = Boolean(response.data?.followed);

      setNetworkUsers((prev) => updateUserState(prev, followed));
      setSearchResults((prev) => updateUserState(prev, followed));

      if (followed) {
        toast.success(`You are now following ${userName}`);
      } else {
        toast(`Unfollowed ${userName}`);
      }
    } catch (error) {
      setNetworkUsers((prev) => updateUserState(prev, currentState));
      setSearchResults((prev) => updateUserState(prev, currentState));

      toast.error(getErrorMessage(error, "Follow service is not available yet."));
    }
  };

  const handleStartConversation = async (userId) => {
    try {
      await api.post(`/messaging/start/${userId}/`);
      navigate("/messages");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not start conversation");
    }
  };

  const baseUsers = searchQuery.trim() ? searchResults : networkUsers;

  const filteredUsers = baseUsers.filter((user) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery.trim() ||
      (user.name || "").toLowerCase().includes(query) ||
      (user.roleLabel || "").toLowerCase().includes(query) ||
      (user.company || "").toLowerCase().includes(query) ||
      (user.headline || "").toLowerCase().includes(query);

    const matchesTab =
      activeTab === "discover"
        ? true
        : activeTab === "following"
          ? user.isFollowing
          : user.isFollower;

    return matchesSearch && matchesTab;
  });

  const followingCount = networkUsers.filter((u) => u.isFollowing).length;
  const followersCount = networkUsers.filter((u) => u.isFollower).length;

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 sm:pt-8 px-3 sm:px-6 lg:px-8 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* HEADER */}
        <div className="bg-card border-2 border-border rounded-3xl sm:rounded-[32px] p-4 sm:p-6 lg:p-10 shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-center lg:text-left w-full lg:w-auto min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mb-2 flex items-center justify-center lg:justify-start gap-2 sm:gap-3">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
                <span className="truncate">My Network</span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-xl mx-auto lg:mx-0">
                Connect with industry professionals and recruiters.
              </p>
            </div>

            <div className="w-full lg:w-96 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search people by name, role, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border-2 border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-sm sm:text-base"
              />

              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
              )}
            </div>
          </div>

          {/* TABS */}
          <div className="mt-6 sm:mt-8 -mx-4 sm:mx-0 overflow-x-auto">
            <div className="flex min-w-max sm:min-w-0 border-b border-border gap-4 sm:gap-6 px-4 sm:px-0">
              {[
                ["discover", "Discover"],
                ["following", `Following (${followingCount})`],
                ["followers", `Followers (${followersCount})`],
              ].map(([tabKey, label]) => (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`pb-4 whitespace-nowrap text-xs sm:text-sm font-black tracking-wider uppercase transition-colors relative ${
                    activeTab === tabKey
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                  {activeTab === tabKey && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="font-bold">Loading network...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id || user._id}
                className="bg-card border-2 border-border rounded-3xl sm:rounded-[24px] p-4 sm:p-6 shadow-sm hover:border-primary/50 hover:shadow-md transition-all group flex flex-col min-w-0"
              >
                {/* USER AVATAR + INFO */}
                <div className="flex flex-col items-center text-center mb-6 min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-4 border-4 border-background shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl sm:text-2xl font-black text-primary uppercase">
                        {(user.name || user.email || "U").charAt(0)}
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-base sm:text-lg text-foreground mb-1 leading-tight line-clamp-2 break-words max-w-full">
                    {user.name || user.email || "User"}
                  </h3>

                  <p className="text-xs sm:text-sm font-bold text-primary line-clamp-1 max-w-full">
                    {user.roleLabel || "Professional"}
                  </p>

                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 max-w-full">
                    {user.headline || "Profile details unavailable"}
                  </p>
                </div>

                {/* COMPANY + LOCATION */}
                <div className="flex flex-col gap-2 mb-6 mt-auto min-w-0">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground bg-muted/50 px-3 py-2 rounded-xl border border-border min-w-0">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate min-w-0">{user.company}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/20 px-3 py-2 rounded-xl border border-border min-w-0">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate min-w-0">{user.location}</span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="pt-4 border-t border-border/50 mt-auto space-y-3">
                  <div className="text-xs font-bold text-muted-foreground text-center sm:text-left">
                    {user.mutual > 0 ? (
                      <span>
                        <span className="text-foreground">{user.mutual}</span>{" "}
                        mutuals
                      </span>
                    ) : (
                      <span>New connection</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStartConversation(user.id || user._id)}
                      className="w-full min-w-0 px-3 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm bg-secondary text-secondary-foreground border-2 border-border hover:bg-muted"
                      title="Message"
                    >
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      <span className="hidden sm:inline text-xs">Message</span>
                    </button>

                    <button
                      onClick={() =>
                        handleToggleFollow(
                          user.id || user._id,
                          user.name || user.email,
                          user.isFollowing,
                        )
                      }
                      className={`w-full min-w-0 px-3 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                        user.isFollowing
                          ? "bg-secondary text-secondary-foreground border-2 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                      title={user.isFollowing ? "Unfollow" : "Follow"}
                    >
                      {user.isFollowing ? (
                        <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      ) : (
                        <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      )}

                      <span className="hidden sm:inline text-xs">
                        {user.isFollowing ? "Following" : "Follow"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20 px-4 border-2 border-dashed border-border rounded-3xl sm:rounded-[32px] bg-muted/10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-foreground mb-2">
              No users found
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
              {searchQuery.trim()
                ? "No matching profiles found."
                : activeTab === "following"
                  ? "You aren't following anyone that matches this search."
                  : "Network suggestions are not available yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkPage;