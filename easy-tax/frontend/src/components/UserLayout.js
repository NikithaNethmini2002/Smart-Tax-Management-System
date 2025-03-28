import React, { useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  VpnKey as KeyIcon,
  Receipt as TransactionIcon,
  AccountBalance as BudgetIcon,
  BarChart as ChartIcon,
  PersonOutline as ProfileIcon,
  Lock as PasswordIcon,
  Assessment as AssessmentIcon,
  CalculateOutlined as TaxIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import Chatbot from './chatbot/Chatbot';

const drawerWidth = 240;

const UserLayout = ({ children, title }) => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Easy Tax
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button component={RouterLink} to="/dashboard">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <ListItem button component={RouterLink} to="/transactions">
          <ListItemIcon>
            <TransactionIcon />
          </ListItemIcon>
          <ListItemText primary="Transactions" />
        </ListItem>
        
        <ListItem button component={RouterLink} to="/budgets">
          <ListItemIcon>
            <BudgetIcon />
          </ListItemIcon>
          <ListItemText primary="Budgets" />
        </ListItem>
        
        <ListItem button component={RouterLink} to="/reports">
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Financial Reports" />
        </ListItem>
        
        <ListItem button component={RouterLink} to="/manage-taxes">
          <ListItemIcon>
            <TaxIcon />
          </ListItemIcon>
          <ListItemText primary="Manage Taxes" />
        </ListItem>
        
        <ListItem button component={RouterLink} to="/profile">
          <ListItemIcon>
            <ProfileIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        
        <ListItem button component={RouterLink} to="/change-password">
          <ListItemIcon>
            <PasswordIcon />
          </ListItemIcon>
          <ListItemText primary="Change Password" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {auth.user && (
            <Typography variant="body1" sx={{ mr: 2 }}>
              {auth.user.firstName} {auth.user.lastName}
            </Typography>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>
      
      <Chatbot />
    </Box>
  );
};

export default UserLayout; 