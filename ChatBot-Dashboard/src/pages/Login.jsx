import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PixelTrail from '../components/PixelTrail.jsx';
import api from '../api/api.js';
import AnimatedLogo from "../components/AnimatedLogo.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useTheme } from "@/context/ThemeProvider";
import styles from "./styles/Login.module.css";

function useCssVar(prop) {
    const { theme }=useTheme();
    const [value, setValue]=useState(() =>
        getComputedStyle(document.documentElement).getPropertyValue(prop).trim()
    );
    useEffect(() => {
        setValue(
            getComputedStyle(document.documentElement).getPropertyValue(prop).trim()
        );
    }, [theme, prop]);
    return value;
}

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
    const trailColor=useCssVar("--primary");

    function handleChange(e){
        setData({ ...data, [e.target.name]: e.target.value });
    }
    async function handleLogin(e){
        if(e?.preventDefault) e.preventDefault();
        setError("");
        if(!data.username.trim() || !data.password.trim()){
            setError("Username and Password are required");
            return;
        }
        if(data.password.length < 6){
            setError("Password must be at least 6 characters");
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
                if (resp.data.user) {
                    localStorage.setItem("user", JSON.stringify(resp.data.user));
                }
            }

            const user = resp.data?.user;
            if(user?.role === "Student" && !user?.student_id){
                navigate("/onboarding");
            }
            else if(user?.role === "Counselor" && !user?.counselor_id){
                navigate("/onboarding/counselor-profile");
            }
            else if(user?.role === "Admin"){
                navigate("/admin");
            }
            else{
                navigate("/dashboard");
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
        if(e?.preventDefault) e.preventDefault();
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
            setError("Password must be at least 6 characters")
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
                if (resp.data.user) {
                    localStorage.setItem("user", JSON.stringify(resp.data.user));
                }
            }
            const user = resp.data?.user;
            if(user?.role === "Admin") {
                navigate("/admin");
            } 
            else if(!user?.onboardingCompleted) {
                navigate("/onboarding");
            } 
            else{
                navigate("/dashboard");
            }
        }
        catch(err){
            console.log("Registration Error Occurred: ", err);
            const backendMessage = err.response?.data?.message;
            console.log("Backend Message: ", backendMessage);
            setError(backendMessage || "Registration Failed");
        }
        finally {
            setLoading(false);
        } 
    }
    return (
        <div className={styles.container}>
            <div className={styles.leftSection}>
                <PixelTrail
                    gridSize={50}
                    trailSize={0.1}
                    maxAge={250}
                    interpolate={5}
                    color={trailColor || "#ea580c"}
                    gooeyFilter={{ id: "custom-goo-filter", strength: 2 }}
                    gooeyEnabled
                    gooStrength={2}/>
                    
                <div className={styles.left}>
                    <div className={styles.logo}>
                        <AnimatedLogo/>
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Campus Mitra is ready to assist you</p>
                </div>
            </div>
            <div className={styles.rightSection}>
                <div className={styles.loginThemeToggle}>
                    <ThemeToggle />
                </div>
                <div className={styles.box}>
                    <h1 className={styles.title}>
                        {
                            isRegister?"Register":"Login"
                        }
                    </h1>
                    <p className={styles.subtitle}>Enter your credentials to continue</p>

                    {isRegister && (
                        <form className={styles.form} onSubmit={handleRegisterInitiate}>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={data.username}
                                onChange={handleChange}
                                className={styles.loginInput}
                                autoComplete="username"
                            />
                            <select
                                name="role"
                                value={data.role}
                                onChange={handleChange}
                                className={styles.loginSelect}>
                                <option value="" disabled hidden>
                                    Select your role
                                </option>
                                <option value="Student">Student</option>
                                <option value="Admin">Admin</option>
                                <option value="Counselor">Counselor</option>
                            </select>

                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={data.password}
                                onChange={handleChange}
                                className={styles.loginInput}
                                autoComplete="new-password"
                            />
                            <button 
                                type="submit"
                                className={styles.btn}
                                disabled={loading}>
                                Register
                            </button>
                        </form>
                    )}
                    
                    
                    {!isRegister && (
                        <form className={styles.form} onSubmit={handleLogin}>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={data.username}
                                onChange={handleChange}
                                className={styles.loginInput}
                                autoComplete="username"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={data.password}
                                onChange={handleChange}
                                className={styles.loginInput}
                                autoComplete="current-password"
                            />
                            <button 
                                type="submit"
                                className={styles.btn}
                                disabled={loading}>
                                {loading?"Loading...":"Login"}
                            </button>
                        </form>
                    )}
                    
                    <p className={styles.switch}>
                        {
                            isRegister?"Already Have An Account ?":"Don't have an Account ?"
                        }
                        <span
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError("");
                            }}> 
                                {isRegister?" Log In":" Sign up"}
                        </span>
                    </p>
                    {
                        error&&(
                            <p className={styles.error}>
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