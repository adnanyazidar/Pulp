"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMsg("");
    setError(null);

    try {
      if (mode === "register") {
        const { data, error } = await api.auth.register.post({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          const errMsg = (error as any).value?.error || "Registration failed";
          throw new Error(errMsg);
        }
        if (data && (data as any).user && (data as any).token) {
          setAuth((data as any).user, (data as any).token);
          
          setLoadingMsg("Syncing local data...");
          const { useTaskStore } = await import("@/store/task-store");
          await useTaskStore.getState().syncLocalToCloud();
          
          onClose();
        }
      } else {
        const { data, error } = await api.auth.login.post({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          const errMsg = (error as any).value?.error || "Login failed";
          throw new Error(errMsg);
        }
        if (data && (data as any).user && (data as any).token) {
          setAuth((data as any).user, (data as any).token);

          setLoadingMsg("Syncing cloud data...");
          const { useTaskStore } = await import("@/store/task-store");
          await useTaskStore.getState().syncLocalToCloud();

          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center min-h-screen">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md mx-4 overflow-hidden rounded-3xl border border-white/10 bg-pf-surface/60 backdrop-blur-xl shadow-2xl p-8 z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors text-pf-on-surface-variant/40 hover:text-pf-on-surface"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-pf-display font-medium text-pf-on-surface mb-2">
                {mode === "login" ? "Welcome Back" : "Join PomoFocus"}
              </h2>
              <p className="text-pf-on-surface-variant/60">
                {mode === "login" 
                  ? "Elevate your productivity to the cloud." 
                  : "Start syncing your flow state across devices."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {mode === "register" && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-pf-on-surface-variant/40 group-focus-within:text-pf-primary transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Username"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 focus:border-pf-primary/50 outline-none transition-all placeholder:text-pf-on-surface-variant/20 text-pf-on-surface autofill:bg-transparent"
                    />
                  </div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-pf-on-surface-variant/40 group-focus-within:text-pf-primary transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/10 border border-white/10 focus:border-pf-primary/50 outline-none transition-all placeholder:text-pf-on-surface-variant/20 text-pf-on-surface"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pf-on-surface-variant/40 group-focus-within:text-pf-primary transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/10 border border-white/10 focus:border-pf-primary/50 outline-none transition-all placeholder:text-pf-on-surface-variant/20 text-pf-on-surface"
                  />
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-sm text-pf-error text-center"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-pf-primary hover:bg-pf-primary-variant text-pf-on-primary font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-pf-primary/20 hover:shadow-pf-primary/40 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {loadingMsg && <span>{loadingMsg}</span>}
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-pf-on-surface-variant/60 text-sm">
                {mode === "login" ? "New here?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="text-pf-primary hover:underline font-medium"
                >
                  {mode === "login" ? "Create an account" : "Sign in instead"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
