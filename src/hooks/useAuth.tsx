import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (session?.user) {
          setTimeout(() => {
            void loadUserContext(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setRole(null);
          setProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (session?.user) {
        void loadUserContext(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserContext = async (userId: string) => {
    try {
      const [rolesResult, profileResult] = await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .in("role", ["owner", "admin", "moderator", "user"])
          .order("role", { ascending: true }),
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(),
      ]);

      if (rolesResult.error) throw rolesResult.error;
      if (profileResult.error) throw profileResult.error;

      const roles = (rolesResult.data ?? []).map((item) => item.role as AppRole);
      const resolvedRole =
        roles.includes("owner")
          ? "owner"
          : roles.includes("admin")
            ? "admin"
            : roles.includes("moderator")
              ? "moderator"
              : roles.includes("user")
                ? "user"
                : null;

      setRole(resolvedRole);
      setIsAdmin(resolvedRole === "owner" || resolvedRole === "admin");
      setProfile(profileResult.data ?? null);
    } catch (error) {
      console.error("Error checking user role:", error);
      setIsAdmin(false);
      setRole(null);
      setProfile(null);
    }
  };

  const displayName =
    profile?.full_name?.trim() ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "there";

  const membershipTier = profile?.membership_tier === "premium" ? "premium" : "free";
  const isMember = membershipTier === "premium";

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    isLoading,
    isAdmin,
    isOwner: role === "owner",
    role,
    profile,
    displayName,
    membershipTier,
    isMember,
    signOut,
  };
};
