import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PixelTrail from './components/PixelTrail';
import api from './api/api.js';

// npm install three @react-three/fiber @react-three/drei axios react-router-dom tailwindcss @tailwindcss/vite
function Login() {
    const [data, setData] = useState({
        username: "",
        role: "Student",
        password: "",
    })
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function handleChange(e){
        setData({ ...data, [e.target.name]: e.target.value });
    }
    
    async function handleLogin(e){
        setError("");
        if(!data.username.trim() || !data.password.trim()){
            setError("Username and Password are required");
            return;
        }
        if(data.password.length < 6){
            setError("Password must be 6 characters");
            return;
        }
        try{
            setLoading(true);
                const resp = await api.post(
                "/auth/login",
                {
                    username: data.username,
                    password: data.password
                },
                { withCredentials: true });

                if(resp.data?.success && resp.data?.token){
                    localStorage.setItem("token", resp.data.token);
                }

                const user = resp.data?.user;
                if(user?.role === "Student" ){
                    navigate("/home");
                } 
                else if(user?.role === "Counselor" && !user?.counselor_id){
                    navigate("/onboarding/counselor-profile");
                } 
                else{
                    navigate("/home");
                }
            } catch(err){
            console.log("Login Error Occured: ", err);
            const backendMessage = err.response?.data?.message;
            setError(backendMessage || "Login Failed");
        }
        finally{
            setLoading(false);
        }
    }

    async function handleRegisterInitiate(e){
        if(e && e.preventDefault){
            e.preventDefault();
        }
        setError("");
        if(!data.username.trim()){
            setError("Username is Required")
            return
        }
        if(!data.password.trim()){
            setError("Password is Required")
            return
        }
        if(data.password.length < 6){
            setError("Password must be atleast 6 characters")
            return
        }
        try{
            setLoading(true);
            const resp = await api.post(
            "/auth/register",
            {
                username: data.username,
                role: data.role, 
                password: data.password
            },
            { withCredentials: true });
            if(resp.data?.success && resp.data?.token){
                localStorage.setItem("token", resp.data.token);
            }
            const user = resp.data?.user;
            if(user?.role === "Student" ){
                navigate("/home");
            }
            else if(user?.role === "Counselor" && !user?.counselor_id){
                navigate("/onboarding/counselor-profile");
            }
            else{
                navigate("/home");
            }
        }
        catch(err){
            console.log("Registeration Error Occured: ", err);
            const backendMessage = err.response?.data?.message;
            console.log("Backend Message: ", backendMessage);
            setError(backendMessage || "Registeration Failed");
        }
        finally {
            setLoading(false);
        } 
    }

    async function handleLogout(){
        try{
            await api.post("/auth/logout", {}, { withCredentials: true });
        }
        catch(err){
            console.log("Logout Error Occured: ", err);
        }
        finally{
            localStorage.removeItem("token");
        }
        navigate("/login");
    }
    return (
        <div className="flex min-h-screen" style={{ background: "#0E0C1A" }}>
            <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden" style={{ background: "#0c091b" }}>
                <PixelTrail
                    gridSize={50}
                    trailSize={0.1}
                    maxAge={250}
                    interpolate={5}
                    color="#7F77DD"
                    gooeyFilter={{ id: "custom-goo-filter", strength: 2 }}
                    gooeyEnabled
                    gooStrength={2}
                />
                <div className="absolute text-center pointer-events-none">
                    <div className="text-5xl mb-4" style={{ color: "#594bf9" }}>🤖</div>
                    <h1 className="text-4xl font-bold mb-2" style={{ color: "#EEEDFE" }}>Welcome Back</h1>
                    <p className="text-sm" style={{ color: "#594bf9" }}>Your ChatBot is waiting</p>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 px-8" style={{ background: "#1a1556" }}>
                <div className="w-full max-w-md">
                    <h1 className="text-3xl font-bold mb-1" style={{ color: "#EEEDFE" }}>
                        {
                            isRegister?"Register":"Login"
                        }
                    </h1>
                    <p className="text-sm mb-8" style={{ color: "#594bf9" }}>
                        Enter your credentials to continue
                    </p>
                    {isRegister && (
                        <div className="flex flex-col w-full">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={data.username}
                                onChange={handleChange}
                                className="w-full rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                                style={{
                                    background: "#0E0C1A",
                                    border: "1px solid #594bf9",
                                    color: "#EEEDFE",
                                }}
                            />
                            <select
                                name="role"
                                value={data.role}
                                onChange={handleChange}
                                className="w-full rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-white appearance-none cursor-pointer"
                                style={{
                                    background: "#0E0C1A",
                                    border: "1px solid #594bf9",
                                    color: "#EEEDFE",
                                }}
                            >
                                <option value="" disabled hidden>
                                    Select your role
                                </option>
                                <option value="Student" style={{ background: "#0E0C1A" }}>Student</option>
                                <option value="Admin" style={{ background: "#0E0C1A" }}>Admin</option>
                                <option value="Counselor" style={{ background: "#0E0C1A" }}>Counselor</option>
                            </select>


                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={data.password}
                                onChange={handleChange}
                                className="w-full rounded-lg px-4 py-3 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                                style={{
                                    background: "#0E0C1A",
                                    border: "1px solid #594bf9",
                                    color: "#EEEDFE",
                                }}
                            />
                            <button 
                                className="items-center font-semibold py-2 rounded-xl transition duration-200 mb-8"
                                style={{ background: "#594bf9", color: "#EEEDFE" }}
                                onMouseEnter={e => e.target.style.background="#776bfc"}
                                onMouseLeave={e => e.target.style.background="#594bf9"}
                                onClick={handleRegisterInitiate}
                                disabled={loading}>
                                Register
                            </button>
                        </div>
                    )}
                    
                    
                    {!isRegister && (
                        <div className="flex flex-col gap-5 w-full">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={data.username}
                                onChange={handleChange}
                                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                                style={{
                                    background: "#0E0C1A",
                                    border: "1px solid #594bf9",
                                    color: "#EEEDFE",
                                }}
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={data.password}
                                onChange={handleChange}
                                className="w-full rounded-lg px-4 py-3 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                                style={{
                                    background: "#0E0C1A",
                                    border: "1px solid #594bf9",
                                    color: "#EEEDFE",
                                }}
                            />
                            <button 
                                className="items-center w-40 font-semibold py-2 rounded-xl transition duration-200 mb-8"
                                style={{ background: "#594bf9", color: "#EEEDFE" }}
                                onMouseEnter={e => e.target.style.background="#776bfc"}
                                onMouseLeave={e => e.target.style.background="#594bf9"}
                                onClick={handleLogin}
                                disabled={loading}>
                                {loading?"Loading...":"Login"}
                            </button>
                        </div>
                    )}
                    
                    <p className="text-center text-sm mt-6" style={{ color: "#594bf9" }}>
                        {
                            isRegister?"Already Have An Account ?":"Don't have an Account ?"
                        }
                        <span 
                            className="cursor-pointer font-medium" 
                            style={{ color: "#ffffff" }} 
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError("");
                            }}> 
                                {isRegister?" Log In":" Sign up"}
                        </span>
                    </p>
                    {
                        error&&(
                            <p className="text-red-500 text-sm text-center mt-4 font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                                {error}
                            </p>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
export default Login;