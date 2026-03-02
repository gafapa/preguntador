/**
 * HostConnection — PeerJS host that accepts player connections
 */
import { Peer } from 'peerjs';

const PEER_PREFIX = 'preguntador-';

export class HostConnection {
    constructor() {
        this.peer = null;
        this.connections = new Map(); // peerId -> DataConnection
        this.listeners = new Set();
        this.roomCode = '';
    }

    on(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    emit(event, data) {
        this.listeners.forEach((fn) => fn(event, data));
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    async create() {
        return new Promise((resolve, reject) => {
            this.roomCode = this.generateRoomCode();
            const peerId = PEER_PREFIX + this.roomCode.toLowerCase();

            this.peer = new Peer(peerId, {
                debug: 0,
            });

            this.peer.on('open', (id) => {
                console.log('[Host] Peer open:', id);
                this.emit('room-created', { code: this.roomCode });
                resolve(this.roomCode);
            });

            this.peer.on('connection', (conn) => {
                console.log('[Host] Incoming connection:', conn.peer);
                conn.on('open', () => {
                    this.connections.set(conn.peer, conn);
                    conn.on('data', (data) => {
                        this.emit('message', { peerId: conn.peer, ...data });
                    });
                    conn.on('close', () => {
                        this.connections.delete(conn.peer);
                        this.emit('player-disconnected', { peerId: conn.peer });
                    });
                });
            });

            this.peer.on('error', (err) => {
                console.error('[Host] Peer error:', err);
                if (err.type === 'unavailable-id') {
                    // Room code collision, try again
                    this.peer.destroy();
                    this.create().then(resolve).catch(reject);
                } else {
                    this.emit('error', { error: err });
                    reject(err);
                }
            });
        });
    }

    broadcast(data) {
        this.connections.forEach((conn) => {
            if (conn.open) {
                conn.send(data);
            }
        });
    }

    sendTo(peerId, data) {
        const conn = this.connections.get(peerId);
        if (conn && conn.open) {
            conn.send(data);
        }
    }

    getConnectionCount() {
        return this.connections.size;
    }

    destroy() {
        this.connections.forEach((conn) => conn.close());
        this.connections.clear();
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }
}
