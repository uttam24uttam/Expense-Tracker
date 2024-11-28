// import React from 'react';
// import "tailwindcss/tailwind.css";
// import { UserOutlined } from '@ant-design/icons';
// import { Button, Dropdown } from 'antd';
// import { useNavigate } from 'react-router-dom';

// function DefaultLayout(props) {

//     const navigate = useNavigate()
//     // Define menu items for the dropdown
//     const items = [
//         {
//             label: 'Sign out',
//             key: '1',
//             icon: <UserOutlined />,
//             danger: true,
//         },
//     ];

//     const menuProps = {
//         items,
//         onClick: (event) => {
//             if (event.key === '1') {
//                 console.log('Sign out clicked');
//                 localStorage.removeItem('User');
//                 navigate("/login")
//             }
//         },
//     };
//     const user = JSON.parse(localStorage.getItem("User")) || { name: "Guest" };

//     return (
//         <div className='Layout my-2 mx-[125px] '>
//             <div className='header bg-blue-gray-600 p-4 rounded-xl h-[10vh] flex justify-between items-center'>
//                 <div>
//                     <h1 className='text-white text-xl m-0 pl-4'>Expense Tracker</h1>
//                 </div>
//                 <div >
//                     <Dropdown.Button
//                         menu={menuProps}
//                         icon={<UserOutlined />} >

//                         {user.name}
//                     </Dropdown.Button>
//                 </div>
//             </div>


//             <div className='h-[80vh] overflow-y-scroll shadow-[0_0_3px_gray] mt-5 rounded-tl-lg rounded-tr-lg content p-4'>
//                 {props.children}
//             </div>
//         </div>
//     );
// }

// export default DefaultLayout;


import React from 'react';
import "tailwindcss/tailwind.css";
import { UserOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';

function DefaultLayout(props) {

    const navigate = useNavigate();
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
                navigate("/login");
            }
        },
    };
    const user = JSON.parse(localStorage.getItem("User")) || { name: "Guest" };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-blue-gray-600 shadow-md py-4 px-6 flex justify-between items-center">
                <div>
                    <h1 className="text-white text-2xl font-semibold tracking-wide">
                        Expense Tracker
                    </h1>
                </div>
                <div>
                    <Dropdown.Button
                        menu={menuProps}
                        icon={<UserOutlined />}
                        className="bg-blue-gray-500 hover:bg-blue-gray-400 text-white border-none">
                        {user.name}
                    </Dropdown.Button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-grow container mx-auto my-6 px-4">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    {props.children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-blue-gray-700 py-4 text-center text-sm text-white">
                © {new Date().getFullYear()} Expense Tracker. All rights reserved.
            </footer>
        </div>
    );
}

export default DefaultLayout;
