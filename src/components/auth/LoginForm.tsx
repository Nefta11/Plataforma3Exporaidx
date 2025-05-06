import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const success = await login(data.username, data.password);
      if (success) {
        navigate("/clients");
      }
    } catch (err) {
      // Error is already handled by the auth context
      console.error("Login failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Test credentials info */}

      {error && (
        <div className="p-4 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-xl animate-shake">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        </div>
      )}
      
      <div className="space-y-5">
        <Input
          label="Usuario"
          error={errors.username?.message}
          icon={<User size={18} className="text-gray-400" />}
          {...register("username")}
          placeholder="Escribe tu usuario"
          autoComplete="username"
          className="transition-all duration-300 focus:ring-2 focus:ring-black/5"
        />
        
        <Input
          label="Contraseña"
          type="password"
          error={errors.password?.message}
          icon={<Lock size={18} className="text-gray-400" />}
          {...register("password")}
          placeholder="Escribe tu contraseña"
          autoComplete="current-password"
          className="transition-all duration-300 focus:ring-2 focus:ring-black/5"
        />
      </div>
      
      <Button 
        type="submit" 
        isLoading={isLoading} 
        className="w-full mt-8 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Iniciar sesión
      </Button>
    </form>
  );
};