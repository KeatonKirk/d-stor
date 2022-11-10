import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { RiHomeFill } from 'react-icons/ri';
import { IoIosArrowForward } from 'react-icons/io';
import logo from '../assets/logo.png';
import Upload from './Upload'
//import { categories } from '../utils/data';

const isNotActiveStyle = 'flex items-center px-5 gap-3 text-gray-500 hover:text-black transition-all duration-200 ease-in-out capitalize';
const isActiveStyle = 'flex items-center px-5 gap-3 font-extrabold border-r-2 border-black  transition-all duration-200 ease-in-out capitalize';

const Sidebar = ({bucket_id, user_obj, setUser}) => {
  // const handleCloseSidebar = () => {
  //   if (closeToggle) closeToggle(false);
  // };

  return (
    <div className="flex flex-col justify-between bg-primary h-full overflow-y-scroll min-w-210 hide-scrollbar">
      <div className="flex flex-col">
        <div className="flex flex-col gap-5 text-white">

				<Upload bucket_id={bucket_id} user_obj={user_obj} setUser={setUser}/>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;