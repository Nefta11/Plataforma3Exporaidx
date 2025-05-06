import React, { useEffect } from "react";
import { Logo } from "../components/ui/Logo";
import { LoginForm } from "../components/auth/LoginForm";

export const LoginScreen: React.FC = () => {
  useEffect(() => {
    document.body.style.backgroundColor = "#f8fafc";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50 transition-all duration-500 hover:shadow-xl">
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <Logo size={120} />
          <h2 className="mt-8 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Inicia sesión con tu cuenta
          </h2>
          <p className="mt-3 text-sm text-gray-600 text-center max-w-sm">
            Escribe tus usuario y contraseña para acceder al dashboard
          </p>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="text-xs text-center space-y-3">
            <p className="font-medium text-gray-500">Demo Credentials</p>
            <p className="font-medium text-gray-400">Password: <span className="text-gray-600">password123</span></p>
            <p className="text-gray-400">
              Usernames:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "admin",
                "sales",
                "ssc",
                "strategy",
                "studies",
                "accompaniment",
                "management",
                "production",
                "diffusion"
              ].map((username) => (
                <span
                  key={username}
                  className="px-2 py-1 bg-gray-50 rounded-md font-medium text-gray-600 border border-gray-100"
                >
                  {username}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};