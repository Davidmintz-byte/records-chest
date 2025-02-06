import React, { useState, useEffect } from 'react';
import { Container, Button, TextField, Grid, Typography, Box } from '@mui/material';
import AddAlbumForm from './AddAlbumForm';
import AlbumList from './AlbumList';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
    const [albums, setAlbums] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        fetchAlbums();
    }, [currentUser, navigate]);

    const fetchAlbums = async () => {
        try {
            const response = await fetch('/api/albums', {
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAlbums(data);
            }
        } catch (error) {
            console.error('Error fetching albums:', error);
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredAlbums = albums.filter(album =>
        album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddAlbum = async (newAlbum) => {
        try {
            const response = await fetch('/api/albums', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(newAlbum)
            });

            if (response.ok) {
                const savedAlbum = await response.json();
                setAlbums([...albums, savedAlbum]);
                setShowAddForm(false);
            }
        } catch (error) {
            console.error('Error adding album:', error);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    My Album Collection
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Search albums..."
                            variant="outlined"
                            value={searchTerm}
                            onChange={handleSearch}
                            sx={{ mb: 3 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                            onClick={() => setShowAddForm(true)}
                            sx={{ height: '56px' }}
                        >
                            Add New Album
                        </Button>
                    </Grid>
                </Grid>

                {showAddForm && (
                    <Box sx={{ mt: 3, mb: 4 }}>
                        <AddAlbumForm
                            onSubmit={handleAddAlbum}
                            onCancel={() => setShowAddForm(false)}
                        />
                    </Box>
                )}

                <Box sx={{ mt: 4 }}>
                    <AlbumList
                        albums={filteredAlbums}
                        onAlbumUpdated={fetchAlbums}
                    />
                </Box>
            </Box>
        </Container>
    );
};

export default HomePage;