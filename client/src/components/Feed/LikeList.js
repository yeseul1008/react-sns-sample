import React, { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import { Box, Card, Typography } from '@mui/material';

function LikeList() {
    const [likeList, setLikeList] = useState([]);

    const fnLikeList = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);

            try {
                const res = await fetch("http://localhost:3010/feed/likeList/" + decoded.userId);
                const data = await res.json();
                setLikeList(data.list);
            } catch (err) {
                console.error(err);
            }
        } else {
            alert("로그인 후 이용해주세요.");
        }
    };

    useEffect(() => {
        fnLikeList();
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                padding: 2,
            }}
        >
            {/* 전체 카드 컨테이너 */}
            <Box
                sx={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #000000ff',
                    borderRadius: 5,
                    boxShadow: "0px 5px 3px rgba(0, 0, 0, 0.81)",
                    padding: 4,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 2,
                    maxWidth: 900,
                }}
            >
                {likeList.map((item) => (
                    <Card
                        key={item.LIKE_ID}
                        sx={{
                            width: 250,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: 1.5,
                            borderRadius: 2,
                            boxShadow: '0px 3px 8px rgba(0,0,0,0.2)',
                        }}
                    >

                        <Box
                            component="img"
                            src={
                                item.IMAGE_URL
                                    ? item.IMAGE_URL // 이미 전체 URL
                                    : item.LASTFM_TRACK_ID
                                        ? item.LASTFM_TRACK_ID
                                        : "/ummban.png"
                            }
                            alt={item.MUSIC_TITLE || "노래 이미지"}
                            sx={{
                                width: '100%',
                                aspectRatio: '1/1',
                                objectFit: 'cover',
                                borderRadius: 1,
                                marginBottom: 1,
                            }}
                        />

                        <Typography
                            fontWeight="bold"
                            fontSize={14}
                            textAlign="center"
                            sx={{ overflowWrap: "break-word" }}
                        >
                            {item.MUSIC_TITLE || "노래 제목"}
                        </Typography>
                        <Box sx={{ width: '100%', textAlign: 'center', mb: 1 }}>
                            <Typography fontSize={12} color="text.secondary">
                                {item.SINGER || "가수 이름"}
                            </Typography>
                        </Box>

                    </Card>
                ))}
            </Box>
        </Box>
    );
}

export default LikeList;
