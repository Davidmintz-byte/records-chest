import React, { useState } from 'react';
import { 
    Paper, 
    TextField, 
    Button, 
    Grid, 
    Typography,
    Box
} from '@mui/material';

const AddAlbumForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        year: '',
        cover_image: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            title: '',
            artist: '',
            year: '',
            cover_image: ''
        });
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Add New Album
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Album Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Artist"
                            name="artist"
                            value={formData.artist}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Year"
                            name="year"
                            type="number"
                            value={formData.year}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Cover Image URL"
                            name="cover_image"
                            value={formData.cover_image}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button 
                                type="button" 
                                variant="outlined" 
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary"
                            >
                                Add Album
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default AddAlbumForm;