import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

function RegisterForm() {
  const { registerUser, userState, handlerUserInput, user, authChecked, loading } = useUser();
  const { name, email, password } = userState;
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword(!showPassword);

  // Redirect to home page if the user is already logged in
  useEffect(() => {
    // ⭐ FIX: Check for user._id, which matches the data from your MongoDB backend.
    if (authChecked && user?._id) {
      navigate("/");
    }
  }, [user, authChecked, navigate]);

  return (
    <form
      className="relative m-[2rem] px-10 py-14 rounded-lg bg-white w-full max-w-[520px] shadow-lg"
      onSubmit={registerUser}
    >
      <div className="relative z-10">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Create an Account
        </h1>
        <p className="mb-8 px-4 text-center text-gray-500 text-sm">
          Get started! Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-green-500 hover:text-green-600 transition-colors"
          >
            Login here
          </Link>
        </p>

        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-600">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handlerUserInput("name")}
            name="name"
            className="px-4 py-3 border-2 rounded-md outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-800"
            placeholder="John Doe"
            required
          />
        </div>

        <div className="mt-4 flex flex-col">
          <label htmlFor="email" className="mb-1 text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handlerUserInput("email")}
            name="email"
            className="px-4 py-3 border-2 rounded-md outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-800"
            placeholder="johndoe@gmail.com"
            required
          />
        </div>

        <div className="relative mt-4 flex flex-col">
          <label htmlFor="password" className="mb-1 text-sm font-medium text-gray-600">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={handlerUserInput("password")}
            name="password"
            className="px-4 py-3 border-2 rounded-md outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-800"
            placeholder="Minimum 6 characters"
            required
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute p-1 right-3 top-[calc(50%+4px)] text-xl text-gray-400 hover:text-gray-600"
            onClick={togglePassword}
          >
            {showPassword ? (
              <i className="fas fa-eye-slash" />
            ) : (
              <i className="fas fa-eye" />
            )}
          </button>
        </div>

        <div className="flex mt-6">
          <button
            type="submit"
            disabled={!name || !email || password.length < 6 || loading}
            className="w-full px-4 py-3 font-bold bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register Now'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default RegisterForm;