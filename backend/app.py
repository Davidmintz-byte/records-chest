from flask import Flask, request, jsonify, make_response, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import os
import time
from werkzeug.utils import secure_filename
from os import environ
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Get environment variables first
DATABASE_URL = environ.get('DATABASE_URL', 'sqlite:///record_chest.db')
JWT_SECRET_KEY = environ.get('JWT_SECRET_KEY', 'your-secret-key')
FRONTEND_URL = environ.get('FRONTEND_URL', 'http://localhost:3000')

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "https://records-chest.onrender.com"],  # Add your Render domain
        "methods": ["GET", "POST", "DELETE", "OPTIONS", "PUT"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Configuration for file uploads
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Basic configurations
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create uploads directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Add this decorator to handle OPTIONS requests globally
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        if request.headers.get('Origin') in ["http://localhost:3000", "https://records-chest.onrender.com"]:
            response.headers.add("Access-Control-Allow-Origin", request.headers.get('Origin'))
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS, PUT")
        return response

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)

class Album(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    artist = db.Column(db.String(120), nullable=False)
    year = db.Column(db.Integer)
    genre = db.Column(db.String(50))
    apple_music_link = db.Column(db.String(200))
    artwork = db.Column(db.String(500))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tags = db.relationship('Tag', backref='album', lazy=True, cascade="all, delete-orphan")

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    album_id = db.Column(db.Integer, db.ForeignKey('album.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# API Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.email)
        return jsonify(access_token=access_token), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/upload-image', methods=['POST'])
@jwt_required()
def upload_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
            
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to filename to make it unique
            filename = f"{int(time.time())}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Return the path that will be used to serve the image
            return jsonify({'imageUrl': f'/uploads/{filename}'}), 200
            
    except Exception as e:
        print(f"Error uploading image: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/albums/<int:album_id>', methods=['PUT'])
@jwt_required()
def update_album(album_id):
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        
        # Check if album exists and belongs to user
        album = Album.query.filter_by(id=album_id, user_id=user.id).first()
        if not album:
            return jsonify({"error": "Album not found"}), 404

        data = request.get_json()
        
        # Update album fields
        album.name = data['name']
        album.artist = data['artist']
        album.year = data.get('year')
        album.genre = data.get('genre')
        album.apple_music_link = data.get('apple_music_link')
        album.artwork = data.get('artwork')
        
        db.session.commit()
        
        return jsonify({"message": "Album updated successfully"}), 200
        
    except Exception as e:
        print(f"Error updating album: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/albums', methods=['GET'])
@jwt_required()
def get_albums():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        albums = Album.query.filter_by(user_id=user.id).all()
        albums_data = [{
            'id': album.id,
            'name': album.name,
            'artist': album.artist,
            'year': album.year,
            'genre': album.genre,
            'apple_music_link': album.apple_music_link,
            'artwork': album.artwork,
            'tags': [{'id': tag.id, 'name': tag.name} for tag in album.tags]
        } for album in albums]
        
        return jsonify(albums_data)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/fetch-album-data', methods=['POST'])
@jwt_required()
def fetch_album_data():
    try:
        logger.debug("Starting fetch_album_data")
        data = request.get_json()
        url = data['url']
        logger.debug(f"Fetching data for URL: {url}")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        logger.debug(f"Apple Music response status: {response.status_code}")
        logger.debug("Successfully parsed HTML")

        soup = BeautifulSoup(response.text, 'html.parser')
        
        title_meta = soup.find('meta', property='og:title')
        logger.debug(f"Found title meta: {title_meta}")

        description_meta = soup.find('meta', property='og:description')
        image_meta = soup.find('meta', property='og:image')
        logger.debug(f"Found description meta: {description_meta}")        
        title_content = title_meta['content']
        album_name = title_content.split(' by ')[0]
        artist = title_content.split(' by ')[1].split(' on ')[0]
        
        year = None
        if description_meta:
            description = description_meta['content']
            if ' · ' in description:
                year_part = description.split(' · ')[1]
                if year_part.isdigit():
                    year = year_part

        artwork_url = image_meta['content'] if image_meta else None
        logger.debug(f"Found image meta: {artwork_url}")

        
        result = {
            'name': album_name,
            'artist': artist,
            'year': year,
            'genre': None,
            'artwork': artwork_url
        }
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in fetch_album_data: {str(e)}")
        return jsonify({"error": f"Failed to fetch album data: {str(e)}"}), 500


@app.route('/add_album', methods=['POST'])
@jwt_required()
def add_album():
    data = request.get_json()
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    
    new_album = Album(
        name=data['name'],
        artist=data['artist'],
        year=data.get('year'),
        genre=data.get('genre'),
        apple_music_link=data.get('appleMusicLink'),
        artwork=data.get('artwork'),  # Add this line
        user_id=user.id
    )
    
    db.session.add(new_album)
    db.session.commit()
    
    return jsonify({"message": "Album added successfully"}), 201

@app.route('/albums/<int:album_id>/tags', methods=['POST'])
@jwt_required()
def add_tag(album_id):
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({"error": "User not found"}), 401
            
        album = Album.query.filter_by(id=album_id, user_id=user.id).first()
        if not album:
            return jsonify({"error": "Album not found"}), 404

        data = request.get_json()
        tag_name = data.get('name')
        if not tag_name:
            return jsonify({"error": "Tag name is required"}), 400

        new_tag = Tag(
            name=tag_name,
            album_id=album_id,
            user_id=user.id
        )
        
        db.session.add(new_tag)
        db.session.commit()
        
        return jsonify({
            "message": "Tag added successfully",
            "id": new_tag.id,
            "name": new_tag.name
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/albums/<int:album_id>/tags/<int:tag_id>', methods=['DELETE'])
@jwt_required()
def remove_tag(album_id, tag_id):
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        
        # Check if tag exists and belongs to user
        tag = Tag.query.filter_by(
            id=tag_id, 
            album_id=album_id, 
            user_id=user.id
        ).first()
        
        if not tag:
            return jsonify({"error": "Tag not found"}), 404

        db.session.delete(tag)
        db.session.commit()
        
        return jsonify({"message": "Tag removed successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user/tags', methods=['GET'])
@jwt_required()
def get_user_tags():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        
        # Get unique tag names for this user
        tags = db.session.query(Tag.name).distinct().filter_by(user_id=user.id).all()
        tag_names = [tag[0] for tag in tags]  # Convert from tuple to string
        
        return jsonify(tag_names), 200
        
    except Exception as e:
        logger.error(f"Error fetching tags: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Debug route to help us understand file structure
@app.route('/debug-files')
def debug_files():
    try:
        current_dir = os.getcwd()
        structure = {
            'current_directory': current_dir,
            'contents': os.listdir(current_dir),
            'frontend_exists': os.path.exists('frontend'),
            'frontend_build_exists': os.path.exists('frontend/build'),
            'static_exists': os.path.exists('frontend/build/static'),
        }
        
        if os.path.exists('frontend/build'):
            structure['build_contents'] = os.listdir('frontend/build')
            if os.path.exists('frontend/build/static'):
                structure['static_contents'] = os.listdir('frontend/build/static')
                
        return jsonify(structure)
    except Exception as e:
        return jsonify({
            'error': str(e),
            'current_dir': os.getcwd()
        })

# Route specifically for static files
@app.route('/static/<folder>/<path:filename>')
def serve_static_files(folder, filename):
    try:
        logger.debug(f"Serving static {folder} file: {filename}")
        return send_from_directory(f'frontend/build/static/{folder}', filename)
    except Exception as e:
        logger.error(f"Error serving static file: {str(e)}")
        return str(e), 500

@app.route('/')
def serve_frontend():
    try:
        logger.debug("Serving index.html")
        return send_from_directory('frontend/build', 'index.html')
    except Exception as e:
        logger.error(f"Error serving index: {str(e)}")
        return str(e), 500

@app.route('/<path:path>')
def serve_frontend_static(path):
    try:
        logger.debug(f"Trying to serve: {path}")
        if os.path.exists(os.path.join('frontend/build', path)):
            directory = os.path.dirname(path) or '.'
            filename = os.path.basename(path)
            return send_from_directory('frontend/build', path)
        return send_from_directory('frontend/build', 'index.html')
    except Exception as e:
        logger.error(f"Error serving {path}: {str(e)}")
        return str(e), 500

if __name__ == '__main__':
    app.run(debug=True)