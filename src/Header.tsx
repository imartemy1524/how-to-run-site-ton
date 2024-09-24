import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TonLogo from "./assets/favicon-small.avif"
import MenuIcon from "./assets/Menu.svg";
import {useTonAddress, useTonConnectModal, useTonConnectUI} from "@tonconnect/ui-react";
import {useNavigate} from "react-router-dom";

export function Header() {
    const currentAddress = useTonAddress();
    const {open} = useTonConnectModal();
    const [tonConnectUI] = useTonConnectUI();
    const navigate = useNavigate();
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        if (currentAddress) {
            setAnchorElUser(event.currentTarget);
        } else {
            open();
        }
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <AppBar position="fixed">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/*<AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />*/}
                    <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}>

                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <img src={MenuIcon} alt="Menu" style={{display: 'block', width: '24px', height: '24px'}}/>
                            {/*<MenuIcon />*/}
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{display: {xs: 'block', md: 'none'}}}
                        >
                            <MenuItem onClick={()=>{
                                navigate('/');
                                handleCloseNavMenu();
                            }}>
                                <Typography sx={{textAlign: 'center'}}>Home</Typography>
                            </MenuItem>
                            <MenuItem onClick={()=>{
                                navigate('/subdomains');
                                handleCloseNavMenu();
                            }}>
                                <Typography sx={{textAlign: 'center'}}>Manage DNS</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                    {/*<AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />*/}
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: {xs: 'flex', md: 'none'},
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        <img src={TonLogo} height={"40px"} width={"40px"} style={{borderRadius: '1000px'}} />

                    </Typography>
                    <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}}}>
                        <img src={TonLogo} height={"40px"} width={"40px"} style={{marginTop: "15px", borderRadius: '1000px'}}/>
                        <Button
                            onClick={() => {
                                navigate('/');
                                handleCloseNavMenu();
                            }}
                            sx={{my: 2, color: 'white', display: 'block'}}
                        >Home</Button>
                        <Button
                            onClick={() => {
                                handleCloseNavMenu();
                                navigate('/subdomains');
                            }}
                            sx={{my: 2, color: 'white', display: 'block'}}
                        >Manage DNS</Button>

                    </Box>
                    <Box sx={{flexGrow: 0}}>
                        <Tooltip title={currentAddress ? 'Manage connection' : 'Connect wallet'}>
                            <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
                                <Avatar alt="Remy Sharp" src=""/>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{mt: '45px'}}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItem onClick={() => {
                                handleCloseUserMenu();
                                navigator.clipboard.writeText(currentAddress || '')
                                    .catch(console.error)
                            }}>
                                <Typography sx={{textAlign: 'center'}}>Copy address</Typography>
                            </MenuItem>
                            <MenuItem onClick={()=>{
                                handleCloseUserMenu();
                                navigate('/my-domains');
                            }}>
                                <Typography sx={{textAlign: 'center'}}>My domains</Typography>
                            </MenuItem>
                            <MenuItem onClick={() => {
                                tonConnectUI.disconnect()
                                    .catch(console.error)
                                handleCloseUserMenu();
                            }}>

                                <Typography sx={{textAlign: 'center'}}>Logout</Typography>
                            </MenuItem>

                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
