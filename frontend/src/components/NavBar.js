import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavBar = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Record Chest
                </Typography>
                {currentUser ? (
                    <>
                        <Button color="inherit" onClick={() => navigate('/')}>
                            Home
                        </Button>
                        <Button color="inherit" onClick={handleLogout}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Button color="inherit" onClick={() => navigate('/login')}>
                            Login
                        </Button>
                        <Button color="inherit" onClick={() => navigate('/register')}>
                            Register
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;