import axios from "axios";
import { useEffect, useState } from "react";
import "./UserDashboard.css";
import { useNavigate } from "react-router-dom";

const Mobiles=()=>{
    const[mobiles,setMobiles]=useState([]); 
     const navigate=useNavigate();
    const get_Mobiles = async()=>{
    const res=await axios.get('http://localhost:9090/user/mobiles',{
            headers:{
              'Authorization' : `Bearer ${localStorage.getItem("token")}`
            }
    });

    const {data}=res;
    setMobiles(data);

    }

    const display_singleitem=(mobile)=>{
        navigate("/mobiledetails",{state:{mobile}});
    }

    useEffect(()=>{
        get_Mobiles();
    },[]);

      return(
        <>
             <div className="product-container">
                {mobiles.map((mobile) => (
                    <div key={mobile.pid} className="product-card" onClick={()=> display_singleitem(mobile)}>
                    <img src={mobile.pimage} alt={mobile.pname} className="product-image" />
                    <div className="product-details">
                        <div className="product-name">{mobile.pname}</div>
                        <div className="product-price">Price: ${mobile.pcost}</div>
                    </div>
                    </div>
                ))}
            </div>
        </>
      )
}
export default Mobiles;