import '../../../assets/style/style.css';
import { Button, ButtonGroup } from '@mui/material';
import SwitchButton from '../../../components/global/SwitchButton';
import React, { useState } from "react";


const AdminSettings = () => {
    return (
        <div className='main-container'>
            <div className='settingsContainer'>
                <div className='div'>
                    <div>
                        <p><b>Two-factor Authentication</b></p>
                        <p>Keep your account secure by enabling 2FA via email</p>
                    </div>
                    <div>
                        <SwitchButton />
                    </div>
                </div>
                <div className='div'>
                    <div>
                        <p><b>Mobile Push Notifications</b></p>
                        <p>Receive push notification</p>
                    </div>
                    <div>
                        <SwitchButton />
                    </div>
                </div>
                <div className='div'>
                    <div>
                        <p><b>Desktop Notification</b></p>
                        <p>Receive push notification in desktop</p>
                    </div>
                    <div>
                        <SwitchButton />
                    </div>
                </div>
                <div className='div'>
                    <div>
                        <p><b>Email Notifications</b></p>
                        <p>Receive email notification</p>
                    </div>
                    <div className='button'>
                        <SwitchButton />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;