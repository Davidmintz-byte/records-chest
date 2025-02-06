import React from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../contexts/AuthContext';

const AlbumList = ({ albums, onAlbumUpdated }) => {
    const { currentUser } = useAuth();

    const handleDelete = async (albumId) => {
        if (window.confirm('Are you sure you want to delete this album?')) {
            try {
                const response = await fetch(`/api/albums/${albumId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`
                    }
                });

                if (response.ok) {
                    onAlbumUpdated();
                }
            } catch (error) {
                console.error('Error deleting album:', error);
            }
        }
    };

    if (albums.length === 0) {
        return (
            <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                No albums found. Add your first album!
            </Typography>
        );
    }

    return (
        <Grid container spacing={3}>
            {albums.map((album) => (
                <Grid item xs={12} sm={6} md={4} key={album.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardMedia
                            component="img"
                            height="200"
                            image={album.cover_image || 'https://via.placeholder.com/200'}
                            alt={album.title}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography gutterBottom variant="h6" component="h2">
                                {album.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {album.artist}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Year: {album.year}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <IconButton 
                                    size="small" 
                                    onClick={() => handleDelete(album.id)}
                                    aria-label="delete"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default AlbumList;