import React from 'react';
import { Link } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Lock } from '@mui/icons-material';

const AdminSidebar = () => {
  return (
    <div>
      {/* Add your existing sidebar navigation items here */}
      <Link to="/admin/update-password">
        <ListItem button>
          <ListItemIcon>
            <Lock />
          </ListItemIcon>
          <ListItemText primary="Update Password" />
        </ListItem>
      </Link>
    </div>
  );
};

export default AdminSidebar; 