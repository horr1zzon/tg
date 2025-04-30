
from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import os

app = Flask(__name__, static_folder='static')
DB = "players.db"

def init_db():
    with sqlite3.connect(DB) as conn:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS nicknames (
                name TEXT PRIMARY KEY
            )
        """)
        conn.commit()

@app.route("/check_nickname", methods=["POST"])
def check_nickname():
    data = request.get_json()
    name = data.get("name", "").strip()
    with sqlite3.connect(DB) as conn:
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM nicknames WHERE name = ?", (name,))
        exists = cur.fetchone()
        return jsonify({"available": not bool(exists)})

@app.route("/register_nickname", methods=["POST"])
def register_nickname():
    data = request.get_json()
    name = data.get("name", "").strip()
    try:
        with sqlite3.connect(DB) as conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO nicknames (name) VALUES (?)", (name,))
            conn.commit()
        return jsonify({"success": True})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "error": "Имя уже занято"})

@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory("static", path)

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000)
