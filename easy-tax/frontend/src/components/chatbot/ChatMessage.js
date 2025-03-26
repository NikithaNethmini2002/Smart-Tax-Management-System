import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { SmartToy as BotIcon } from '@mui/icons-material';
import { Person as UserIcon } from '@mui/icons-material';

// Component to render a single chat message (from user or bot)
const ChatMessage = ({ message, isUser }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        mb: 2,
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar for the message */}
      <Avatar
        sx={{
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 36,
          height: 36,
          mr: isUser ? 0 : 1,
          ml: isUser ? 1 : 0,
        }}
      >
        {isUser ? <UserIcon /> : <BotIcon />}
      </Avatar>

      {/* Message bubble */}
      <Box
        sx={{
          maxWidth: '75%',
          p: 2,
          borderRadius: 2,
          bgcolor: isUser ? 'primary.light' : 'grey.100',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            top: '15px',
            ...(isUser
              ? {
                  borderRight: '8px solid',
                  borderRightColor: 'primary.light',
                  right: '-8px',
                }
              : {
                  borderLeft: '8px solid',
                  borderLeftColor: 'grey.100',
                  left: '-8px',
                }),
          },
        }}
      >
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
          {message.text}
        </Typography>

        {/* Timestamp */}
        <Typography
          variant="caption"
          color={isUser ? 'primary.contrastText' : 'text.secondary'}
          sx={{ display: 'block', mt: 1, opacity: 0.8, textAlign: isUser ? 'left' : 'right' }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage; 