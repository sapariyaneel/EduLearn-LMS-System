import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./global/Login";
import UserDashboard from "./user/UserDashboard";
import AdminDashboard from "./admin/AdminDashboard";
import Error from "./global/Error";
import Register from "./admin/Register";
import UploadLaptop from "./admin/UploadLaptop";
import UploadMobiles from "./admin/UploadMobiles";
import UploadHeadphone from "./admin/UploadHeadphone";
import Laptops from "./user/Laptops";
import Mobiles from "./user/Mobiles";
import Headphones from "./user/Headphones";
import LaptopDetails from "./user/LaptopDetails";
import { CartProvider } from "../CartContext";
import CartInvoice from "../CartInvoice";
import MobilesDetails from "./user/MobileDetails";
import HeadphoneDetails from "./user/HeadphoneDetails";
// import MainLayout from "./global/MainLayout";
import MainLayout from "./marketing/MainLayout.jsx";
import LandingPage from "./marketing/LandingPage";

import Register_user from "./global/Register_user.jsx";

const Master = () => {
    return (
        <>
            <CartProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={
                            <MainLayout isLanding={true}>
                                <LandingPage />
                            </MainLayout>
                        } />
                        <Route path="/login" element={<Login></Login>}></Route>
                        <Route path="/register_user" element={<Register_user></Register_user>}></Route>


                        <Route path="/userdashboard" element={<UserDashboard></UserDashboard>}>
                            <Route index element={<Laptops></Laptops>}></Route>

                            <Route path="userdashboard/laptops" element={<Laptops></Laptops>}></Route>
                            <Route path="userdashboard/mobiles" element={<Mobiles></Mobiles>}></Route>
                            <Route path="userdashboard/headphones" element={<Headphones></Headphones>}></Route>
                        </Route>

                        <Route path="/admindashboard" element={<AdminDashboard></AdminDashboard>}>

                            <Route index element={<Register></Register>}></Route>
                            <Route path="admindashboard/register" element={<Register></Register>}></Route>
                            <Route path="admindashboard/uploadlaptop" element={<UploadLaptop></UploadLaptop>}></Route>
                            <Route path="admindashboard/uploadmobiles" element={<UploadMobiles></UploadMobiles>}></Route>
                            <Route path="admindashboard/uploadheadphone" element={<UploadHeadphone></UploadHeadphone>}></Route>
                        </Route>

                        <Route path="/laptopdetails" element={<LaptopDetails></LaptopDetails>}></Route>
                        <Route path="/mobiledetails" element={<MobilesDetails></MobilesDetails>}></Route>
                        <Route path="/headphonedetails" element={<HeadphoneDetails></HeadphoneDetails>}></Route>

                        <Route path="/error" element={<Error></Error>}></Route>

                        <Route path="/cart" element={<CartInvoice></CartInvoice>}></Route>
                        
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </>
    )
}
export default Master;