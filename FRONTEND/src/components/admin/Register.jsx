import { useRef } from "react";
import axios from "axios";
const Register = ()=>{
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const register = async ()=>{
        const res = await axios.post("http://localhost:9090/admin/register", {"username":ref1.current.value,"password":ref2.current.value,"role":ref3.current.value},{
            headers:{
               "Authorization":`Bearer ${localStorage.getItem('token')}`
            }
        });
        const {data} = res;
        if(data!=null){
            alert("Registration Success !!!");
        }else{
            alert("Registration Fail !!!");
        }
    }
    return(
        <>
            <input type="text" ref={ref1} placeholder="enter username"></input>
            <br></br><br></br>
            <input type="password" ref={ref2} placeholder="enter password"></input>
            <br></br><br></br>
            <input type="text" ref={ref3} placeholder="enter role"></input>
            <br></br><br></br>
            <button onClick={register}>Register</button>
        </>
    )
}
export default Register;