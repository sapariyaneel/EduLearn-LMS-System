import axios from "axios";
import { useEffect, useState } from "react";
import "./UserDashboard.css";
import { useNavigate } from "react-router-dom";
const Laptops=()=>{

     const[laptops,setLaptops]=useState([]); 
     const navigate=useNavigate();
     
      const get_Laptops = async()=>{
      const res=await axios.get('http://localhost:9090/user/laptops',{
              headers:{
                'Authorization' : `Bearer ${localStorage.getItem("token")}`
              }
      });

      const {data}=res;
      setLaptops(data);

      }

      const display_singleitem=(laptop)=>{
          navigate("/laptopdetails",{state:{laptop}});
      }

      useEffect(()=>{
          get_Laptops();
      },[]);

        return(
            <>
            <div className="product-container">
                {laptops.map((laptop) => (
                    <div key={laptop.pid} className="product-card" onClick={()=> display_singleitem(laptop)}>
                    <img src={laptop.pimage} alt={laptop.pname} className="product-image" />
                    <div className="product-details">
                        <div className="product-name">{laptop.pname}</div>
                        <div className="product-price">Price: ${laptop.pcost}</div>
                    </div>
                    </div>
                ))}
            </div>
            
            </>
        )
}
export default Laptops;