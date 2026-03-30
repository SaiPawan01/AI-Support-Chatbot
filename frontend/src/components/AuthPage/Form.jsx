import React, {useState} from "react";
import {Mail, Lock, User, ArrowRight, Eye, EyeOff, Code} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser, sendOtp, verifyOtp } from '../../api/auth.api.js';

export default function Form({isLogin, setIsLogin, formData, setFormData, errors, setErrors}) {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);



    const hangleEmailVerification = async () => {
        try{
            const response = await sendOtp(formData.email);
            console.log(response.data)
            if(response.data && response.data.success) {
                setOtpSent(true);
            }
            else{
                setErrors(prev => ({ ...prev, email: response.data.message || 'something went wrong' }));
            }
        }catch(error){
            console.log("email verification error:", error);
        }
    }

    const handleOTPVerification = async () => {
      try {
        const response = await verifyOtp(formData.email, formData.otp);
        console.log(response)
        if (response.data.success) {
          setEmailVerified(true);
          setOtpSent(false);
        }

      } catch (error) {
        const message = error.response?.data?.message || "Invalid OTP";

        console.log("OTP Error:", message);

        setErrors(prev => ({
          ...prev,
          otp: message
        }));
      }
    };


    const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }else if(!isLogin && !emailVerified){
        newErrors.email = 'Please verify your email';
    }
    


    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'You must agree to the terms';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // post request to backend API for signup

      if (!isLogin) {
        formData.fullName = formData.firstName + formData.lastName;
        const data = {
          email: formData.email,
          password: formData.password,
          username: formData.fullName,
          first_name: formData.firstName,
          last_name: formData.lastName,

        };
        const response = await registerUser(data);
        if (response.data && response.data.success) {
          setLoading(false);
          setIsLogin(true);
          setEmailVerified(false);
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            agreeTerms: false,
            otp:''
          });
        }
      }
      else {
        const response = await loginUser({
          email: formData.email,
          password: formData.password
        });
        console.log(response)
        if (response.data && response.data.success) {
          localStorage.setItem('access_token', response.data.access_token);
          console.log("Login successful:", response.data);
          setLoading(false);
          navigate('/chatbot');
        }
      }
    } catch (error) {
      setLoading(false);
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.message || 'An error occurred. Please try again.'
      }));
    }
  };

    return <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name Field (Signup only) */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={`w-full pl-10 pr-4 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition ${errors.fullName ? 'border-red-500' : 'border-slate-600'
                        }`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={`w-full pl-10 pr-4 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition ${errors.fullName ? 'border-red-500' : 'border-slate-600'
                        }`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>

              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => {
                    handleInputChange(e)
                    if(emailVerified){
                      setEmailVerified(false);
                    }
                    if(otpSent){
                      setOtpSent(false);
                    }
                  }}
                  placeholder="you@example.com"
                  className={`${isLogin  ? 'w-full' : (emailVerified ? 'w-full' : 'w-[75%]')} pl-10 pr-4 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition ${errors.email ? 'border-red-500' : 'border-slate-600'
                    }`}
                />
                { (!emailVerified && !otpSent && !isLogin) && (
                  <button
                    type="button"
                    className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                    onClick={hangleEmailVerification}
                  >
                    Verify
                  </button>
                )}
              </div>
              {otpSent && !emailVerified && (
                <p className="text-yellow-400 text-sm mt-1">
                  Please check your email for the OTP.
                </p>
              )}
              {emailVerified && (
                <p className="text-yellow-400 text-sm mt-1">
                  Email verified successfully.
                </p>
              )}
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>


            {(!isLogin && otpSent ) && <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Enter OTP
              </label>
              <div className="relative">
                <Code className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="Enter six digit OTP..."
                  className={`${isLogin ? 'w-full' : 'w-[75%]'} pl-10 pr-4 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition ${errors.email ? 'border-red-500' : 'border-slate-600'
                    }`}
                />
                { (!emailVerified && !isLogin) && (
                  <button
                    type="button"
                    className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                    onClick={handleOTPVerification}
                  >
                    Verify
                  </button>
                )}
              </div>
              {errors.otp && (
                <p className="text-red-400 text-sm mt-1">{errors.otp}</p>
              )}
            </div>}



            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition ${errors.password ? 'border-red-500' : 'border-slate-600'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition ${errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Forgot Password Link (Login only) */}
            {isLogin && (
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-sm text-blue-400 hover:text-blue-300 transition"
                >
                  Forgot password?
                </a>
              </div>
            )}

            {/* Terms & Conditions (Signup only) */}
            {!isLogin && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500 mt-1 cursor-pointer"
                />
                <label className="text-sm text-slate-300">
                  I agree to the{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300">
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}
            {errors.agreeTerms && (
              <p className="text-red-400 text-sm">{errors.agreeTerms}</p>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  {isLogin ? 'Login' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
}