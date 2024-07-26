import React from 'react';
import "tailwindcss/tailwind.css";
import { UserOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';

function DefaultLayout(props) {

    const navigate = useNavigate()
    // Define menu items for the dropdown
    const items = [
        {
            label: 'Sign out',
            key: '1',
            icon: <UserOutlined />,
            danger: true,
        },
    ];

    const menuProps = {
        items,
        onClick: (event) => {
            if (event.key === '1') {
                console.log('Sign out clicked');
                localStorage.removeItem('User');
                navigate("/login")
            }
        },
    };
    const user = JSON.parse(localStorage.getItem("User")) || { name: "Guest" };

    return (
        <div className='Layout my-2 mx-[125px] '>
            <div className='header bg-blue-gray-600 p-4 rounded-xl h-[10vh] flex justify-between items-center'>
                <div>
                    <h1 className='text-white text-xl m-0 pl-4'>Expense Tracker</h1>
                </div>
                <div >
                    <Dropdown.Button
                        menu={menuProps}
                        icon={<UserOutlined />} >

                        {user.name}
                    </Dropdown.Button>
                </div>
            </div>


            <div className='h-[80vh] overflow-y-scroll shadow-[0_0_3px_gray] mt-5 rounded-tl-lg rounded-tr-lg content p-4'>
                {props.children}
            </div>
        </div>
    );
}

export default DefaultLayout;
