import {Link,Outlet,useNavigate}from "react-router-dom"
const AdminDashboard=()=>{
   const navigate=useNavigate();

   const logout=()=>{
    localStorage.removeItem("token");
    navigate("/")
   }

   return(
    <>
      {/* <Link to="admindashboard/register" style={{marginRight:200}}>Register</Link> */}
      <h1>Admin dashborad soon ....!</h1>
      {/* <Link to="admindashboard/uploadmobiles" style={{marginRight:200}}>UploadMobiles</Link>
      <Link to="admindashboard/uploadlaptop" style={{marginRight:200}}>UploadLaptop</Link>
      <Link to="admindashboard/uploadheadphone" style={{marginRight:200}}>UploadHeadphone</Link> */}
     <a onClick={logout}>LogOut</a>
     
      <br></br>
      {/* <Outlet></Outlet> */}
      

    </>
   )
}
export default AdminDashboard;