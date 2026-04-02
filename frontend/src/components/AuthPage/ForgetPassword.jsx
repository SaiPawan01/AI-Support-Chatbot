import { useState } from "react";
import { sendResetPasswordOtp, verifyResetPasswordOtp, resetPassword } from "../../api/auth.api.js";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Code, MessageCircle, Eye, Lock, EyeOff } from 'lucide-react';

export default function ForgotPassword() {
    const [data, setData] = useState({ "email": '', "otp": '', 'password': '', 'confirmPassword': '' });
    const [errors, setErrors] = useState({});
    const [fieldStatus, setFieldStatus] = useState({ 'otp': false, 'password': false })
    const [verificationState, setVerificationState] = useState('email')
    const [showPassword, setShowPassword] = useState({
        'password': false,
        'confirmPassword': false
    });
    const navigate = useNavigate();

    function handleInputChange(e) {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({...prev, [name]:''}))
        if(name === 'email'){
            setVerificationState('email');
            setFieldStatus({ 'otp': false, 'password': false })
            setData({email : value, otp: '', password:'', confirmPassword: ''})
        }
    }

    // Validates email format using a regular expression
    const validateEmailRegex = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // SEND OTP
            if (!fieldStatus.otp) {
                if (!validateEmailRegex(data.email)) {
                    setErrors({ email: 'Invalid Email' });
                    return;
                }

                const response = await sendResetPasswordOtp(data.email);
                if (response.data.success) {
                    setFieldStatus(prev => ({ ...prev, otp: true }));
                    setVerificationState("otp");
                    setErrors({});
                } else {
                    setErrors({ email: response.data.message });
                }
            }

            // VERIFY OTP
            else if (!fieldStatus.password) {
                if (!data.otp || data.otp.length !== 6) {
                    setErrors({ otp: 'Enter valid 6-digit OTP' });
                    return;
                }

                const response = await verifyResetPasswordOtp(data.email,data.otp)
                console.log(response)
                if(response.data && response.data.success){
                    setFieldStatus(prev => ({ ...prev, password: true }));
                    setVerificationState("password");
                    setErrors({});
                }
                else{
                    setErrors({otp: response.data.message})
                }
            }

            // RESET PASSWORD
            else {
                let newErrors = {};

                if (!data.password || data.password.length < 6) {
                    newErrors.password = 'Password must be at least 6 characters';
                }

                if (data.password !== data.confirmPassword) {
                    newErrors.confirmPassword = 'Passwords do not match';
                }

                if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                    return;
                }

                const response = await resetPassword(data.email, data.password);
                if (response.data && response.data.success) {
                    setErrors({});
                    navigate('/login');
                }   
            }
        } catch (error) {
            console.log(error);
        }
    };


    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <MessageCircle className="w-10 h-10 text-blue-500" />
                        <span className="text-2xl font-bold text-white">SupportBot AI</span>
                    </div>
                    <p className="text-slate-400">AI-Powered Customer Support</p>
                </div>

                {/* Card Container */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                    <form onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                        }
                    }} onSubmit={handleSubmit} className="space-y-3">

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
                                    value={data.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    className={`w-full pl-10 pr-4 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition ${errors.email ? 'border-red-500' : 'border-slate-600'
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>


                        {fieldStatus['otp'] && <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Enter OTP
                            </label>
                            <div className="relative">
                                <Code className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    name="otp"
                                    value={data.otp}
                                    onChange={handleInputChange}
                                    placeholder="Enter six digit OTP..."
                                    className={`w-full pl-10 pr-4 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition ${errors.email ? 'border-red-500' : 'border-slate-600'
                                        }`}
                                />
                            </div>
                            {errors.otp && (
                                <p className="text-red-400 text-sm mt-1">{errors.otp}</p>
                            )}
                        </div>}


                        {fieldStatus['password'] && <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                <input
                                    type={showPassword['password'] ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-10 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition ${errors.password ? 'border-red-500' : 'border-slate-600'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => ({ ...prev, 'password': !prev['password'] }))}
                                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                                >
                                    {showPassword['password'] ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>}


                        {fieldStatus['password'] && <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                <input
                                    type={showPassword['confirmPassword'] ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={data.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-10 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition ${errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => ({ ...prev, 'confirmPassword': !prev['confirmPassword'] }))}
                                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                                >
                                    {showPassword['confirmPassword'] ? (
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
                        }

                        <div className="flex justify-end">
                            <Link
                                to="/login"
                                className="text-sm text-blue-400 hover:text-blue-300 transition"
                            >
                                back to login
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"

                            className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {verificationState == 'email' && 'Send OTP'}
                            {verificationState == 'otp' && 'Verify OTP'}
                            {verificationState == 'password' && 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}