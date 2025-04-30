from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import os

app = Flask(__name__, static_folder='static')
DB = "players.db"

def init_db():
    with sqlite3.connect(DB) as conn:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS players (
                telegram_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                coins INTEGER DEFAULT 0,
                health INTEGER DEFAULT 100,
                inventory TEXT DEFAULT '{}'
            )
        """)
        conn.commit()

@app.route("/auth", methods=["POST"])
def auth():
    data = request.get_json()
    telegram_id = data.get("telegram_id")

    if not telegram_id:
        return jsonify({"error": "Missing telegram_id"}), 400

    with sqlite3.connect(DB) as conn:
        cur = conn.cursor()
        cur.execute("SELECT name, coins, health, inventory FROM players WHERE telegram_id = ?", (telegram_id,))
        player = cur.fetchone()

        if player:
            name, coins, health, inventory = player
            return jsonify({
                "status": "ok",
                "name": name,
                "coins": coins,
                "health": health,
                "inventory": inventory
            })
        else:
            return jsonify({"status": "new"})

@app.route("/check_nickname", methods=["POST"])
def check_nickname():
    data = request.get_json()
    name = data.get("name", "").strip()
    with sqlite3.connect(DB) as conn:
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM players WHERE name = ?", (name,))
        exists = cur.fetchone()
        return jsonify({"available": not bool(exists)})

@app.route("/register_nickname", methods=["POST"])
def register_nickname():
    data = request.get_json()
    telegram_id = data.get("telegram_id")
    name = data.get("name", "").strip()

    if not telegram_id or not name:
        return jsonify({"success": False, "error": "Missing telegram_id or name"}), 400

    try:
        with sqlite3.connect(DB) as conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO players (telegram_id, name) VALUES (?, ?)", (telegram_id, name))
            conn.commit()
        return jsonify({"success": True})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "error": "Имя уже занято или пользователь уже существует"})

@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory("static", path)

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000)
