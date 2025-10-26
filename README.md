# 💬 Real-Time Chat Application

A modern, real-time chat application built with React and FastAPI, featuring WebSocket connections, message persistence, and a beautiful responsive UI.

## ✨ Features

- **Real-time messaging** with WebSocket connections
- **Message persistence** using SQLite database
- **Online user tracking** with live user count
- **Chat history** - view previous messages when joining
- **Responsive design** - works on desktop and mobile
- **Modern UI** - built with Tailwind CSS
- **System notifications** - join/leave notifications
- **Auto-scroll** - automatically scrolls to latest messages

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **WebSockets** - Real-time bidirectional communication
- **SQLite** - Lightweight database for message storage
- **Pydantic** - Data validation and settings management
- **Uvicorn** - ASGI server for running the application

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **WebSocket API** - Native browser WebSocket support

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Chat Application
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   python -m venv myenv
   
   # On Windows
   myenv\Scripts\activate
   
   # On macOS/Linux
   source myenv/bin/activate
   
   pip install -r requirements.txt
   ```

3. **Set up the Frontend**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   python main.py
   ```
   The API will be available at `http://localhost:8000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## 📁 Project Structure

```
Chat Application/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── Procfile            # Deployment configuration
│   ├── .gitignore          # Git ignore rules
│   └── myenv/              # Virtual environment
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── App.css         # Component styles
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles
│   ├── index.html          # HTML template
│   ├── package.json        # Node.js dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS config
│   └── postcss.config.js   # PostCSS configuration
└── README.md               # This file
```

## 🔧 API Endpoints

### REST API
- `GET /` - API status and information
- `GET /api/messages` - Get chat history (limit: 50 messages)
- `GET /api/online-users` - Get list of online users

### WebSocket
- `WS /ws/{username}` - Real-time chat connection

## 🌐 Deployment

### Railway (Recommended)
1. Push your code to GitHub
2. Connect your repository to Railway
3. Create two services:
   - Backend: Set root directory to `backend`
   - Frontend: Set root directory to `frontend`
4. Update WebSocket URL in frontend to your backend URL

### Other Platforms
- **Render**: Good for both frontend and backend
- **Vercel + Railway**: Frontend on Vercel, backend on Railway
- **Heroku**: Traditional PaaS option

## 🔒 Environment Variables

For production deployment, consider setting these environment variables:

```env
# Backend
DATABASE_URL=your_database_url
CORS_ORIGINS=your_frontend_url

# Frontend
VITE_API_URL=your_backend_url
```

## 🎨 Customization

### Styling
The app uses Tailwind CSS. You can customize the design by modifying:
- `frontend/src/App.css` - Component-specific styles
- `frontend/tailwind.config.js` - Tailwind configuration

### Features
- Add user authentication
- Implement private messaging
- Add file sharing
- Include emoji reactions
- Add message editing/deletion

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

**Happy Chatting! 💬**
