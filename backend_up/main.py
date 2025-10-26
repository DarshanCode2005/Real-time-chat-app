from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from datetime import datetime
import json
import sqlite3
from pydantic import BaseModel
import asyncio

app = FastAPI(title="Real-Time Chat API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
def init_db():
    conn = sqlite3.connect('chat.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Models
class Message(BaseModel):
    username: str
    message: str
    timestamp: str

class MessageResponse(BaseModel):
    id: int
    username: str
    message: str
    timestamp: str

# Connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.users: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.users[websocket] = username
        
        # Notify all users
        await self.broadcast({
            "type": "user_joined",
            "username": username,
            "timestamp": datetime.now().isoformat(),
            "online_users": list(self.users.values())
        })

    def disconnect(self, websocket: WebSocket):
        username = self.users.get(websocket)
        self.active_connections.remove(websocket)
        if websocket in self.users:
            del self.users[websocket]
        return username

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

manager = ConnectionManager()

# Database functions
def save_message(username: str, message: str, timestamp: str):
    conn = sqlite3.connect('chat.db')
    c = conn.cursor()
    c.execute('INSERT INTO messages (username, message, timestamp) VALUES (?, ?, ?)',
              (username, message, timestamp))
    conn.commit()
    message_id = c.lastrowid
    conn.close()
    return message_id

def get_chat_history(limit: int = 50):
    conn = sqlite3.connect('chat.db')
    c = conn.cursor()
    c.execute('SELECT id, username, message, timestamp FROM messages ORDER BY id DESC LIMIT ?', (limit,))
    messages = [
        {"id": row[0], "username": row[1], "message": row[2], "timestamp": row[3]}
        for row in c.fetchall()
    ]
    conn.close()
    return list(reversed(messages))

# REST endpoints
@app.get("/")
async def root():
    return {"message": "Real-Time Chat API", "status": "running"}

@app.get("/api/messages", response_model=List[MessageResponse])
async def get_messages(limit: int = 50):
    """Get chat history"""
    return get_chat_history(limit)

@app.get("/api/online-users")
async def get_online_users():
    """Get list of online users"""
    return {"users": list(manager.users.values()), "count": len(manager.users)}

# WebSocket endpoint
@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await manager.connect(websocket, username)
    
    try:
        # Send chat history to new user
        history = get_chat_history(50)
        await manager.send_personal_message({
            "type": "history",
            "messages": history
        }, websocket)
        
        # Listen for messages
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            timestamp = datetime.now().isoformat()
            
            # Save to database
            message_id = save_message(username, message_data['message'], timestamp)
            
            # Broadcast to all clients
            await manager.broadcast({
                "type": "message",
                "id": message_id,
                "username": username,
                "message": message_data['message'],
                "timestamp": timestamp
            })
            
    except WebSocketDisconnect:
        username = manager.disconnect(websocket)
        await manager.broadcast({
            "type": "user_left",
            "username": username,
            "timestamp": datetime.now().isoformat(),
            "online_users": list(manager.users.values())
        })
    except Exception as e:
        print(f"Error: {e}")
        username = manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)