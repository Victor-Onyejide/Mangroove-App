import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { use, useEffect, useState } from "react";
import { loginAsUser } from "../features/userSlice";
import user from './database.json';
import { toast } from 'react-toastify';
import axios from "axios";


export default function LoginPage()
{
    const { sessionId, shareLink } = useSelector((state) => state.user);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async() => {
        // const getSession = user.sessions.find(session => session.id.toString() === sessionId);
        try{
            const {data} = await axios.post('/api/user/login', {email,password});
            localStorage.setItem('userInfo', JSON.stringify(data));
            // dispatch(loginAsUser(getSession));
            navigate('/sessions')
            toast.success('Welcome!')


        }
        catch(err){
            console.log('Error', err)
            toast.error(err);

        }

        //TODO: Remove shareLink checker and then check the user. The user should have 
        if(shareLink)
        {
            navigate(`/session/${sessionId}`);
        }
        //TODO: add dispatch signin 
        // const submitHandler = (e) => {
        //     e.preventDefault();
        //     dispatch(signin(email, password)); 
        // };

    }
    return(
        <div className="loginPage">

            <h2>Log in to your account</h2>
            <div className="form mt-4">
                <input  
                    class="email mt-3" 
                    type="text" placeholder="Enter your email"
                    onChange={(e)=>setEmail(e.target.value)}
                />

                <input 
                    class="password mt-3 mb-3" 
                    type="password" placeholder="Password"
                    onChange={(e)=> setPassword(e.target.value)}
                /> 
                <hr/>
                <p className="text-dark">Sign In as guest <Link to="/guest">Guest</Link></p>

                <button 
                    className="action-btn mt-3"
                    onClick={() => handleLogin()}
                > 
                    Continue
                </button>
            </div>
            <p className="mt-3">Don't have an account? <Link to="/signup" className="signupText">Sign up for free &#8594;</Link></p>
        </div>
    );
}