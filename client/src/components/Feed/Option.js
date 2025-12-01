import React, { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import { Box, Card, Typography } from '@mui/material';
import { useLocation, useNavigate } from "react-router-dom";

function Option() {

    return (
        <Box
            sx={{
            
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                minHeight: '80vh',
                padding: 2,
                gap: 3,
                marginTop: 2,
            }}
        >
            {/* 전체 박스 */}
            <Box
                sx={{
                    display: 'flex',
                    width: '90%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #000000ff',
                    borderRadius: 5,
                    boxShadow: "0px 5px 3px rgba(0, 0, 0, 0.81)",
                    padding: 3,
                    gap: 3,
                    marginTop: 4,
                    marginLeft: 50,
                    marginRight: 50
                }}
            >
                준비중
            </Box>
        </Box>
    );
}

export default Option;
